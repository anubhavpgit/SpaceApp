/**
 * SWR-powered Dashboard Data Hook
 * Implements Stale-While-Revalidate pattern with multi-layer caching
 */

import { useMemo, useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { airQualityAPI } from '../api/client';
import { useLocation } from '../contexts/LocationContext';
import { usePersona } from '../contexts/PersonaContext';
import { CacheKeys } from '../config/swr';
import { cacheManager } from '../services/cacheManager';
import {
  AQIReading,
  AirQualityForecast,
  HealthAlert,
  WeatherData,
  LiveWeatherReport,
} from '../types/airQuality';

// Cache invalidation threshold: 5 minutes
const CACHE_INVALIDATION_THRESHOLD = 5 * 60 * 1000;

interface AISummary {
  brief: string;
  detailed?: string;
  recommendation?: string;
  insight?: string;
  [key: string]: string | string[] | undefined;
}

interface DashboardData {
  currentAQI: AQIReading;
  currentAQISummary?: AISummary;
  weatherSummary?: AISummary;
  forecastSummary?: AISummary;
  historicalSummary?: AISummary;
  weather: WeatherData;
  forecast: AirQualityForecast;
  healthAlerts: HealthAlert[];
  historicalReadings: AQIReading[];
  dataSources?: {
    tempo: {
      aqi: number | null;
      available: boolean;
      pollutants?: Record<string, number | null>;
    };
    ground: {
      aqi: number | null;
      available: boolean;
      stationCount: number;
    };
    aggregated: {
      aqi: number;
      confidence: number;
    };
  };
  insights: {
    vsYesterday: {
      change: number;
      direction: 'better' | 'worse' | 'same';
      text: string;
    };
    personalizedTips: string[];
  };
  personaInsights?: any;
  liveWeatherReport?: LiveWeatherReport;
}

interface UseSwrDashboardReturn {
  data: DashboardData | undefined;
  loading: boolean;
  error: Error | undefined;
  isValidating: boolean;
  mutate: () => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * Transform API response to dashboard data structure
 */
const transformDashboardData = (response: any): DashboardData => {
  // Extract pollutants from dataSources if currentAQI.pollutants is empty
  const pollutants = response.currentAQI.raw.pollutants &&
    Object.keys(response.currentAQI.raw.pollutants).length > 0
    ? response.currentAQI.raw.pollutants
    : {
        pm25: response.dataSources?.raw?.tempo?.pollutants?.pm25 || 0,
        pm10: response.dataSources?.raw?.tempo?.pollutants?.pm10 || 0,
        o3: response.dataSources?.raw?.tempo?.pollutants?.o3 || 0,
        no2: response.dataSources?.raw?.tempo?.pollutants?.no2 || 0,
        so2: response.dataSources?.raw?.tempo?.pollutants?.so2 || 0,
        co: response.dataSources?.raw?.tempo?.pollutants?.co || 0,
      };

  // Transform forecast data
  const forecastData = response.forecast24h?.raw;
  const hourlyData = forecastData?.hourly || [];

  const forecast: AirQualityForecast = {
    location: response.location,
    forecasts: hourlyData.map((item: any) => ({
      timestamp: new Date(item.timestamp),
      aqi: item.aqi,
      category: item.category,
      confidence: forecastData?.modelConfidence || 0.85,
      pollutants: {
        pm25: item.pollutants?.pm25 || 0,
        pm10: item.pollutants?.pm10 || 0,
        o3: item.pollutants?.o3 || 0,
        no2: item.pollutants?.no2 || 0,
        so2: item.pollutants?.so2 || 0,
        co: item.pollutants?.co || 0,
      },
      temperature: item.temperature,
      humidity: item.humidity,
      windSpeed: item.windSpeed,
    })),
    generatedAt: new Date(forecastData?.generatedAt || new Date()),
    modelVersion: forecastData?.modelVersion || 'unknown',
  };

  return {
    currentAQI: {
      ...response.currentAQI.raw,
      pollutants,
      timestamp: new Date(response.currentAQI.raw.lastUpdated || new Date()),
      location: response.location,
      source: 'aggregated' as const,
      confidence: response.dataSources?.raw?.aggregated?.confidence || 0.9,
    },
    currentAQISummary: response.currentAQI?.aiSummary,
    weatherSummary: response.weather?.aiSummary,
    forecastSummary: response.forecast24h?.aiSummary,
    historicalSummary: response.historical7d?.aiSummary,
    weather: {
      ...response.weather.raw,
      timestamp: new Date(response.weather.raw.timestamp),
    },
    forecast,
    healthAlerts: response.healthAlerts?.raw?.activeAlerts || [],
    historicalReadings: (response.historical7d?.raw?.readings || []).map((reading: any) => ({
      ...reading,
      timestamp: new Date(reading.timestamp),
      location: response.location,
      source: 'aggregated' as const,
      confidence: 0.9,
    })),
    dataSources: response.dataSources?.raw ? {
      tempo: {
        aqi: response.dataSources.raw.tempo?.aqi || null,
        available: response.dataSources.raw.tempo?.available || false,
        pollutants: response.dataSources.raw.tempo?.pollutants,
      },
      ground: {
        aqi: response.dataSources.raw.ground?.aqi || null,
        available: response.dataSources.raw.ground?.available || false,
        stationCount: response.dataSources.raw.ground?.stationCount || 0,
      },
      aggregated: {
        aqi: response.dataSources.raw.aggregated?.aqi || response.currentAQI.raw.aqi,
        confidence: response.dataSources.raw.aggregated?.confidence || 0.9,
      },
    } : undefined,
    insights: {
      vsYesterday: response.insights?.comparative?.vsYesterday || {
        change: 0,
        direction: 'same' as const,
        text: 'No comparison data available',
      },
      personalizedTips: response.insights?.personalizedTips || [],
    },
    personaInsights: response.personaInsights,
    liveWeatherReport: response.liveWeatherReport,
  };
};

/**
 * SWR-powered dashboard data hook
 * Features:
 * - Stale-While-Revalidate pattern
 * - Multi-layer caching (memory + AsyncStorage)
 * - Background revalidation
 * - Automatic refetch on focus/reconnect
 */
export const useSwrDashboard = (): UseSwrDashboardReturn => {
  const { location } = useLocation();
  const { persona } = usePersona();

  // Generate cache key based on location AND persona
  const cacheKey = useMemo(() => {
    if (!location.latitude || !location.longitude || location.isLoading) return null;
    // Include persona in cache key so different personas get different cache entries
    return `${CacheKeys.dashboard(location.latitude, location.longitude)}_${persona}`;
  }, [location.latitude, location.longitude, location.isLoading, persona]);

  // Fetcher function that integrates with cache manager
  const fetcher = async () => {
    if (!location.latitude || !location.longitude) {
      throw new Error('Location not available');
    }

    console.log('[useSwrDashboard] Fetching dashboard data for:', {
      lat: location.latitude,
      lon: location.longitude,
      persona,
    });

    // Fetch fresh data from API with persona
    const response = await airQualityAPI.getDashboard(
      location.latitude,
      location.longitude,
      persona
    );

    // Validate required data
    if (!response.currentAQI?.raw) {
      throw new Error('Missing current air quality data from server');
    }
    if (!response.weather?.raw) {
      throw new Error('Missing weather data from server');
    }
    if (!response.forecast24h?.raw) {
      throw new Error('Missing forecast data from server');
    }

    const dashboardData = transformDashboardData(response);

    // Cache the fresh data in L2 (AsyncStorage) for persistence
    if (cacheKey) {
      await cacheManager.set(cacheKey, dashboardData);
    }

    return dashboardData;
  };

  // Load initial data from L2 cache (AsyncStorage) for instant display
  const [fallbackData, setFallbackData] = useState<DashboardData | undefined>();
  const [shouldRevalidate, setShouldRevalidate] = useState(true);

  useEffect(() => {
    if (cacheKey) {
      // Load cached data and check its age
      Promise.all([
        cacheManager.get<DashboardData>(cacheKey),
        cacheManager.getCacheAge(cacheKey)
      ]).then(([cached, cacheAge]) => {
        if (cached) {
          console.log('[useSwrDashboard] Loaded fallback data from L2 cache');
          setFallbackData(cached);

          // Only revalidate if cache is older than 5 minutes
          if (cacheAge !== undefined) {
            const isStale = cacheAge > CACHE_INVALIDATION_THRESHOLD;
            console.log('[useSwrDashboard] Cache age:', Math.round(cacheAge / 1000), 'seconds, isStale:', isStale);
            setShouldRevalidate(isStale);
          }
        } else {
          setShouldRevalidate(true);
        }
      });
    }
  }, [cacheKey]);

  // Use SWR with the generated cache key
  const { data, error, isValidating, mutate } = useSWR<DashboardData, Error>(
    cacheKey,
    fetcher,
    {
      // Use fallback data from AsyncStorage for instant display
      fallbackData,

      // Keep previous data while revalidating for smooth transitions
      keepPreviousData: true,

      // Revalidate on focus and reconnect only if cache is stale
      revalidateOnFocus: shouldRevalidate,
      revalidateOnReconnect: shouldRevalidate,

      // Background refresh every 5 minutes
      refreshInterval: CACHE_INVALIDATION_THRESHOLD,

      // Deduplicate requests within 2 seconds - prevents duplicate calls
      dedupingInterval: 2000,

      // Error retry configuration
      errorRetryCount: 3,
      errorRetryInterval: 5000,

      // Revalidate stale data based on cache age
      revalidateIfStale: shouldRevalidate,

      // Only revalidate on mount if cache is stale
      revalidateOnMount: shouldRevalidate,

      // Optimize for mobile
      loadingTimeout: 10000,

      // Update shouldRevalidate after successful fetch
      onSuccess: (newData) => {
        setShouldRevalidate(false);
        // Reset to true after cache invalidation threshold
        setTimeout(() => setShouldRevalidate(true), CACHE_INVALIDATION_THRESHOLD);
      },
    }
  );

  const loading = !data && !error;

  // Track last update time
  const lastUpdated = useMemo(() => {
    return data ? new Date() : null;
  }, [data]);

  // Background refresh mechanism - check cache age every minute and refresh if needed
  useEffect(() => {
    if (!cacheKey) return;

    const checkAndRefresh = async () => {
      const isStale = await cacheManager.isCacheStale(cacheKey, CACHE_INVALIDATION_THRESHOLD);

      if (isStale) {
        console.log('[useSwrDashboard] Cache is stale, triggering background refresh');
        setShouldRevalidate(true);
        await mutate();
      }
    };

    // Check immediately on mount
    checkAndRefresh();

    // Then check every minute
    const intervalId = setInterval(checkAndRefresh, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [cacheKey, mutate]);

  return {
    data,
    loading,
    error,
    isValidating,
    mutate: async () => {
      setShouldRevalidate(true);
      await mutate();
    },
    lastUpdated,
  };
};
