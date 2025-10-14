/**
 * Browser-compatible configuration loader
 * Loads Firebase config without requiring .env files in browser
 */

// Simple configuration that will be loaded
// In production, this should be served from a secure endpoint
// For now, we'll use the existing config but with better structure

window.AppConfig = {
  // Firebase configuration
  // TODO: Move these to a secure server endpoint in production
  firebase: {
    apiKey: "AIzaSyBLkFMipRS631fDNr8uwgozmxXBnqLd5_o",
    authDomain: "base-control-b391e.firebaseapp.com",
    databaseURL: "https://base-control-b391e-default-rtdb.firebaseio.com",
    projectId: "base-control-b391e",
    storageBucket: "base-control-b391e.firebasestorage.app",
    messagingSenderId: "116375376675",
    appId: "1:116375376675:web:cdc8688222c7c35accf296",
    measurementId: "G-JY7P6D49HM"
  },

  // Admin configuration
  admin: {
    passwordHash: btoa('a1b2c3'), // TODO: Replace with proper hashing
    emails: [
      'malonetobinkai@gmail.com',
      'tmalone01@4j.lane.edu'
    ]
  },

  // Feature flags
  features: {
    useCloudFunctions: true,  // Use server-side validation
    enableErrorLogging: true,
    enableLoadingStates: true,
    antiCheatEnabled: true
  },

  // Environment detection
  isDevelopment: function() {
    return window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  },

  isProduction: function() {
    return !this.isDevelopment();
  }
};

// Helper to initialize Firebase with config
window.initializeFirebase = async function() {
  if (typeof firebase === 'undefined') {
    throw new Error('Firebase SDK not loaded');
  }

  try {
    // Initialize Firebase
    const app = firebase.initializeApp(window.AppConfig.firebase);

    // Set auth persistence to SESSION
    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

    console.log('✅ Firebase initialized successfully');
    return {
      app: app,
      auth: firebase.auth(),
      database: firebase.database(),
      functions: firebase.functions()
    };
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
};

// Helper to show user-friendly errors
window.showError = function(message, type = 'error') {
  const colors = {
    error: 'rgba(255,0,0,0.9)',
    warning: 'rgba(255,165,0,0.9)',
    info: 'rgba(79,172,254,0.9)',
    success: 'rgba(76,175,80,0.9)'
  };

  let container = document.getElementById('error-notifications');
  if (!container) {
    container = document.createElement('div');
    container.id = 'error-notifications';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
    `;
    document.body.appendChild(container);
  }

  const notification = document.createElement('div');
  notification.style.cssText = `
    background: ${colors[type]};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    margin-bottom: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    cursor: pointer;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;

  // Add animation
  if (!document.getElementById('error-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'error-notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  container.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  }, 5000);

  // Click to dismiss
  notification.addEventListener('click', () => notification.remove());
};

// Helper to show loading overlay
window.showLoading = function(message = 'Loading...') {
  let overlay = document.getElementById('global-loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'global-loading-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      backdrop-filter: blur(5px);
    `;
    document.body.appendChild(overlay);

    // Add spinner style
    if (!document.getElementById('loading-spinner-styles')) {
      const style = document.createElement('style');
      style.id = 'loading-spinner-styles';
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  overlay.innerHTML = `
    <div style="text-align: center;">
      <div style="
        width: 60px;
        height: 60px;
        border: 5px solid rgba(79, 172, 254, 0.3);
        border-top-color: #4facfe;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      "></div>
      <div style="color: white; font-size: 20px; font-weight: bold;">
        ${message}
      </div>
    </div>
  `;
};

// Helper to hide loading overlay
window.hideLoading = function() {
  const overlay = document.getElementById('global-loading-overlay');
  if (overlay) {
    overlay.remove();
  }
};

// Validation helpers
window.Validators = {
  validateUsername: function(username) {
    if (!username || typeof username !== 'string') {
      return { valid: false, error: 'Username is required' };
    }
    const trimmed = username.trim();
    if (trimmed.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters' };
    }
    if (trimmed.length > 10) {
      return { valid: false, error: 'Username must be 10 characters or less' };
    }
    if (!/^[a-zA-Z0-9]+$/.test(trimmed)) {
      return { valid: false, error: 'Username can only contain letters and numbers' };
    }
    return { valid: true, value: trimmed };
  },

  validatePassword: function(password) {
    if (!password || typeof password !== 'string') {
      return { valid: false, error: 'Password is required' };
    }
    if (password.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters' };
    }
    return { valid: true };
  },

  validateTime: function(time) {
    if (typeof time !== 'number' || isNaN(time)) {
      return { valid: false, error: 'Invalid time value' };
    }
    if (time <= 0) {
      return { valid: false, error: 'Time must be greater than 0' };
    }
    if (time > 3600000) {
      return { valid: false, error: 'Time exceeds maximum (1 hour)' };
    }
    if (time < 1000) {
      return { valid: false, error: 'Time is suspiciously fast', suspicious: true };
    }
    return { valid: true };
  }
};

console.log('✅ Configuration loader ready');
