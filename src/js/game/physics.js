/**
 * Game physics engine
 * Handles player movement, collisions, and physics calculations
 */

class PhysicsEngine {
  constructor() {
    // Physics constants
    this.GRAVITY = 0.042;
    this.MOVE_ACCELERATION = 0.28;
    this.JUMP_POWER = 3.70;
    this.MAX_SPEED = 3.5;
    this.GROUND_FRICTION = 0.94;
    this.AIR_RESISTANCE = 0.88;

    // Player sizes
    this.PLAYER_SIZES = {
      SMALL: 20,
      DEFAULT: 40,
      LARGE: 80
    };
  }

  /**
   * Calculate jump height for given player size
   * @param {number} size - Player size
   * @returns {number} Jump height in pixels
   */
  calculateJumpHeight(size) {
    return size * 4 + 2;
  }

  /**
   * Apply gravity to velocity
   * @param {number} vy - Current vertical velocity
   * @returns {number} New vertical velocity
   */
  applyGravity(vy) {
    return vy + this.GRAVITY;
  }

  /**
   * Apply friction/air resistance
   * @param {number} vx - Current horizontal velocity
   * @param {boolean} isOnGround - Whether player is on ground
   * @returns {number} New horizontal velocity
   */
  applyFriction(vx, isOnGround) {
    const friction = isOnGround ? this.GROUND_FRICTION : this.AIR_RESISTANCE;
    return vx * friction;
  }

  /**
   * Apply movement acceleration
   * @param {number} vx - Current horizontal velocity
   * @param {number} direction - Movement direction (-1, 0, 1)
   * @returns {number} New horizontal velocity
   */
  applyMovement(vx, direction) {
    let newVx = vx + (direction * this.MOVE_ACCELERATION);

    // Clamp to max speed
    newVx = Math.max(-this.MAX_SPEED, Math.min(this.MAX_SPEED, newVx));

    return newVx;
  }

  /**
   * Check AABB collision
   * @param {Object} a - First rectangle {x, y, width, height}
   * @param {Object} b - Second rectangle {x, y, width, height}
   * @returns {boolean}
   */
  checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  /**
   * Resolve collision between player and platform
   * @param {Object} player - Player object {x, y, vx, vy, width, height}
   * @param {Object} platform - Platform object {x, y, width, height}
   * @returns {Object} Updated player position and velocity
   */
  resolveCollision(player, platform) {
    const result = {
      x: player.x,
      y: player.y,
      vx: player.vx,
      vy: player.vy,
      onGround: false,
      hitCeiling: false
    };

    if (!this.checkCollision(player, platform)) {
      return result;
    }

    // Calculate overlap on each axis
    const overlapX = Math.min(
      player.x + player.width - platform.x,
      platform.x + platform.width - player.x
    );
    const overlapY = Math.min(
      player.y + player.height - platform.y,
      platform.y + platform.height - player.y
    );

    // Resolve along axis of least penetration
    if (overlapX < overlapY) {
      // Horizontal collision
      if (player.x < platform.x) {
        result.x = platform.x - player.width;
      } else {
        result.x = platform.x + platform.width;
      }
      result.vx = 0;
    } else {
      // Vertical collision
      if (player.y < platform.y) {
        // Hit ceiling
        result.y = platform.y - player.height;
        result.vy = 0;
        result.hitCeiling = true;
      } else {
        // Landed on platform
        result.y = platform.y + platform.height;
        result.vy = 0;
        result.onGround = true;
      }
    }

    return result;
  }

  /**
   * Check if point is inside rectangle
   * @param {number} px - Point x
   * @param {number} py - Point y
   * @param {Object} rect - Rectangle {x, y, width, height}
   * @returns {boolean}
   */
  pointInRect(px, py, rect) {
    return px >= rect.x &&
           px <= rect.x + rect.width &&
           py >= rect.y &&
           py <= rect.y + rect.height;
  }

  /**
   * Calculate distance between two points
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @returns {number}
   */
  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

// Create singleton instance
const physics = new PhysicsEngine();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = physics;
}
