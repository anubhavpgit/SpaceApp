import {
  BACKGROUND_COLORS,
  TEXT_COLORS,
  ACCENT_COLORS,
  PASTEL_COLORS,
  createBorderColors,
  createOverlayColors,
} from './colors';

// Light mode colors
const lightColors = {
  background: BACKGROUND_COLORS.light,
  text: TEXT_COLORS.light,
  border: createBorderColors(PASTEL_COLORS.deepBlueGray),
  overlay: {
    light: createOverlayColors(PASTEL_COLORS.cream).light,
    medium: createOverlayColors(PASTEL_COLORS.cream).medium,
    dark: createOverlayColors(PASTEL_COLORS.deepBlueGray).dark,
  },
  accent: ACCENT_COLORS,
};

// Dark mode colors
const darkColors = {
  background: BACKGROUND_COLORS.dark,
  text: TEXT_COLORS.dark,
  border: createBorderColors(PASTEL_COLORS.lightBlueyGray),
  overlay: {
    light: createOverlayColors(PASTEL_COLORS.darkNavy).light,
    medium: createOverlayColors(PASTEL_COLORS.darkNavy).medium,
    dark: createOverlayColors(PASTEL_COLORS.lightBlueyGray).dark,
  },
  accent: {
    primary: PASTEL_COLORS.lightPink,
    secondary: PASTEL_COLORS.brightTeal,
    yellow: PASTEL_COLORS.golden,
    orange: PASTEL_COLORS.orange,
    blue: PASTEL_COLORS.seafoam,
  },
};

export const createTheme = (isDark: boolean) => ({
  colors: isDark ? darkColors : lightColors,
  typography: {
    // Comic/Handwritten font families (exact names from @expo-google-fonts)
    families: {
      comic: 'ComicNeue_400Regular',
      comicBold: 'ComicNeue_700Bold',
      handwritten: 'PatrickHand_400Regular',
    },
    weights: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
      xxxl: 40,
    },
    lineHeights: {
      tight: 1.3,
      normal: 1.6,
      relaxed: 1.9,
    },
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 30,
    xxxl: 40,
  },
  // Irregular, hand-drawn style border radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
    scribble: 14, // For the scribble effect
  },
  // Softer, more cartoon-like shadows
  shadows: {
    none: {
      shadowColor: PASTEL_COLORS.transparent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: isDark ? PASTEL_COLORS.black : PASTEL_COLORS.deepBlueGray,
      shadowOffset: { width: 2, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    md: {
      shadowColor: isDark ? PASTEL_COLORS.black : PASTEL_COLORS.deepBlueGray,
      shadowOffset: { width: 3, height: 5 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 5,
    },
    lg: {
      shadowColor: isDark ? PASTEL_COLORS.black : PASTEL_COLORS.deepBlueGray,
      shadowOffset: { width: 4, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    xl: {
      shadowColor: isDark ? PASTEL_COLORS.black : PASTEL_COLORS.deepBlueGray,
      shadowOffset: { width: 5, height: 10 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 10,
    },
  },
  // Scribble/hand-drawn effects configuration
  scribble: {
    borderWidth: 3,
    borderStyle: 'solid' as const,
    roughness: 1.5,
    bowing: 2,
  },
});

// Default light theme for static usage
export const theme = createTheme(false);

export type Theme = ReturnType<typeof createTheme>;
