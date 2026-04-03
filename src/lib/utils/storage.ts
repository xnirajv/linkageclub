/**
 * Local storage utilities with type safety
 */
export const storage = {
  /**
   * Set item in local storage
   */
  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  /**
   * Get item from local storage
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  /**
   * Remove item from local storage
   */
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  /**
   * Clear all items from local storage
   */
  clear(): void {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  /**
   * Check if key exists in local storage
   */
  has(key: string): boolean {
    try {
      return window.localStorage.getItem(key) !== null;
    } catch (error) {
      return false;
    }
  },
};

/**
 * Session storage utilities with type safety
 */
export const sessionStorage = {
  /**
   * Set item in session storage
   */
  set<T>(key: string, value: T): void {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  },

  /**
   * Get item from session storage
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = window.sessionStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return defaultValue;
    }
  },

  /**
   * Remove item from session storage
   */
  remove(key: string): void {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
    }
  },

  /**
   * Clear all items from session storage
   */
  clear(): void {
    try {
      window.sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  },

  /**
   * Check if key exists in session storage
   */
  has(key: string): boolean {
    try {
      return window.sessionStorage.getItem(key) !== null;
    } catch (error) {
      return false;
    }
  },
};

/**
 * Cookie utilities
 */
export const cookies = {
  /**
   * Set cookie
   */
  set(name: string, value: string, days: number = 7): void {
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
  },

  /**
   * Get cookie
   */
  get(name: string): string | undefined {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : undefined;
  },

  /**
   * Remove cookie
   */
  remove(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },

  /**
   * Check if cookie exists
   */
  has(name: string): boolean {
    return this.get(name) !== undefined;
  },
};
