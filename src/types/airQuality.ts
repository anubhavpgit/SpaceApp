export type AQICategory =
  | 'good'
  | 'moderate'
  | 'unhealthy-sensitive'
  | 'unhealthy'
  | 'very-unhealthy'
  | 'hazardous';

export type DataSource = 'tempo' | 'ground' | 'aggregated';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timezone?: string;
}

export interface Pollutants {
  pm25: number;    // PM2.5 (μg/m³)
  pm10: number;    // PM10 (μg/m³)
  o3: number;      // Ozone (ppb)
  no2: number;     // Nitrogen Dioxide (ppb)
  so2: number;     // Sulfur Dioxide (ppb)
  co: number;      // Carbon Monoxide (ppm)
}

export interface AQIReading {
  timestamp: Date;
  location: Location;
  aqi: number;
  category: AQICategory;
  pollutants: Pollutants;
  source: DataSource;
  confidence: number; // 0-1
  dominantPollutant?: keyof Pollutants;
}

export interface ForecastItem {
  timestamp: Date;
  aqi: number;
  category: AQICategory;
  confidence: number;
  pollutants: Pollutants;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
}

export interface AirQualityForecast {
  location: Location;
  forecasts: ForecastItem[];
  generatedAt: Date;
  modelVersion: string;
}

export interface HealthAlert {
  id: string;
  severity: AlertSeverity;
  category: AQICategory;
  title: string;
  message: string;
  recommendations: string[];
  affectedGroups: string[];
  validFrom: Date;
  validTo: Date;
  location: Location;
}

export interface HistoricalData {
  location: Location;
  readings: AQIReading[];
  period: {
    start: Date;
    end: Date;
  };
}

export interface WeatherData {
  timestamp: Date;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  precipitation: number;
  conditions: string;
}

// Card Data Structures
export interface HealthAlertCardData {
  rawData: {
    alert: HealthAlert;
    timestamp: Date;
  };
  summary: {
    severity: AlertSeverity;
    title: string;
    affectedGroupsCount: number;
    recommendationsCount: number;
  };
}

export interface ForecastCardData {
  rawData: {
    forecasts: ForecastItem[];
    location: Location;
    generatedAt: Date;
  };
  summary: {
    peakAQI: number;
    lowestAQI: number;
    averageAQI: number;
    trend: 'improving' | 'worsening' | 'stable';
  };
}

export interface WeatherCardData {
  rawData: {
    weather: WeatherData;
  };
  summary: {
    temperature: number;
    conditions: string;
    windSpeed: number;
    humidity: number;
  };
}

export interface HistoricalTrendCardData {
  rawData: {
    readings: AQIReading[];
    period: '24h' | '7d' | '30d';
  };
  summary: {
    averageAQI: number;
    minAQI: number;
    maxAQI: number;
    dataPoints: number;
  };
}
