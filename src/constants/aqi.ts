import { AQICategory } from '../types/airQuality';
import { AQI_LEVEL_COLORS, AQI_BG_COLORS as AQI_BACKGROUND_COLORS } from './colors';

export const AQI_RANGES = {
  good: { min: 0, max: 50 },
  moderate: { min: 51, max: 100 },
  'unhealthy-sensitive': { min: 101, max: 150 },
  unhealthy: { min: 151, max: 200 },
  'very-unhealthy': { min: 201, max: 300 },
  hazardous: { min: 301, max: 500 },
} as const;

export const AQI_COLORS = {
  good: AQI_LEVEL_COLORS.good,
  moderate: AQI_LEVEL_COLORS.moderate,
  'unhealthy-sensitive': AQI_LEVEL_COLORS.unhealthySensitive,
  unhealthy: AQI_LEVEL_COLORS.unhealthy,
  'very-unhealthy': AQI_LEVEL_COLORS.veryUnhealthy,
  hazardous: AQI_LEVEL_COLORS.hazardous,
} as const;

// Background colors for cards (softer versions)
export const AQI_BG_COLORS = {
  good: AQI_BACKGROUND_COLORS.good,
  moderate: AQI_BACKGROUND_COLORS.moderate,
  'unhealthy-sensitive': AQI_BACKGROUND_COLORS.unhealthySensitive,
  unhealthy: AQI_BACKGROUND_COLORS.unhealthy,
  'very-unhealthy': AQI_BACKGROUND_COLORS.veryUnhealthy,
  hazardous: AQI_BACKGROUND_COLORS.hazardous,
} as const;

export const AQI_LABELS = {
  good: 'Good',
  moderate: 'Moderate',
  'unhealthy-sensitive': 'Unhealthy for Sensitive Groups',
  unhealthy: 'Unhealthy',
  'very-unhealthy': 'Very Unhealthy',
  hazardous: 'Hazardous',
} as const;

export const AQI_DESCRIPTIONS = {
  good: 'Air quality is satisfactory, and air pollution poses little or no risk.',
  moderate: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.',
  'unhealthy-sensitive': 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
  unhealthy: 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.',
  'very-unhealthy': 'Health alert: The risk of health effects is increased for everyone.',
  hazardous: 'Health warning of emergency conditions: everyone is more likely to be affected.',
} as const;

export const POLLUTANT_INFO = {
  pm25: {
    name: 'PM2.5',
    fullName: 'Fine Particulate Matter',
    unit: 'μg/m³',
    description: 'Tiny particles that can penetrate deep into the lungs',
  },
  pm10: {
    name: 'PM10',
    fullName: 'Particulate Matter',
    unit: 'μg/m³',
    description: 'Inhalable particles that can affect the respiratory system',
  },
  o3: {
    name: 'O₃',
    fullName: 'Ozone',
    unit: 'ppb',
    description: 'Ground-level ozone can trigger breathing problems',
  },
  no2: {
    name: 'NO₂',
    fullName: 'Nitrogen Dioxide',
    unit: 'ppb',
    description: 'Gas primarily from vehicle emissions',
  },
  so2: {
    name: 'SO₂',
    fullName: 'Sulfur Dioxide',
    unit: 'ppb',
    description: 'Gas from industrial facilities and power plants',
  },
  co: {
    name: 'CO',
    fullName: 'Carbon Monoxide',
    unit: 'ppm',
    description: 'Colorless, odorless gas from combustion',
  },
} as const;

export const SENSITIVE_GROUPS = [
  'Children',
  'Elderly (65+)',
  'People with asthma',
  'People with heart disease',
  'People with lung disease',
  'Pregnant women',
  'Outdoor workers',
] as const;

export function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy-sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very-unhealthy';
  return 'hazardous';
}

export function getAQIColor(category: AQICategory): string {
  return AQI_COLORS[category];
}

export function getAQILabel(category: AQICategory): string {
  return AQI_LABELS[category];
}

export function getAQIDescription(category: AQICategory): string {
  return AQI_DESCRIPTIONS[category];
}
