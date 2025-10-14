/**
 * Global error handling and logging
 */

class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.listeners = [];
  }

  /**
   * Log an error
   * @param {Error|string} error
   * @param {Object} context - Additional context
   */
  log(error, context = {}) {
    const errorObj = {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : new Error().stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.errors.push(errorObj);

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (window.location.hostname === 'localhost') {
      console.error('Error logged:', errorObj);
    }

    // Notify listeners
    this.notifyListeners(errorObj);
  }

  /**
   * Show user-friendly error message
   * @param {string} message
   * @param {string} type - 'error' | 'warning' | 'info'
   */
  showUser(message, type = 'error') {
    // Find or create notification container
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

    // Create notification
    const notification = document.createElement('div');
    notification.className = `error-notification error-${type}`;
    notification.style.cssText = `
      background: ${type === 'error' ? 'rgba(255,0,0,0.9)' : type === 'warning' ? 'rgba(255,165,0,0.9)' : 'rgba(79,172,254,0.9)'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      margin-bottom: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
      cursor: pointer;
    `;
    notification.textContent = message;

    // Add animation
    const style = document.createElement('style');
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
    if (!document.getElementById('error-handler-styles')) {
      style.id = 'error-handler-styles';
      document.head.appendChild(style);
    }

    container.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 5000);

    // Click to dismiss
    notification.addEventListener('click', () => {
      notification.remove();
    });
  }

  /**
   * Add error listener
   * @param {Function} callback
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify all listeners of new error
   * @param {Object} error
   */
  notifyListeners(error) {
    this.listeners.forEach(callback => {
      try {
        callback(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }

  /**
   * Get all logged errors
   * @returns {Array}
   */
  getErrors() {
    return [...this.errors];
  }

  /**
   * Clear all logged errors
   */
  clear() {
    this.errors = [];
  }

  /**
   * Handle promise rejection
   * @param {Error} error
   */
  handleRejection(error) {
    this.log(error, { type: 'unhandled_rejection' });
    this.showUser('An unexpected error occurred. Please try again.', 'error');
  }

  /**
   * Handle uncaught exception
   * @param {Error} error
   */
  handleException(error) {
    this.log(error, { type: 'uncaught_exception' });
    this.showUser('A critical error occurred. Please refresh the page.', 'error');
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Set up global error handlers
window.addEventListener('error', (event) => {
  errorHandler.handleException(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  errorHandler.handleRejection(event.reason);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = errorHandler;
}
