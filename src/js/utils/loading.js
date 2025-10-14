/**
 * Loading state management
 */

class LoadingManager {
  constructor() {
    this.loadingStates = new Map();
    this.overlay = null;
  }

  /**
   * Show loading overlay
   * @param {string} message - Loading message
   * @param {string} key - Unique key for this loading operation
   */
  show(message = 'Loading...', key = 'default') {
    this.loadingStates.set(key, { message, startTime: Date.now() });
    this.renderOverlay();
  }

  /**
   * Hide loading overlay
   * @param {string} key - Unique key for this loading operation
   */
  hide(key = 'default') {
    this.loadingStates.delete(key);
    if (this.loadingStates.size === 0) {
      this.removeOverlay();
    } else {
      this.renderOverlay();
    }
  }

  /**
   * Check if currently loading
   * @param {string} key - Optional key to check specific operation
   * @returns {boolean}
   */
  isLoading(key = null) {
    if (key) {
      return this.loadingStates.has(key);
    }
    return this.loadingStates.size > 0;
  }

  /**
   * Render loading overlay
   */
  renderOverlay() {
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.id = 'global-loading-overlay';
      this.overlay.style.cssText = `
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
      document.body.appendChild(this.overlay);
    }

    // Get most recent loading message
    const states = Array.from(this.loadingStates.values());
    const latestState = states[states.length - 1];

    this.overlay.innerHTML = `
      <div style="text-align: center;">
        <div class="spinner" style="
          width: 60px;
          height: 60px;
          border: 5px solid rgba(79, 172, 254, 0.3);
          border-top-color: #4facfe;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        "></div>
        <div style="color: white; font-size: 20px; font-weight: bold;">
          ${latestState.message}
        </div>
        ${states.length > 1 ? `
          <div style="color: #888; font-size: 14px; margin-top: 10px;">
            ${states.length} operations in progress
          </div>
        ` : ''}
      </div>
    `;

    // Add spinner animation
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

  /**
   * Remove loading overlay
   */
  removeOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  /**
   * Execute function with loading state
   * @param {Function} fn - Async function to execute
   * @param {string} message - Loading message
   * @param {string} key - Unique key
   * @returns {Promise<any>}
   */
  async withLoading(fn, message = 'Loading...', key = 'default') {
    this.show(message, key);
    try {
      const result = await fn();
      return result;
    } finally {
      this.hide(key);
    }
  }
}

// Create singleton instance
const loadingManager = new LoadingManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = loadingManager;
}
