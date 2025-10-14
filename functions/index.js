/**
 * Firebase Cloud Functions for Block Racers Online
 * Server-side validation and business logic
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.database();

/**
 * Validate and save speedrun time
 * Prevents cheating by validating times server-side
 */
exports.submitTime = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to submit times'
    );
  }

  const { mapId, time } = data;
  const uid = context.auth.uid;

  // Validate inputs
  if (!mapId || typeof mapId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid map ID');
  }

  if (typeof time !== 'number' || time <= 0 || time > 3600000) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid time value');
  }

  // Anti-cheat: Check for suspiciously fast times
  if (time < 1000) {
    console.warn(`Suspicious time detected: ${time}ms by user ${uid} on map ${mapId}`);
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Time is suspiciously fast'
    );
  }

  try {
    // Get username
    const userSnapshot = await db.ref(`users/${uid}`).once('value');
    const userData = userSnapshot.val();

    if (!userData || !userData.username) {
      throw new functions.https.HttpsError('not-found', 'User profile not found');
    }

    const username = userData.username;
    const timestamp = Date.now();

    // Save to times history
    const historyRef = db.ref(`times_history/${uid}/${mapId}`).push();
    await historyRef.set({
      time,
      timestamp,
      username,
      verified: true // Marked as server-verified
    });

    // Check if this is a personal best
    const scoresRef = db.ref(`scores/${mapId}/${uid}`);
    const currentBestSnapshot = await scoresRef.once('value');
    const currentBest = currentBestSnapshot.val();

    if (!currentBest || time < currentBest.time) {
      // New personal best - update leaderboard
      await scoresRef.set({
        username,
        time,
        timestamp,
        verified: true
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
  } catch (error) {
    console.error('Error submitting time:', error);
    throw new functions.https.HttpsError('internal', 'Failed to submit time');
  }
});

/**
 * Award credits to player
 * Validates credit awards to prevent inflation
 */
exports.awardCredits = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount, reason } = data;
  const uid = context.auth.uid;

  // Validate amount
  if (typeof amount !== 'number' || amount <= 0 || amount > 1000) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid credit amount (max 1000 per transaction)'
    );
  }

  if (!Number.isInteger(amount)) {
    throw new functions.https.HttpsError('invalid-argument', 'Credits must be whole numbers');
  }

  try {
    const playerRef = db.ref(`players/${uid}`);
    const snapshot = await playerRef.once('value');
    const playerData = snapshot.val() || {};

    const currentCredits = playerData.credits || 0;
    const newCredits = currentCredits + amount;

    await playerRef.update({
      credits: newCredits,
      lastCreditAward: {
        amount,
        reason: reason || 'unknown',
        timestamp: Date.now()
      }
    });

    // Log the transaction for audit
    await db.ref(`credit_transactions/${uid}`).push({
      type: 'award',
      amount,
      reason,
      timestamp: Date.now(),
      balance: newCredits
    });

    return {
      success: true,
      newBalance: newCredits,
      awarded: amount
    };
  } catch (error) {
    console.error('Error awarding credits:', error);
    throw new functions.https.HttpsError('internal', 'Failed to award credits');
  }
});

/**
 * Transfer credits between accounts (BASE system)
 */
exports.transferCredits = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { fromType, toType, amount } = data;
  const uid = context.auth.uid;

  // Validate types
  const validTypes = ['onhand', 'secure'];
  if (!validTypes.includes(fromType) || !validTypes.includes(toType)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid transfer type');
  }

  if (fromType === toType) {
    throw new functions.https.HttpsError('invalid-argument', 'Cannot transfer to same type');
  }

  // Validate amount
  if (typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid amount');
  }

  try {
    const playerRef = db.ref(`players/${uid}`);

    return await db.ref().transaction(async () => {
      const snapshot = await playerRef.once('value');
      const playerData = snapshot.val() || {};

      const fromKey = fromType === 'onhand' ? 'credits' : 'secureCredits';
      const toKey = toType === 'onhand' ? 'credits' : 'secureCredits';

      const fromBalance = playerData[fromKey] || 0;
      const toBalance = playerData[toKey] || 0;

      // Check sufficient funds
      if (fromBalance < amount) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Insufficient funds'
        );
      }

      // Perform transfer
      await playerRef.update({
        [fromKey]: fromBalance - amount,
        [toKey]: toBalance + amount
      });

      // Log transaction
      await db.ref(`credit_transactions/${uid}`).push({
        type: 'transfer',
        from: fromType,
        to: toType,
        amount,
        timestamp: Date.now()
      });

      return {
        success: true,
        fromBalance: fromBalance - amount,
        toBalance: toBalance + amount
      };
    });
  } catch (error) {
    console.error('Error transferring credits:', error);
    throw new functions.https.HttpsError('internal', 'Failed to transfer credits');
  }
});

