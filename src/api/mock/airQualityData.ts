import {
  AQIReading,
  AirQualityForecast,
  HealthAlert,
  Location,
  ForecastItem,
} from '../../types/airQuality';
import { getAQICategory } from '../../constants/aqi';

export const MOCK_LOCATION: Location = {
  latitude: 37.7749,
  longitude: -122.4194,
  city: 'San Francisco',
  country: 'United States',
  timezone: 'America/Los_Angeles',
};

export const MOCK_CURRENT_AQI: AQIReading = {
  timestamp: new Date(),
  location: MOCK_LOCATION,
  aqi: 68,
  category: 'moderate',
  pollutants: {
    pm25: 22.5,
    pm10: 35.2,
    o3: 45.8,
    no2: 28.3,
    so2: 12.1,
    co: 0.6,
  },
  source: 'aggregated',
  confidence: 0.92,
  dominantPollutant: 'pm25',
};

// Generate 24-hour forecast
const generateForecast = (): ForecastItem[] => {
  const forecasts: ForecastItem[] = [];
  const baseTime = new Date();

  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(baseTime.getTime() + i * 60 * 60 * 1000);
    const hour = timestamp.getHours();

    // Simulate AQI variation throughout the day
    let aqi: number;
    if (hour >= 6 && hour <= 9) {
      aqi = 75 + Math.random() * 25; // Morning rush hour
    } else if (hour >= 17 && hour <= 20) {
      aqi = 85 + Math.random() * 30; // Evening rush hour
    } else if (hour >= 0 && hour <= 5) {
      aqi = 40 + Math.random() * 20; // Night time
    } else {
      aqi = 55 + Math.random() * 25; // Daytime
    }

    const category = getAQICategory(aqi);

    forecasts.push({
      timestamp,
      aqi: Math.round(aqi),
      category,
      confidence: 0.85 - (i * 0.02), // Confidence decreases with time
      pollutants: {
        pm25: 15 + Math.random() * 20,
        pm10: 25 + Math.random() * 30,
        o3: 35 + Math.random() * 25,
        no2: 20 + Math.random() * 20,
        so2: 8 + Math.random() * 10,
        co: 0.4 + Math.random() * 0.5,
      },
      temperature: 15 + Math.random() * 10,
      humidity: 50 + Math.random() * 30,
      windSpeed: 5 + Math.random() * 10,
    });
  }

  return forecasts;
};

export const MOCK_FORECAST: AirQualityForecast = {
  location: MOCK_LOCATION,
  forecasts: generateForecast(),
  generatedAt: new Date(),
  modelVersion: 'v1.2.0',
};

export const MOCK_HEALTH_ALERTS: HealthAlert[] = [
  {
    id: 'alert-1',
    severity: 'warning',
    category: 'moderate',
    title: 'Moderate Air Quality',
    message: 'Air quality is acceptable for most people. However, sensitive groups should consider limiting prolonged outdoor exertion.',
    recommendations: [
      'Unusually sensitive people should consider reducing prolonged outdoor exertion',
      'Keep windows closed during peak traffic hours',
      'Use air purifiers indoors if available',
    ],
    affectedGroups: ['People with asthma', 'Children', 'Elderly (65+)'],
    validFrom: new Date(),
    validTo: new Date(Date.now() + 6 * 60 * 60 * 1000),
    location: MOCK_LOCATION,
  },
];

// Generate historical data for the past 7 days
export const MOCK_HISTORICAL_DATA = (() => {
  const readings: AQIReading[] = [];
  const now = new Date();

  for (let day = 6; day >= 0; day--) {
    for (let hour = 0; hour < 24; hour += 4) {
      const timestamp = new Date(now.getTime() - day * 24 * 60 * 60 * 1000 + hour * 60 * 60 * 1000);
      const baseAqi = 50 + Math.random() * 50;
      const aqi = Math.round(baseAqi);

      readings.push({
        timestamp,
        location: MOCK_LOCATION,
        aqi,
        category: getAQICategory(aqi),
        pollutants: {
          pm25: 10 + Math.random() * 30,
          pm10: 20 + Math.random() * 40,
          o3: 30 + Math.random() * 30,
          no2: 15 + Math.random() * 25,
          so2: 5 + Math.random() * 15,
          co: 0.3 + Math.random() * 0.7,
        },
        source: 'aggregated',
        confidence: 0.9,
      });
    }
  }

  return readings;
})();

// Mock weather data
export const MOCK_WEATHER = {
  timestamp: new Date(),
  temperature: 18,
  humidity: 65,
  windSpeed: 12,
  windDirection: 225,
  pressure: 1013,
  precipitation: 0,
  conditions: 'Partly Cloudy',
};

// Additional locations for testing
export const MOCK_LOCATIONS: Location[] = [
  {
    latitude: 37.7749,
    longitude: -122.4194,
    city: 'San Francisco',
    country: 'United States',
  },
  {
    latitude: 40.7128,
    longitude: -74.006,
    city: 'New York',
    country: 'United States',
  },
  {
    latitude: 34.0522,
    longitude: -118.2437,
    city: 'Los Angeles',
    country: 'United States',
  },
  {
    latitude: 51.5074,
    longitude: -0.1278,
    city: 'London',
    country: 'United Kingdom',
  },
  {
    latitude: 35.6762,
    longitude: 139.6503,
    city: 'Tokyo',
    country: 'Japan',
  },
];

// Mock severe pollution scenario
export const MOCK_SEVERE_AQI: AQIReading = {
  timestamp: new Date(),
  location: MOCK_LOCATION,
  aqi: 168,
  category: 'unhealthy',
  pollutants: {
    pm25: 89.5,
    pm10: 142.3,
    o3: 78.2,
    no2: 95.1,
    so2: 45.6,
    co: 2.3,
  },
  source: 'aggregated',
  confidence: 0.88,
  dominantPollutant: 'pm25',
};

export const MOCK_SEVERE_ALERT: HealthAlert = {
  id: 'alert-severe',
  severity: 'critical',
  category: 'unhealthy',
  title: 'Unhealthy Air Quality Alert',
  message: 'Air quality is unhealthy for everyone. Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
  recommendations: [
    'Avoid prolonged outdoor activities',
    'Keep windows and doors closed',
    'Run air purifiers on high',
    'Wear N95 masks if going outside',
    'Check on vulnerable family members and neighbors',
  ],
  affectedGroups: ['Everyone', 'Especially sensitive groups'],
  validFrom: new Date(),
  validTo: new Date(Date.now() + 12 * 60 * 60 * 1000),
  location: MOCK_LOCATION,
};
