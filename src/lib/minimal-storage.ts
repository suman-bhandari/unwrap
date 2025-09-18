// Minimal storage system that prevents large data from being stored
// This replaces browser storage with a size-limited alternative

const MAX_STORAGE_SIZE = 1000; // 1KB max storage size

class MinimalStorage {
  private data: Map<string, string> = new Map();

  getItem(key: string): string | null {
    const value = this.data.get(key);
    return value || null;
  }

  setItem(key: string, value: string): void {
    // Check if adding this item would exceed our size limit
    const currentSize = this.getTotalSize();
    const newItemSize = key.length + value.length;
    
    if (currentSize + newItemSize > MAX_STORAGE_SIZE) {
      console.warn('Storage size limit exceeded, clearing all data');
      this.data.clear();
    }
    
    // Only store if it's small enough
    if (newItemSize <= MAX_STORAGE_SIZE) {
      this.data.set(key, value);
    } else {
      console.warn('Item too large to store:', key);
    }
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }

  private getTotalSize(): number {
    let total = 0;
    for (const [key, value] of this.data) {
      total += key.length + value.length;
    }
    return total;
  }
}

// Create minimal storage instances
export const minimalLocalStorage = new MinimalStorage();
export const minimalSessionStorage = new MinimalStorage();

// Override browser storage with our minimal versions
if (typeof window !== 'undefined') {
  // Override localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => minimalLocalStorage.getItem(key),
      setItem: (key: string, value: string) => minimalLocalStorage.setItem(key, value),
      removeItem: (key: string) => minimalLocalStorage.removeItem(key),
      clear: () => minimalLocalStorage.clear(),
      length: 0,
      key: (index: number) => null
    },
    writable: false,
    configurable: false
  });

  // Override sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: (key: string) => minimalSessionStorage.getItem(key),
      setItem: (key: string, value: string) => minimalSessionStorage.setItem(key, value),
      removeItem: (key: string) => minimalSessionStorage.removeItem(key),
      clear: () => minimalSessionStorage.clear(),
      length: 0,
      key: (index: number) => null
    },
    writable: false,
    configurable: false
  });

  console.log('Minimal storage system activated - preventing large data storage');
}
