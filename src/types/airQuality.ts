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

// Persona Types
export type PersonaType =
  | 'general'
  | 'vulnerable_population'
  | 'school_administrator'
  | 'eldercare_manager'
  | 'government_official'
  | 'transportation_authority'
  | 'parks_recreation'
  | 'emergency_response'
  | 'insurance_assessor'
  | 'citizen_scientist';

export interface PersonaDefinition {
  type: PersonaType;
  name: string;
  display_name: string;
  description: string;
  icon: string;
}

// Persona-Specific Insights
export interface TimeWindow {
  start: string;
  end: string;
  aqi: number;
  safe_for: string;
  recommendation: string;
}

export interface RiskAssessment {
  level: 'low' | 'moderate' | 'high' | 'critical';
  affected_groups: string[];
  specific_risks: string;
}

export interface DataConfidence {
  level: 'low' | 'medium' | 'high';
  explanation: string;
}

export interface PersonaInsights {
  immediate_action: string;
  time_windows: TimeWindow[];
  risk_assessment: RiskAssessment;
  recommendations: string[];
  context: string;
  comparative: string;
  data_confidence: DataConfidence;
  key_insight: string;
}

// AI Summary interfaces
export interface AISummary {
  brief: string;
  detailed: string;
  [key: string]: string | string[];  // Allow for additional fields like recommendations, insight, etc.
}

// Dashboard Data with Persona Support
export interface DashboardData {
  location: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
    region?: string;
    timezone?: string;
    displayName: string;
  };
  currentAQI: {
    raw: {
      aqi: number;
      category: AQICategory;
      dominantPollutant: string;
      pollutants: Pollutants;
      lastUpdated: string;
    };
    aiSummary: AISummary;
  };
  dataSources: {
    raw: any;
    aiSummary: AISummary;
  };
  weather: {
    raw: any;
    aiSummary: AISummary;
  };
  forecast24h: {
    raw: {
      generatedAt: string;
      modelVersion: string;
      modelConfidence: number;
      hourly: any[];
      summary: {
        best: { timestamp: string; aqi: number; hour: string };
        worst: { timestamp: string; aqi: number; hour: string };
        trend: 'improving' | 'worsening' | 'stable';
      };
    };
    aiSummary: AISummary;
  };
  historical7d: {
    raw: {
      period: string;
      interval: string;
      readings: any[];
      statistics: any;
      patterns: any;
    };
    aiSummary: AISummary;
  };
  healthAlerts: {
    raw: {
      activeAlerts: any[];
      upcomingAlerts: any[];
    };
    aiSummary: AISummary;
  };
  insights: {
    comparative: any;
    personalizedTips: string[];
    nextMilestone: string;
  };
  metadata: {
    apiVersion: string;
    processingTime: number;
    cacheStatus: string;
    dataCompleteness: number;
    nextUpdate: string;
    dataSourcesUsed: string[];
  };
  personaInsights?: PersonaInsights;  // Optional - only present if persona selected
  persona?: PersonaType;               // Current persona if selected
}
