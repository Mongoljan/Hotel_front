/**
 * User-scoped localStorage manager with automatic expiry
 * Prevents data leakage between different user sessions
 * Automatically clears data when session expires
 */

interface StorageMetadata {
  userId: string;
  hotelId: string;
  timestamp: number;
  expiresAt: number; // Timestamp when session expires
}

class UserStorage {
  private static METADATA_KEY = '__user_session_metadata__';
  private static PREFIX = 'hotel_';
  private static SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds (matches JWT)

  /**
   * Initialize storage for current user
   * Clears all data if user has changed or session expired
   */
  static initializeForUser(userId: string, hotelId: string): void {
    const currentMetadata = this.getMetadata();
    const now = Date.now();
    
    // Check if session has expired
    if (currentMetadata && currentMetadata.expiresAt < now) {
      this.clearAll();
    }
    
    // If user has changed, clear ALL localStorage
    if (currentMetadata && currentMetadata.userId !== userId) {
      this.clearAll();
    }
    
    // Set new metadata with expiry
    const metadata: StorageMetadata = {
      userId,
      hotelId,
      timestamp: now,
      expiresAt: now + this.SESSION_DURATION
    };
    
    localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
  }

  /**
   * Check if current session is still valid (not expired)
   */
  static isSessionValid(): boolean {
    const metadata = this.getMetadata();
    if (!metadata) return false;
    
    const now = Date.now();
    const isValid = metadata.expiresAt > now;
    
    if (!isValid) {
      this.clearAll();
    }
    
    return isValid;
  }

  /**
   * Extend session expiry (called on user activity)
   */
  static extendSession(): void {
    const metadata = this.getMetadata();
    if (!metadata) return;
    
    const now = Date.now();
    metadata.expiresAt = now + this.SESSION_DURATION;
    metadata.timestamp = now;
    
    localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
  }

  /**
   * Get current session metadata
   */
  private static getMetadata(): StorageMetadata | null {
    try {
      const data = localStorage.getItem(this.METADATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Validate that stored data belongs to current user and session is valid
   */
  static validateUser(userId: string): boolean {
    // First check if session is still valid
    if (!this.isSessionValid()) {
      return false;
    }
    
    const metadata = this.getMetadata();
    return metadata?.userId === userId;
  }

  /**
   * Set item with user validation and session check
   */
  static setItem(key: string, value: any, userId: string): void {
    if (!this.validateUser(userId)) {
      console.warn('⚠️ User mismatch or session expired - data not saved');
      return;
    }
    
    // Extend session on activity
    this.extendSession();
    
    const prefixedKey = `${this.PREFIX}${key}`;
    localStorage.setItem(prefixedKey, JSON.stringify(value));
  }

  /**
   * Get item with user validation and session check
   */
  static getItem<T>(key: string, userId: string): T | null {
    if (!this.validateUser(userId)) {
      console.warn('⚠️ User mismatch or session expired - returning null');
      return null;
    }
    
    try {
      const prefixedKey = `${this.PREFIX}${key}`;
      const data = localStorage.getItem(prefixedKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Remove item
   */
  static removeItem(key: string): void {
    const prefixedKey = `${this.PREFIX}${key}`;
    localStorage.removeItem(prefixedKey);
  }

  /**
   * Clear all user data
   */
  static clearAll(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX) || key === this.METADATA_KEY || key.startsWith('hotelCompletion_')) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Clear all data on logout
   */
  static clearOnLogout(): void {
    this.clearAll();
  }
}

export default UserStorage;
