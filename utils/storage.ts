/**
 * User-scoped localStorage manager
 * Prevents data leakage between different user sessions
 */

interface StorageMetadata {
  userId: string;
  hotelId: string;
  timestamp: number;
}

class UserStorage {
  private static METADATA_KEY = '__user_session_metadata__';
  private static PREFIX = 'hotel_';

  /**
   * Initialize storage for current user
   * Clears all data if user has changed
   */
  static initializeForUser(userId: string, hotelId: string): void {
    const currentMetadata = this.getMetadata();
    
    // If user has changed, clear ALL localStorage
    if (currentMetadata && currentMetadata.userId !== userId) {
      console.log('🔄 User changed - clearing all localStorage');
      this.clearAll();
    }
    
    // Set new metadata
    const metadata: StorageMetadata = {
      userId,
      hotelId,
      timestamp: Date.now()
    };
    
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
   * Validate that stored data belongs to current user
   */
  static validateUser(userId: string): boolean {
    const metadata = this.getMetadata();
    return metadata?.userId === userId;
  }

  /**
   * Set item with user validation
   */
  static setItem(key: string, value: any, userId: string): void {
    if (!this.validateUser(userId)) {
      console.warn('⚠️ User mismatch - data not saved');
      return;
    }
    
    const prefixedKey = `${this.PREFIX}${key}`;
    localStorage.setItem(prefixedKey, JSON.stringify(value));
  }

  /**
   * Get item with user validation
   */
  static getItem<T>(key: string, userId: string): T | null {
    if (!this.validateUser(userId)) {
      console.warn('⚠️ User mismatch - returning null');
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
      if (key.startsWith(this.PREFIX) || key === this.METADATA_KEY) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Clear all data on logout
   */
  static clearOnLogout(): void {
    console.log('🧹 Clearing all localStorage on logout');
    this.clearAll();
  }
}

export default UserStorage;
