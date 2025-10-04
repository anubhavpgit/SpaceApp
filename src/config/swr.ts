/**
 * SWR Configuration
 * Global configuration for Stale-While-Revalidate data fetching
 */

import { SWRConfiguration } from 'swr';
import { cacheManager } from '../services/cacheManager';

/**
 * Custom fetcher that integrates with our cache manager
 */
export const createFetcher = <T,>(
  fetchFn: () => Promise<T>,
  cacheKey: string
) => async (): Promise<T> => {
  // Check cache first
  const cached = await cacheManager.get<T>(cacheKey);
  if (cached) {
    console.log('[SWR] Returning cached data for:', cacheKey);
    // Return cached data immediately while fetching in background
    setTimeout(async () => {
      try {
        const fresh = await fetchFn();
        await cacheManager.set(cacheKey, fresh);
      } catch (error) {
        console.error('[SWR] Background refresh failed:', error);
      }
    }, 0);
    return cached;
  }

  // Fetch fresh data
  console.log('[SWR] Fetching fresh data for:', cacheKey);
  const data = await fetchFn();
  await cacheManager.set(cacheKey, data);
  return data;
};

/**
 * Global SWR configuration aligned with architecture:
 * - L1 Cache: In-memory (5 min TTL)
 * - L2 Cache: AsyncStorage (1 hour TTL)
 * - Background Sync: Every 15 minutes
 */
export const swrConfig: SWRConfiguration = {
  // Revalidation options
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  revalidateIfStale: true,

  // Deduplication interval - prevent multiple requests in 2 seconds
  dedupingInterval: 2000,

  // Cache lifetime - 5 minutes for stale data
  focusThrottleInterval: 5 * 60 * 1000,

  // Refresh interval - 15 minutes (architecture spec)
  refreshInterval: 15 * 60 * 1000,

  // Error retry configuration
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  shouldRetryOnError: true,

  // Keep previous data while revalidating
  keepPreviousData: true,

  // Optimize for mobile - don't revalidate too aggressively
  revalidateOnMount: true,

  // Loading timeout
  loadingTimeout: 10000,

  // Use custom error handler
  onError: (error, key) => {
    console.error('[SWR] Error fetching data:', key, error);
  },

  // Success handler
  onSuccess: (data, key) => {
    console.log('[SWR] Successfully fetched:', key);
  },

  // Fallback data handling
  fallbackData: undefined,
};

/**
 * Cache key generators for consistent key management
 */
export const CacheKeys = {
  dashboard: (lat: number, lon: number) =>
    `dashboard:${lat.toFixed(4)}:${lon.toFixed(4)}`,

  currentAQI: (lat: number, lon: number) =>
    `aqi:current:${lat.toFixed(4)}:${lon.toFixed(4)}`,

  forecast: (lat: number, lon: number, hours: number = 24) =>
    `forecast:${hours}h:${lat.toFixed(4)}:${lon.toFixed(4)}`,

  weather: (lat: number, lon: number) =>
    `weather:${lat.toFixed(4)}:${lon.toFixed(4)}`,

  alerts: (lat: number, lon: number) =>
    `alerts:${lat.toFixed(4)}:${lon.toFixed(4)}`,

  historical: (lat: number, lon: number, days: number = 7) =>
    `historical:${days}d:${lat.toFixed(4)}:${lon.toFixed(4)}`,
};
