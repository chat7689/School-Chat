/**
 * Input validation utilities
 */

const Validation = {
  /**
   * Validate username
   * @param {string} username
   * @returns {Object} { valid: boolean, error: string }
   */
  validateUsername(username) {
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

  /**
   * Validate password
   * @param {string} password
   * @returns {Object} { valid: boolean, error: string }
   */
  validatePassword(password) {
    if (!password || typeof password !== 'string') {
      return { valid: false, error: 'Password is required' };
    }

    if (password.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters' };
    }

    return { valid: true };
  },

  /**
   * Validate time (for speedruns)
   * @param {number} time - Time in milliseconds
   * @returns {Object} { valid: boolean, error: string }
   */
  validateTime(time) {
    if (typeof time !== 'number' || isNaN(time)) {
      return { valid: false, error: 'Invalid time value' };
    }

    if (time <= 0) {
      return { valid: false, error: 'Time must be greater than 0' };
    }

    if (time > 3600000) { // 1 hour max
      return { valid: false, error: 'Time exceeds maximum allowed (1 hour)' };
    }

    // Check for suspiciously fast times (less than 1 second)
    if (time < 1000) {
      return { valid: false, error: 'Time is suspiciously fast', suspicious: true };
    }

    return { valid: true };
  },

  /**
   * Validate credits amount
   * @param {number} credits
   * @returns {Object} { valid: boolean, error: string }
   */
  validateCredits(credits) {
    if (typeof credits !== 'number' || isNaN(credits)) {
      return { valid: false, error: 'Invalid credits value' };
    }

    if (credits < 0) {
      return { valid: false, error: 'Credits cannot be negative' };
    }

    if (!Number.isInteger(credits)) {
      return { valid: false, error: 'Credits must be a whole number' };
    }

    return { valid: true };
  },

  /**
   * Validate level name
   * @param {string} name
   * @returns {Object} { valid: boolean, error: string }
   */
  validateLevelName(name) {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'Level name is required' };
    }

    const trimmed = name.trim();

    if (trimmed.length < 1) {
      return { valid: false, error: 'Level name cannot be empty' };
    }

    if (trimmed.length > 50) {
      return { valid: false, error: 'Level name must be 50 characters or less' };
    }

    return { valid: true, value: trimmed };
  },

  /**
   * Sanitize string input
   * @param {string} input
   * @returns {string}
   */
  sanitizeString(input) {
    if (typeof input !== 'string') return '';

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove HTML tags
      .substring(0, 1000); // Limit length
  },

  /**
   * Validate coordinates
   * @param {number} x
   * @param {number} y
   * @returns {Object} { valid: boolean, error: string }
   */
  validateCoordinates(x, y) {
    if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
      return { valid: false, error: 'Invalid coordinates' };
    }

    // Reasonable bounds for game world
    const MAX_COORD = 100000;
    const MIN_COORD = -100000;

    if (x < MIN_COORD || x > MAX_COORD || y < MIN_COORD || y > MAX_COORD) {
      return { valid: false, error: 'Coordinates out of bounds' };
    }

    return { valid: true };
  },

  /**
   * Validate object structure
   * @param {Object} obj
   * @param {Array<string>} requiredFields
   * @returns {Object} { valid: boolean, error: string, missing: Array }
   */
  validateObjectStructure(obj, requiredFields) {
    if (!obj || typeof obj !== 'object') {
      return { valid: false, error: 'Invalid object' };
    }

    const missing = requiredFields.filter(field => !(field in obj));

    if (missing.length > 0) {
      return {
        valid: false,
        error: `Missing required fields: ${missing.join(', ')}`,
        missing
      };
    }

    return { valid: true };
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validation;
}
