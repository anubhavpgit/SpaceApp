const lightColors = {
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F5F5F5',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#000000',
    secondary: '#404040',
    tertiary: '#737373',
    inverse: '#FFFFFF',
    muted: '#A3A3A3',
  },
  border: {
    light: 'rgba(0, 0, 0, 0.06)',
    medium: 'rgba(0, 0, 0, 0.1)',
    strong: 'rgba(0, 0, 0, 0.15)',
  },
  overlay: {
    light: 'rgba(0, 0, 0, 0.02)',
    medium: 'rgba(0, 0, 0, 0.05)',
    dark: 'rgba(0, 0, 0, 0.2)',
  },
  accent: {
    primary: '#000000',
    secondary: '#404040',
  },
};

const darkColors = {
  background: {
    primary: '#000000',
    secondary: '#0A0A0A',
    tertiary: '#1A1A1A',
    elevated: '#1A1A1A',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    tertiary: '#808080',
    inverse: '#000000',
    muted: '#606060',
  },
  border: {
    light: 'rgba(255, 255, 255, 0.06)',
    medium: 'rgba(255, 255, 255, 0.1)',
    strong: 'rgba(255, 255, 255, 0.15)',
  },
  overlay: {
    light: 'rgba(255, 255, 255, 0.02)',
    medium: 'rgba(255, 255, 255, 0.05)',
    dark: 'rgba(255, 255, 255, 0.2)',
  },
  accent: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
  },
};

export const createTheme = (isDark: boolean) => ({
  colors: isDark ? darkColors : lightColors,
  typography: {
    weights: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    sizes: {
      xs: 11,
      sm: 13,
      base: 15,
      lg: 18,
      xl: 22,
      xxl: 28,
      xxxl: 34,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
      elevation: 12,
    },
  },
});

// Default light theme for static usage
export const theme = createTheme(false);

export type Theme = ReturnType<typeof createTheme>;
