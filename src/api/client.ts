/**
 * Air Quality API Client
 * Handles all communication with Flask backend
 */

import { API_CONFIG, API_ENDPOINTS, API_HEADERS, getAuthHeader } from '../config/api';
import {
  AQIReading,
  AirQualityForecast,
  HealthAlert,
  WeatherData,
  Location,
} from '../types/airQuality';

interface DashboardResponse {
  success: boolean;
  timestamp: string;
  data: {
    location: Location;
    currentAQI: {
      raw: AQIReading;
      aiSummary: {
        brief: string;
        detailed: string;
        recommendation: string;
        insight: string;
      };
    };
    weather: {
      raw: WeatherData;
      aiSummary: {
        brief: string;
        detailed: string;
        impact: string;
        uvAlert?: string;
      };
    };
    forecast24h: {
      raw: AirQualityForecast;
      aiSummary: {
        brief: string;
        detailed: string;
        recommendations: string[];
        keyInsights: string;
      };
    };
    historical7d: {
      raw: {
        readings: AQIReading[];
        statistics: {
          average: number;
          min: number;
          max: number;
          trend: {
            direction: 'improving' | 'worsening' | 'stable';
            percentage: number;
          };
        };
      };
      aiSummary: {
        brief: string;
        detailed: string;
        trendAnalysis: string;
      };
    };
    healthAlerts: {
      raw: {
        activeAlerts: HealthAlert[];
      };
      aiSummary: {
        brief: string;
        detailed: string;
        riskLevel: string;
      };
    };
    insights: {
      comparative: {
        vsYesterday: {
          change: number;
          direction: 'better' | 'worse' | 'same';
          text: string;
        };
      };
      personalizedTips: string[];
      nextMilestone: string;
    };
    metadata: {
      processingTime: number;
      nextUpdate: string;
      dataSourcesUsed: string[];
    };
  };
}

interface APIError {
  success: false;
  timestamp: string;
  error: {
    code: string;
    message: string;
    details?: string;
    retry?: boolean;
    retryAfter?: number;
  };
}

class AirQualityAPIClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Make HTTP request with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      ...API_HEADERS,
      ...getAuthHeader(),
      ...options.headers,
    };

    console.log('[API] Request:', {
      url,
      method: options.method || 'GET',
      headers,
      body: options.body,
    });

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        const startTime = Date.now();

        console.log(`[API] Attempt ${attempt + 1}/${API_CONFIG.RETRY_ATTEMPTS} for ${endpoint}`);
        console.log(`[API] Starting fetch at ${new Date().toISOString()}`);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const fetchTime = Date.now() - startTime;

        console.log(`[API] Response status: ${response.status} (took ${fetchTime}ms)`);

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('[API] Failed to parse JSON response:', parseError);
          throw new Error('Invalid response from server');
        }

        if (!response.ok) {
          const errorData = data as APIError;
          console.error('[API] Error response:', errorData);
          const errorMessage = errorData?.error?.message || `Request failed with status ${response.status}`;
          throw new Error(errorMessage);
        }

        console.log('[API] Success:', endpoint);
        return data;
      } catch (error) {
        lastError = error as Error;

        // Enhanced error logging
        if (error instanceof TypeError && error.message.includes('Network request failed')) {
          console.error('[API] Network error - check your internet connection');
          lastError = new Error('Network error. Please check your internet connection.');
        } else if (error instanceof Error && error.name === 'AbortError') {
          console.error('[API] Request timeout');
          lastError = new Error('Request timeout. The server took too long to respond.');
        }

        console.error(`[API] Attempt ${attempt + 1} failed:`, lastError.message);

        if (attempt < API_CONFIG.RETRY_ATTEMPTS - 1) {
          const delay = API_CONFIG.RETRY_DELAY * (attempt + 1);
          console.log(`[API] Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    console.error('[API] All retry attempts failed');
    throw lastError || new Error('API request failed after all retry attempts');
  }

  /**
   * Check API health
   */
  async checkHealth(): Promise<{ status: string; version: string }> {
    const response = await this.request<{
      status: string;
      version: string;
      timestamp: string;
    }>(API_ENDPOINTS.HEALTH, {
      method: 'GET',
    });

    return {
      status: response.status,
      version: response.version,
    };
  }

  /**
   * Get complete dashboard data
   */
  async getDashboard(
    latitude: number,
    longitude: number
  ): Promise<DashboardResponse['data']> {
    console.log(`[API] getDashboard called for lat=${latitude}, lon=${longitude}`);
    const startTime = Date.now();

    const response = await this.request<DashboardResponse>(
      API_ENDPOINTS.DASHBOARD,
      {
        method: 'POST',
        body: JSON.stringify({
          latitude,
          longitude,
        }),
      }
    );

    console.log(`[API] getDashboard completed in ${Date.now() - startTime}ms`);

    if (!response.success) {
      throw new Error('Dashboard request failed');
    }

    if (!response.data) {
      throw new Error('No data returned from server');
    }

    // Validate critical data exists
    if (!response.data.currentAQI) {
      console.warn('[API] Missing currentAQI in response');
    }
    if (!response.data.weather) {
      console.warn('[API] Missing weather in response');
    }
    if (!response.data.forecast24h) {
      console.warn('[API] Missing forecast24h in response');
    }

    return response.data;
  }

  /**
   * Get current air quality
   */
  async getCurrentAirQuality(
    latitude: number,
    longitude: number
  ): Promise<AQIReading> {
    const response = await this.request<{
      success: boolean;
      data: AQIReading;
    }>(API_ENDPOINTS.CURRENT_AIR_QUALITY, {
      method: 'POST',
      body: JSON.stringify({
        latitude,
        longitude,
      }),
    });

    if (!response.success) {
      throw new Error('Current air quality request failed');
    }

    return response.data;
  }

  /**
   * Get forecast
   */
  async getForecast(
    latitude: number,
    longitude: number,
    hours: number = 24
  ): Promise<AirQualityForecast> {
    const response = await this.request<{
      success: boolean;
      data: AirQualityForecast;
    }>(API_ENDPOINTS.FORECAST, {
      method: 'POST',
      body: JSON.stringify({
        latitude,
        longitude,
        hours,
      }),
    });

    if (!response.success) {
      throw new Error('Forecast request failed');
    }

    return response.data;
  }

  /**
   * Get health alerts
   */
  async getAlerts(
    latitude: number,
    longitude: number,
    sensitiveGroup: boolean = false
  ): Promise<HealthAlert[]> {
    const response = await this.request<{
      success: boolean;
      data: HealthAlert[];
    }>(API_ENDPOINTS.ALERTS, {
      method: 'POST',
      body: JSON.stringify({
        latitude,
        longitude,
        sensitiveGroup,
      }),
    });

    if (!response.success) {
      throw new Error('Alerts request failed');
    }

    return response.data;
  }
}

// Export singleton instance
export const airQualityAPI = new AirQualityAPIClient();
