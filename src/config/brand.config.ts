/**
 * SPWN Apps 2.0 - Brand System Configuration
 * Brand Identity: Wonderful Indonesia & SAKA Pariwisata
 * Location: src/config/brand.config.ts
 */

export const BRAND_TOKENS = {
  name: 'SPWN Apps 2.0',
  tagline: 'SAKA Pariwisata Network Indonesia',
  theme: 'Wonderful Indonesia Spectrum',
  
  // Wonderful Indonesia Color Palette Tokens
  colors: {
    oceanBlue: '#0066B3',       // Biru Bahari (Laut & Langit Nusantara - Primary Action)
    tropicalGreen: '#009B4D',   // Hijau Zamrud (Hutan, Alam & Sapta Pesona - Success)
    sunsetOrange: '#F7941D',    // Jingga Senja (Energi, Pemuda & Kehangatan - Accent/Warning)
    culturePurple: '#6A1B9A',   // Ungu Kebudayaan (Warisan Leluhur & Seni Luhur)
    festivalMagenta: '#D81B60', // Magenta Festival (Semarak Pariwisata & Kerajinan)
    indonesiaNight: '#0B1F33',  // Biru Malam Nusantara (Deep Slate/Navy - Text & Dark Shell)
    background: '#F5F7FA',      // Neutral Canvas Soft
    
    // Light Surfacing & Contrast
    surface: '#FFFFFF',
    surfaceSubtle: '#F8FAFC',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    
    // Semantic Status
    statusSuccess: '#009B4D',
    statusWarning: '#F7941D',
    statusDanger: '#DC2626',
    statusInfo: '#0066B3',
  },

  // Typography Settings
  typography: {
    fontDisplay: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontBody: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },

  // Sapta Pesona Standard
  saptaPesona: [
    { key: 'aman', label: 'Aman', icon: 'ShieldCheck', color: '#0066B3' },
    { key: 'tertib', label: 'Tertib', icon: 'ListOrdered', color: '#009B4D' },
    { key: 'bersih', label: 'Bersih', icon: 'Sparkles', color: '#0EA5E9' },
    { key: 'sejuk', label: 'Sejuk', icon: 'Wind', color: '#10B981' },
    { key: 'indah', label: 'Indah', icon: 'Eye', color: '#D81B60' },
    { key: 'ramah', label: 'Ramah', icon: 'Smile', color: '#F7941D' },
    { key: 'kenangan', label: 'Kenangan', icon: 'Heart', color: '#6A1B9A' }
  ]
} as const;

export type BrandColorKey = keyof typeof BRAND_TOKENS.colors;
