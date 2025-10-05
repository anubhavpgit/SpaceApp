/**
 * SWR-powered Dashboard Data Hook
 * Implements Stale-While-Revalidate pattern with multi-layer caching
 */

import { useMemo, useState, useEffect } from 'react';
import useSWR from 'swr';
import { airQualityAPI } from '../api/client';
import { useLocation } from '../contexts/LocationContext';
import { CacheKeys } from '../config/swr';
import { cacheManager } from '../services/cacheManager';
import {
  AQIReading,
  AirQualityForecast,
  HealthAlert,
  WeatherData,
} from '../types/airQuality';

interface DashboardData {
  currentAQI: AQIReading;
  currentAQISummary?: {
    brief: string;
    detailed: string;
    recommendation: string;
    insight: string;
  };
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
  const forecast: AirQualityForecast = {
    location: response.location,
    forecasts: (forecastData?.hourly || []).map((item: any) => ({
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

  // Generate cache key based on location
  const cacheKey = useMemo(() => {
    if (!location.latitude || !location.longitude) return null;
    return CacheKeys.dashboard(location.latitude, location.longitude);
  }, [location.latitude, location.longitude]);

  // Fetcher function that integrates with cache manager
  const fetcher = async () => {
    if (!location.latitude || !location.longitude) {
      throw new Error('Location not available');
    }

    console.log('[useSwrDashboard] Fetching dashboard data for:', {
      lat: location.latitude,
      lon: location.longitude,
    });

    // Fetch fresh data from API
    const response = await airQualityAPI.getDashboard(
      location.latitude,
      location.longitude
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

  useEffect(() => {
    if (cacheKey) {
      cacheManager.get<DashboardData>(cacheKey).then((cached) => {
        if (cached) {
          console.log('[useSwrDashboard] Loaded fallback data from L2 cache');
          setFallbackData(cached);
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

      // Revalidate on focus and reconnect
      revalidateOnFocus: true,
      revalidateOnReconnect: true,

      // Background refresh every 15 minutes (architecture spec)
      refreshInterval: 15 * 60 * 1000,

      // Deduplicate requests within 2 seconds - prevents duplicate calls
      dedupingInterval: 2000,

      // Error retry configuration
      errorRetryCount: 3,
      errorRetryInterval: 5000,

      // Revalidate stale data
      revalidateIfStale: true,

      // Optimize for mobile
      loadingTimeout: 10000,
    }
  );

  const loading = !data && !error;

  // Track last update time
  const lastUpdated = useMemo(() => {
    return data ? new Date() : null;
  }, [data]);

  return {
    data,
    loading,
    error,
    isValidating,
    mutate: async () => {
      await mutate();
    },
    lastUpdated,
  };
};
