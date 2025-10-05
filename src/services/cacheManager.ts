/**
 * Cache Manager Service
 * Implements multi-layer caching strategy with AsyncStorage persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const CACHE_PREFIX = '@AirQuality_Cache:';

/**
 * SWR-compatible cache provider with AsyncStorage persistence
 * Implements L1 (memory) and L2 (persistent) caching
 */
export class CacheManager {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes (L1)
  private readonly PERSISTENT_TTL = 60 * 60 * 1000; // 1 hour (L2)

  /**
   * Get item from cache (checks memory first, then AsyncStorage)
   */
  async get<T>(key: string): Promise<T | undefined> {
    // L1: Check memory cache
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && Date.now() - memoryEntry.timestamp < memoryEntry.ttl) {
      console.log('[CacheManager] L1 Cache HIT:', key);
      return memoryEntry.data as T;
    }

    // L2: Check persistent cache
    try {
      const persistentData = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (persistentData) {
        const entry: CacheEntry<T> = JSON.parse(persistentData);
        if (Date.now() - entry.timestamp < entry.ttl) {
          console.log('[CacheManager] L2 Cache HIT:', key);
          // Promote to L1 cache
          this.memoryCache.set(key, entry);
          return entry.data;
        } else {
          console.log('[CacheManager] L2 Cache EXPIRED:', key);
          // Clean up expired entry
          await AsyncStorage.removeItem(CACHE_PREFIX + key);
        }
      }
    } catch (error) {
      console.error('[CacheManager] Error reading from AsyncStorage:', error);
    }

    console.log('[CacheManager] Cache MISS:', key);
    return undefined;
  }

  /**
   * Set item in both memory and persistent cache
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const timestamp = Date.now();
    const memoryTTL = ttl || this.DEFAULT_TTL;
    const persistentTTL = this.PERSISTENT_TTL;

    // L1: Set in memory cache
    this.memoryCache.set(key, {
      data,
      timestamp,
      ttl: memoryTTL,
    });

    // L2: Set in persistent cache
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp,
        ttl: persistentTTL,
      };
      await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
      console.log('[CacheManager] Cached:', key);
    } catch (error) {
      console.error('[CacheManager] Error writing to AsyncStorage:', error);
    }
  }

  /**
   * Delete item from cache
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      console.log('[CacheManager] Deleted:', key);
    } catch (error) {
      console.error('[CacheManager] Error deleting from AsyncStorage:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('[CacheManager] Cleared all cache');
    } catch (error) {
      console.error('[CacheManager] Error clearing AsyncStorage:', error);
    }
  }

  /**
   * Get all keys from memory cache
   */
  keys(): string[] {
    return Array.from(this.memoryCache.keys());
  }

  /**
   * Get cache age in milliseconds
   * Returns undefined if cache doesn't exist
   */
  async getCacheAge(key: string): Promise<number | undefined> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      return Date.now() - memoryEntry.timestamp;
    }

    // Check persistent cache
    try {
      const persistentData = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (persistentData) {
        const entry: CacheEntry<any> = JSON.parse(persistentData);
        return Date.now() - entry.timestamp;
      }
    } catch (error) {
      console.error('[CacheManager] Error reading cache age:', error);
    }

    return undefined;
  }

  /**
   * Check if cache is older than specified duration (in milliseconds)
   */
  async isCacheStale(key: string, maxAge: number): Promise<boolean> {
    const age = await this.getCacheAge(key);
    if (age === undefined) {
      return true; // No cache means stale
    }
    return age > maxAge;
  }

  /**
   * Get cache entry with metadata (timestamp, age, isExpired)
   */
  async getCacheMetadata(key: string): Promise<{
    exists: boolean;
    age?: number;
    timestamp?: number;
    isExpired?: boolean;
  }> {
    const age = await this.getCacheAge(key);

    if (age === undefined) {
      return { exists: false };
    }

    // Check if it's expired
    const memoryEntry = this.memoryCache.get(key);
    const ttl = memoryEntry?.ttl || this.PERSISTENT_TTL;

    return {
      exists: true,
      age,
      timestamp: Date.now() - age,
      isExpired: age > ttl,
    };
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

/**
 * SWR-compatible cache provider
 */
export const swrCacheProvider = () => {
  const map = new Map();

  return {
    get: (key: string) => {
      const value = map.get(key);
      return value !== undefined ? value : undefined;
    },
    set: (key: string, value: any) => {
      map.set(key, value);
    },
    delete: (key: string) => {
      map.delete(key);
    },
    keys: () => Array.from(map.keys()),
  };
};
