/**
 * Firebase initialization and management
 * Centralizes all Firebase-related functionality
 */

class FirebaseManager {
  constructor() {
    this.app = null;
    this.auth = null;
    this.database = null;
    this.initialized = false;
  }

  /**
   * Initialize Firebase with configuration
   * @param {Object} config - Firebase configuration object
   * @returns {Promise<boolean>} Success status
   */
  async init(config) {
    if (this.initialized) {
      console.warn('Firebase already initialized');
      return true;
    }

    try {
      // Initialize Firebase
      this.app = firebase.initializeApp(config);
      this.auth = firebase.auth();
      this.database = firebase.database();

      // Set auth persistence to SESSION by default
      await this.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);

      this.initialized = true;
      console.log('Firebase initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      throw new Error('Firebase initialization failed: ' + error.message);
    }
  }

  /**
   * Get Firebase Auth instance
   * @returns {firebase.auth.Auth}
   */
  getAuth() {
    this.ensureInitialized();
    return this.auth;
  }

  /**
   * Get Firebase Database instance
   * @returns {firebase.database.Database}
   */
  getDatabase() {
    this.ensureInitialized();
    return this.database;
  }

  /**
   * Get Firebase App instance
   * @returns {firebase.app.App}
   */
  getApp() {
    this.ensureInitialized();
    return this.app;
  }

  /**
   * Ensure Firebase is initialized before use
   * @throws {Error} If not initialized
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('Firebase not initialized. Call init() first.');
    }
  }

  /**
   * Get database reference with error handling
   * @param {string} path - Database path
   * @returns {firebase.database.Reference}
   */
  ref(path) {
    this.ensureInitialized();
    return this.database.ref(path);
  }

  /**
   * Sign in user with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<firebase.auth.UserCredential>}
   */
  async signIn(email, password) {
    this.ensureInitialized();
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      return userCredential;
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  /**
   * Create new user account
   * @param {string} email
   * @param {string} password
   * @returns {Promise<firebase.auth.UserCredential>}
   */
  async createAccount(email, password) {
    this.ensureInitialized();
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      return userCredential;
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  /**
   * Sign out current user
   * @returns {Promise<void>}
   */
  async signOut() {
    this.ensureInitialized();
    try {
      await this.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Get current user
   * @returns {firebase.User | null}
   */
  getCurrentUser() {
    this.ensureInitialized();
    return this.auth.currentUser;
  }

  /**
   * Listen for auth state changes
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChanged(callback) {
    this.ensureInitialized();
    return this.auth.onAuthStateChanged(callback);
  }

  /**
   * Handle authentication errors with user-friendly messages
   * @param {Error} error
   */
  handleAuthError(error) {
    const errorMessages = {
      'auth/user-not-found': 'This account does not exist',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-email': 'Invalid email address',
      'auth/invalid-credential': 'Invalid credentials',
      'auth/email-already-in-use': 'Username already taken',
      'auth/weak-password': 'Password must be at least 6 characters',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later',
      'auth/network-request-failed': 'Network error. Please check your connection',
      'auth/operation-not-allowed': 'Account creation is currently disabled'
    };

    const message = errorMessages[error.code] || 'Authentication failed';
    console.error('Auth error:', error.code, message);
  }
}

// Create singleton instance
const firebaseManager = new FirebaseManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = firebaseManager;
}