/**
 * Purchase cosmetic item
 */
exports.purchaseCosmetic = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { cosmeticId, price } = data;
  const uid = context.auth.uid;

  // Validate inputs
  if (!cosmeticId || typeof price !== 'number' || price < 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid purchase data');
  }

  try {
    const playerRef = db.ref(`players/${uid}`);
    const snapshot = await playerRef.once('value');
    const playerData = snapshot.val() || {};

    // Check if already owned
    if (playerData.ownedCosmetics && playerData.ownedCosmetics[cosmeticId]) {
      throw new functions.https.HttpsError(
        'already-exists',
        'Cosmetic already owned'
      );
    }

    // Check sufficient credits
    const credits = playerData.credits || 0;
    if (credits < price) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Insufficient credits'
      );
    }

    // Purchase cosmetic
    await playerRef.update({
      credits: credits - price,
      [`ownedCosmetics/${cosmeticId}`]: true
    });

    // Log transaction
    await db.ref(`credit_transactions/${uid}`).push({
      type: 'purchase',
      item: cosmeticId,
      amount: -price,
      timestamp: Date.now()
    });

    return {
      success: true,
      newBalance: credits - price
    };
  } catch (error) {
    console.error('Error purchasing cosmetic:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to purchase cosmetic');
  }
});

/**
 * Validate level data before saving
 */
exports.saveLevel = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { levelData, name } = data;
  const uid = context.auth.uid;

  // Validate level name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid level name');
  }

  if (name.length > 50) {
    throw new functions.https.HttpsError('invalid-argument', 'Level name too long');
  }

  // Validate level data structure
  if (!levelData || typeof levelData !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid level data');
  }

  if (!levelData.platforms || !Array.isArray(levelData.platforms)) {
    throw new functions.https.HttpsError('invalid-argument', 'Level must have platforms');
  }

  // Limit level size
  const maxPlatforms = 1000;
  if (levelData.platforms.length > maxPlatforms) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Level too large (max ${maxPlatforms} platforms)`
    );
  }

  try {
    // Get username
    const userSnapshot = await db.ref(`users/${uid}`).once('value');
    const userData = userSnapshot.val();

    const levelRef = db.ref('levels').push();
    await levelRef.set({
      name: name.trim(),
      creator: userData.username || 'Unknown',
      creatorUid: uid,
      levelData,
      createdAt: Date.now(),
      plays: 0,
      likes: 0
    });

    return {
      success: true,
      levelId: levelRef.key
    };
  } catch (error) {
    console.error('Error saving level:', error);
    throw new functions.https.HttpsError('internal', 'Failed to save level');
  }
});

/**
 * Get leaderboard with pagination
 */
exports.getLeaderboard = functions.https.onCall(async (data, context) => {
  const { mapId, limit = 100, orderBy = 'time' } = data;

  if (!mapId) {
    throw new functions.https.HttpsError('invalid-argument', 'Map ID required');
  }

  const limitNum = Math.min(Math.max(1, limit), 100); // Between 1-100

  try {
    const scoresRef = db.ref(`scores/${mapId}`);
    const snapshot = await scoresRef
      .orderByChild(orderBy)
      .limitToFirst(limitNum)
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
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch leaderboard');
  }
});
