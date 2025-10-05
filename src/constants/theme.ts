// Pastel Comic/Cartoon Color Palette
const lightColors = {
  background: {
    primary: '#FFF8E7',      // Soft cream yellow
    secondary: '#FFE5D9',    // Peachy pastel
    tertiary: '#E8F3F1',     // Mint pastel
    elevated: '#FFFBF5',     // Light cream
  },
  text: {
    primary: '#2D4059',      // Deep blue-gray for comic text
    secondary: '#5F6F81',    // Medium blue-gray
    tertiary: '#8B95A5',     // Light blue-gray
    inverse: '#FFFFFF',
    muted: '#A8B4C3',        // Soft gray
  },
  border: {
    light: 'rgba(45, 64, 89, 0.1)',
    medium: 'rgba(45, 64, 89, 0.2)',
    strong: 'rgba(45, 64, 89, 0.3)',
  },
  overlay: {
    light: 'rgba(255, 248, 231, 0.5)',
    medium: 'rgba(255, 248, 231, 0.7)',
    dark: 'rgba(45, 64, 89, 0.15)',
  },
  accent: {
    primary: '#FF6B9D',      // Pink pastel (like lighthouse stripes)
    secondary: '#4ECDC4',    // Teal pastel (like lighthouse blue)
    yellow: '#FFD93D',       // Golden yellow (like lighthouse light)
    orange: '#FF8B6A',       // Coral orange
    blue: '#6BCF7F',         // Seafoam green
  },
};

// Dark mode with softer pastels
const darkColors = {
  background: {
    primary: '#1A1A2E',      // Deep navy
    secondary: '#16213E',    // Dark slate blue
    tertiary: '#0F3460',     // Medium navy
    elevated: '#1E2A47',     // Elevated navy
  },
  text: {
    primary: '#F4F4F9',      // Soft white
    secondary: '#C7D3DD',    // Light blue-gray
    tertiary: '#8F9BB3',     // Medium gray-blue
    inverse: '#1A1A2E',
    muted: '#7A8CA0',        // Muted blue-gray
  },
  border: {
    light: 'rgba(199, 211, 221, 0.1)',
    medium: 'rgba(199, 211, 221, 0.2)',
    strong: 'rgba(199, 211, 221, 0.3)',
  },
  overlay: {
    light: 'rgba(26, 26, 46, 0.5)',
    medium: 'rgba(26, 26, 46, 0.7)',
    dark: 'rgba(199, 211, 221, 0.15)',
  },
  accent: {
    primary: '#FF85A1',      // Bright pink pastel
    secondary: '#67E8D9',    // Bright teal
    yellow: '#FFE66D',       // Bright yellow
    orange: '#FFA384',       // Bright coral
    blue: '#7FE8A3',         // Bright seafoam
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
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: isDark ? '#000' : '#2D4059',
      shadowOffset: { width: 2, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    md: {
      shadowColor: isDark ? '#000' : '#2D4059',
      shadowOffset: { width: 3, height: 5 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 5,
    },
    lg: {
      shadowColor: isDark ? '#000' : '#2D4059',
      shadowOffset: { width: 4, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    xl: {
      shadowColor: isDark ? '#000' : '#2D4059',
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
