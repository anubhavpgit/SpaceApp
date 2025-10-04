/**
 * Dashboard Data Hook
 * Manages fetching and caching of dashboard data from Flask backend
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { airQualityAPI } from '../api/client';
import { useLocation } from '../contexts/LocationContext';
import {
  AQIReading,
  AirQualityForecast,
  HealthAlert,
  WeatherData,
} from '../types/airQuality';

interface DashboardData {
  currentAQI: AQIReading;
  weather: WeatherData;
  forecast: AirQualityForecast;
  healthAlerts: HealthAlert[];
  historicalReadings: AQIReading[];
  insights: {
    vsYesterday: {
      change: number;
      direction: 'better' | 'worse' | 'same';
      text: string;
    };
    personalizedTips: string[];
  };
}

interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export const useDashboardData = (): UseDashboardDataReturn => {
  const { location } = useLocation();
  console.log('[useDashboardData] Hook called with location:', {
    lat: location.latitude,
    lon: location.longitude,
    isLoading: location.isLoading,
    hasError: !!location.error,
  });
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isFetchingRef = useRef(false);
  const lastFetchedCoordsRef = useRef<{ lat: number; lon: number } | null>(null);

  const fetchDashboardData = useCallback(async () => {
    console.log('[useDashboardData] fetchDashboardData called', {
      latitude: location.latitude,
      longitude: location.longitude,
      isFetching: isFetchingRef.current,
    });

    if (!location.latitude || !location.longitude) {
      console.warn('[useDashboardData] No location coordinates available');
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log('[useDashboardData] Already fetching, skipping...');
      return;
    }

    // Check if coordinates changed significantly
    const lastCoords = lastFetchedCoordsRef.current;
    if (lastCoords) {
      const latDiff = Math.abs(lastCoords.lat - location.latitude);
      const lonDiff = Math.abs(lastCoords.lon - location.longitude);
      if (latDiff < 0.0001 && lonDiff < 0.0001) {
        console.log('[useDashboardData] Coordinates unchanged, skipping fetch');
        setLoading(false);
        return;
      }
    }

    try {
      console.log('[useDashboardData] Starting fetch...');
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      const response = await airQualityAPI.getDashboard(
        location.latitude,
        location.longitude
      );

      console.log('[useDashboardData] Received response:', {
        hasCurrentAQI: !!response.currentAQI,
        hasWeather: !!response.weather,
        hasForecast: !!response.forecast24h,
        hasAlerts: !!response.healthAlerts,
        hasHistorical: !!response.historical7d,
      });

      // Validate required data exists
      if (!response.currentAQI?.raw) {
        throw new Error('Missing current air quality data from server');
      }
      if (!response.weather?.raw) {
        throw new Error('Missing weather data from server');
      }
      if (!response.forecast24h?.raw) {
        throw new Error('Missing forecast data from server');
      }

      // Transform API response to match app data structure with safe fallbacks
      const dashboardData: DashboardData = {
        currentAQI: response.currentAQI.raw,
        weather: response.weather.raw,
        forecast: response.forecast24h.raw,
        healthAlerts: response.healthAlerts?.raw?.activeAlerts || [],
        historicalReadings: response.historical7d?.raw?.readings || [],
        insights: {
          vsYesterday: response.insights?.comparative?.vsYesterday || {
            change: 0,
            direction: 'same' as const,
            text: 'No comparison data available',
          },
          personalizedTips: response.insights?.personalizedTips || [],
        },
      };

      console.log('[useDashboardData] Dashboard data transformed successfully', {
        aqiValue: dashboardData.currentAQI.aqi,
        alertsCount: dashboardData.healthAlerts.length,
        forecastCount: dashboardData.forecast.forecasts?.length,
        historicalCount: dashboardData.historicalReadings.length,
      });

      // Update last fetched coordinates
      lastFetchedCoordsRef.current = {
        lat: location.latitude,
        lon: location.longitude,
      };

      setData(dashboardData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[useDashboardData] Failed to fetch dashboard data:', err);
      const error = err as Error;
      setError(new Error(error.message || 'Failed to load dashboard data'));
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      console.log('[useDashboardData] Fetch complete');
    }
  }, [location.latitude, location.longitude]);

  // Fetch when coordinates change
  useEffect(() => {
    console.log('[useDashboardData] useEffect triggered - location changed:', {
      lat: location.latitude,
      lon: location.longitude,
      isLocationLoading: location.isLoading,
    });

    // Don't fetch if location is still loading
    if (location.isLoading) {
      console.log('[useDashboardData] Location still loading, skipping fetch');
      return;
    }

    console.log('[useDashboardData] Coordinates changed, triggering fetch');
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.latitude, location.longitude, location.isLoading]);

  // Refetch on interval (every 5 minutes)
  useEffect(() => {
    console.log('[useDashboardData] Setting up auto-refresh interval (5 minutes)');
    const interval = setInterval(() => {
      console.log('[useDashboardData] Auto-refresh triggered');
      // Force fetch by clearing the lastFetchedCoordsRef
      lastFetchedCoordsRef.current = null;
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      console.log('[useDashboardData] Clearing auto-refresh interval');
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetch = useCallback(async () => {
    console.log('[useDashboardData] Manual refetch triggered');
    // Clear last fetched coords to force a new fetch
    lastFetchedCoordsRef.current = null;
    await fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated,
  };
};
