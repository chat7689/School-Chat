/**
 * Game helper functions with Cloud Function integration
 * Provides secure, server-validated game operations
 */

window.GameHelpers = {
  // Firebase instances (set after initialization)
  auth: null,
  database: null,
  functions: null,

  /**
   * Initialize game helpers with Firebase instances
   */
  init: function(firebaseInstances) {
    this.auth = firebaseInstances.auth;
    this.database = firebaseInstances.database;
    this.functions = firebaseInstances.functions;
    console.log('✅ Game helpers initialized');
  },

  /**
   * Submit time using Cloud Function (server-validated)
   */
  submitTime: async function(mapId, time) {
    if (!window.AppConfig.features.useCloudFunctions) {
      // Fallback to direct database write (not recommended)
      return await this.submitTimeDirectly(mapId, time);
    }

    try {
      showLoading('Submitting time...');

      // Validate time client-side first
      const validation = Validators.validateTime(time);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Call Cloud Function
      const submitTimeFunc = this.functions.httpsCallable('submitTime');
      const result = await submitTimeFunc({ mapId, time });

      hideLoading();

      if (result.data.newBest) {
        showError(`🎉 New personal best! ${this.formatTime(time)}`, 'success');
      }

      return result.data;
    } catch (error) {
      hideLoading();
      console.error('Error submitting time:', error);

      // Show user-friendly error
      if (error.code === 'invalid-argument') {
        showError('Invalid time submission. Please try again.', 'error');
      } else if (error.message.includes('suspicious')) {
        showError('Time too fast - possible cheat detected!', 'error');
      } else {
        showError('Failed to submit time. Please try again.', 'error');
      }

      throw error;
    }
  },

  /**
   * Fallback: Submit time directly to database (less secure)
   */
  submitTimeDirectly: async function(mapId, time) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const uid = user.uid;
    const username = await this.getUsername(uid);
    const timestamp = Date.now();

    // Save to times history
    const historyRef = this.database.ref(`times_history/${uid}/${mapId}`).push();
    await historyRef.set({
      time,
      timestamp,
      username,
      verified: false // Not server-verified
    });

    // Check if personal best
    const scoresRef = this.database.ref(`scores/${mapId}/${uid}`);
    const currentBestSnapshot = await scoresRef.once('value');
    const currentBest = currentBestSnapshot.val();

    if (!currentBest || time < currentBest.time) {
      await scoresRef.set({
        username,
        time,
        timestamp,
        verified: false
      });

      return {
        success: true,
        newBest: true,
        time,
        previousBest: currentBest ? currentBest.time : null
      };
    }

    return {
      success: true,
      newBest: false,
      time,
      currentBest: currentBest.time
    };
  },

  /**
   * Get username for user ID
   */
  getUsername: async function(uid) {
    const userSnapshot = await this.database.ref(`users/${uid}`).once('value');
    const userData = userSnapshot.val();
    if (userData && userData.username) {
      return userData.username;
    }
    // Fallback to email
    const user = this.auth.currentUser;
    return user ? user.email.split('@')[0] : 'Unknown';
  },

  /**
   * Format time in MM:SS.mmm format
   */
  formatTime: function(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  },

  /**
   * Award credits using Cloud Function
   */
  awardCredits: async function(amount, reason = 'game_reward') {
    if (!window.AppConfig.features.useCloudFunctions) {
      return await this.awardCreditsDirectly(amount, reason);
    }

    try {
      const awardCreditsFunc = this.functions.httpsCallable('awardCredits');
      const result = await awardCreditsFunc({ amount, reason });
      return result.data;
    } catch (error) {
      console.error('Error awarding credits:', error);
      showError('Failed to award credits', 'error');
      throw error;
    }
  },

  /**
   * Fallback: Award credits directly
   */
  awardCreditsDirectly: async function(amount, reason) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const playerRef = this.database.ref(`players/${user.uid}`);
    const snapshot = await playerRef.once('value');
    const playerData = snapshot.val() || {};

    const currentCredits = playerData.credits || 0;
    const newCredits = currentCredits + amount;

    await playerRef.update({
      credits: newCredits
    });

    return {
      success: true,
      newBalance: newCredits,
      awarded: amount
    };
  },

  /**
   * Purchase cosmetic using Cloud Function
   */
  purchaseCosmetic: async function(cosmeticId, price) {
    if (!window.AppConfig.features.useCloudFunctions) {
      return await this.purchaseCosmeticDirectly(cosmeticId, price);
    }

    try {
      showLoading('Processing purchase...');
      const purchaseFunc = this.functions.httpsCallable('purchaseCosmetic');
      const result = await purchaseFunc({ cosmeticId, price });
      hideLoading();
      showError('Purchase successful!', 'success');
      return result.data;
    } catch (error) {
      hideLoading();
      console.error('Purchase error:', error);

      if (error.code === 'already-exists') {
        showError('You already own this cosmetic', 'warning');
      } else if (error.code === 'failed-precondition') {
        showError('Insufficient credits', 'error');
      } else {
        showError('Purchase failed', 'error');
      }

      throw error;
    }
  },

  /**
   * Fallback: Purchase cosmetic directly
   */
  purchaseCosmeticDirectly: async function(cosmeticId, price) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const playerRef = this.database.ref(`players/${user.uid}`);
    const snapshot = await playerRef.once('value');
    const playerData = snapshot.val() || {};

    // Check if already owned
    if (playerData.ownedCosmetics && playerData.ownedCosmetics[cosmeticId]) {
      throw new Error('Already owned');
    }

    // Check credits
    const credits = playerData.credits || 0;
    if (credits < price) {
      throw new Error('Insufficient credits');
    }

    // Purchase
    await playerRef.update({
      credits: credits - price,
      [`ownedCosmetics/${cosmeticId}`]: true
    });

    return {
      success: true,
      newBalance: credits - price
    };
  },

  /**
   * Get leaderboard using Cloud Function
   */
  getLeaderboard: async function(mapId, limit = 100) {
    if (!window.AppConfig.features.useCloudFunctions) {
      return await this.getLeaderboardDirectly(mapId, limit);
    }

    try {
      const getLeaderboardFunc = this.functions.httpsCallable('getLeaderboard');
      const result = await getLeaderboardFunc({ mapId, limit });
      return result.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Fallback to direct fetch
      return await this.getLeaderboardDirectly(mapId, limit);
    }
  },

  /**
   * Fallback: Get leaderboard directly
   */
  getLeaderboardDirectly: async function(mapId, limit) {
    const scoresRef = this.database.ref(`scores/${mapId}`);
    const snapshot = await scoresRef
      .orderByChild('time')
      .limitToFirst(limit)
      .once('value');

    const leaderboard = [];
    let rank = 1;

    snapshot.forEach(childSnapshot => {
      leaderboard.push({
        rank,
        uid: childSnapshot.key,
        ...childSnapshot.val()
      });
      rank++;
    });

    return {
      mapId,
      leaderboard,
      count: leaderboard.length
    };
  }
};

console.log('✅ Game helpers loaded');
