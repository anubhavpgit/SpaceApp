/**
 * Centralized Color Configuration
 * All colors in the app are defined here for consistency
 */

// Pastel Color Palette
export const PASTEL_COLORS = {
  // Greens
  green: '#B8F3B8',
  seafoam: '#6BCF7F',
  mint: '#E8F3F1',

  // Yellows & Creams
  cream: '#FFF8E7',
  lightCream: '#FFFBF5',
  yellow: '#FFF4A3',
  golden: '#FFD93D',

  // Oranges & Peaches
  peach: '#FFE5D9',
  coral: '#FFD4A3',
  orange: '#FF8B6A',

  // Pinks & Reds
  pink: '#FF6B9D',
  lightPink: '#FF85A1',
  rose: '#FFB3BA',
  mauve: '#D1A3A4',

  // Purples
  lavender: '#D4B3E8',

  // Blues & Teals
  teal: '#4ECDC4',
  brightTeal: '#67E8D9',

  // Grays & Neutrals (for text and borders)
  deepBlueGray: '#2D4059',
  mediumBlueGray: '#5F6F81',
  lightBlueGray: '#8B95A5',
  softGray: '#A8B4C3',

  // Dark mode colors
  darkNavy: '#1A1A2E',
  darkSlateBlue: '#16213E',
  mediumNavy: '#0F3460',
  elevatedNavy: '#1E2A47',
  softWhite: '#F4F4F9',
  lightBlueyGray: '#C7D3DD',
  mediumGrayBlue: '#8F9BB3',
  mutedBlueGray: '#7A8CA0',

  // Pure colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// AQI Level Colors (Pastel versions)
export const AQI_LEVEL_COLORS = {
  good: PASTEL_COLORS.green,          // 0-50: Pastel green
  moderate: PASTEL_COLORS.yellow,     // 51-100: Pastel yellow
  unhealthySensitive: PASTEL_COLORS.coral,  // 101-150: Pastel coral
  unhealthy: PASTEL_COLORS.rose,      // 151-200: Pastel rose
  veryUnhealthy: PASTEL_COLORS.lavender,    // 201-300: Pastel lavender
  hazardous: PASTEL_COLORS.mauve,     // 301+: Pastel mauve
} as const;

// AQI Chart Colors (More saturated for better visibility in charts)
export const AQI_CHART_COLORS = {
  good: '#4CAF50',          // 0-50: Vibrant green
  moderate: '#FFC107',      // 51-100: Vibrant yellow/amber
  unhealthySensitive: '#FF9800',  // 101-150: Vibrant orange
  unhealthy: '#F44336',     // 151-200: Vibrant red
  veryUnhealthy: '#9C27B0',    // 201-300: Vibrant purple
  hazardous: '#6D4C41',     // 301+: Dark brown
} as const;

// Accent Colors (for UI elements)
export const ACCENT_COLORS = {
  primary: PASTEL_COLORS.pink,
  secondary: PASTEL_COLORS.teal,
  yellow: PASTEL_COLORS.golden,
  orange: PASTEL_COLORS.orange,
  blue: PASTEL_COLORS.seafoam,
} as const;

// Background Colors
export const BACKGROUND_COLORS = {
  light: {
    primary: PASTEL_COLORS.cream,
    secondary: PASTEL_COLORS.peach,
    tertiary: PASTEL_COLORS.mint,
    elevated: PASTEL_COLORS.lightCream,
  },
  dark: {
    primary: PASTEL_COLORS.darkNavy,
    secondary: PASTEL_COLORS.darkSlateBlue,
    tertiary: PASTEL_COLORS.mediumNavy,
    elevated: PASTEL_COLORS.elevatedNavy,
  },
} as const;

// Text Colors
export const TEXT_COLORS = {
  light: {
    primary: PASTEL_COLORS.deepBlueGray,
    secondary: PASTEL_COLORS.mediumBlueGray,
    tertiary: PASTEL_COLORS.lightBlueGray,
    inverse: PASTEL_COLORS.white,
    muted: PASTEL_COLORS.softGray,
  },
  dark: {
    primary: PASTEL_COLORS.softWhite,
    secondary: PASTEL_COLORS.lightBlueyGray,
    tertiary: PASTEL_COLORS.mediumGrayBlue,
    inverse: PASTEL_COLORS.darkNavy,
    muted: PASTEL_COLORS.mutedBlueGray,
  },
} as const;

// Helper function to create rgba from hex color
export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Border colors with opacity
export const createBorderColors = (baseColor: string) => ({
  light: hexToRgba(baseColor, 0.1),
  medium: hexToRgba(baseColor, 0.2),
  strong: hexToRgba(baseColor, 0.3),
});

// Overlay colors with opacity
export const createOverlayColors = (baseColor: string) => ({
  light: hexToRgba(baseColor, 0.5),
  medium: hexToRgba(baseColor, 0.7),
  dark: hexToRgba(baseColor, 0.15),
});

// AQI Background colors (with opacity)
export const AQI_BG_COLORS = {
  good: hexToRgba(AQI_LEVEL_COLORS.good, 0.15),
  moderate: hexToRgba(AQI_LEVEL_COLORS.moderate, 0.15),
  unhealthySensitive: hexToRgba(AQI_LEVEL_COLORS.unhealthySensitive, 0.15),
  unhealthy: hexToRgba(AQI_LEVEL_COLORS.unhealthy, 0.15),
  veryUnhealthy: hexToRgba(AQI_LEVEL_COLORS.veryUnhealthy, 0.15),
  hazardous: hexToRgba(AQI_LEVEL_COLORS.hazardous, 0.2),
} as const;

// Risk Level Colors (Pastel versions)
export const RISK_LEVEL_COLORS = {
  low: PASTEL_COLORS.seafoam,         // Low risk - pastel green
  moderate: PASTEL_COLORS.golden,     // Moderate risk - pastel yellow
  high: PASTEL_COLORS.orange,         // High risk - pastel coral/orange
  critical: PASTEL_COLORS.rose,       // Critical risk - pastel rose/red
} as const;

// Alert Severity Colors (Pastel versions)
export const ALERT_SEVERITY_COLORS = {
  info: PASTEL_COLORS.teal,           // Info - pastel teal
  warning: PASTEL_COLORS.golden,      // Warning - pastel yellow/gold
  critical: PASTEL_COLORS.rose,       // Critical - pastel rose
} as const;

// Alert Severity Background Colors (with opacity)
export const ALERT_SEVERITY_BG_COLORS = {
  info: hexToRgba(PASTEL_COLORS.teal, 0.12),
  warning: hexToRgba(PASTEL_COLORS.golden, 0.12),
  critical: hexToRgba(PASTEL_COLORS.rose, 0.12),
} as const;
