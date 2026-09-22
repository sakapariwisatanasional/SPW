/**
 * SPWN Apps 2.0 - Design System Configuration
 * Branding: Wonderful Indonesia
 */

export const THEME_CONFIG = {
  colors: {
    // Wonderful Indonesia Primary & Secondary Palette
    oceanBlue: {
      DEFAULT: '#0066B3',
      light: '#E6F0F8',
      hover: '#005291',
      dark: '#003E6D',
    },
    tropicalGreen: {
      DEFAULT: '#009B4D',
      light: '#E6F5ED',
      hover: '#00803F',
      dark: '#006632',
    },
    sunsetOrange: {
      DEFAULT: '#F7941D',
      light: '#FEF4E8',
      hover: '#DE7F12',
      dark: '#B8650A',
    },
    culturePurple: {
      DEFAULT: '#6A1B9A',
      light: '#F3E8F8',
      hover: '#54147B',
      dark: '#3E0D5B',
    },
    festivalMagenta: {
      DEFAULT: '#D81B60',
      light: '#FCE8F0',
      hover: '#B5144E',
      dark: '#8C0E3C',
    },
    indonesiaNight: {
      DEFAULT: '#0B1F33',
      surface: '#132A42',
      border: '#1E3B5B',
      muted: '#64748B',
    },
    background: {
      light: '#F5F7FA',
      card: '#FFFFFF',
      border: '#E2E8F0',
    },
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      heading: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
    },
    scale: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',      // 16px - Baseline
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
  },
  spacing: {
    containerPadding: '1.25rem', // 20px
    cardPadding: '1.25rem',
    buttonPaddingY: '0.5rem',
    buttonPaddingX: '1rem',
  },
  borderRadius: {
    sm: '0.375rem', // 6px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px (Cap on standard cards)
    full: '9999px', // For badges & pills
  },
} as const;

export type ThemeColors = typeof THEME_CONFIG.colors;
