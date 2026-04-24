// src/styles/tokens.js
// Single source of truth for all design values.
// Import from here, don't hard-code colors or sizes in components.

export const colors = {
  // Brand
  brand: '#1A6FE8',           // primary blue
  brandHover: '#155cc4',
  brandLight: '#eef4fd',      // tinted backgrounds for icons, highlights
  brandSoft: '#e8f0fe',       // even lighter tint, for pill badges

  // Accent
  accent: '#f97316',          // orange — used for CTAs, $ highlights
  accentHover: '#ea670d',
  accentLight: '#fff4ec',
  accentSoft: 'rgba(249,115,22,0.12)',

  // Neutrals (navy-based dark, slate-based light)
  navy: '#0F1F3D',            // primary text, dark section bg
  navyDark: '#162032',        // even darker (AI card bg)
  navyLine: '#1e3a5f',        // borders on dark bg
  navyLineSoft: '#1e2d40',    // softer dividers on dark bg

  // Grays (Slate scale — matches Tailwind slate)
  slate950: '#020617',
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate700: '#334155',        // body text
  slate600: '#475569',        // secondary text
  slate500: '#64748b',        // muted text
  slate400: '#94a3b8',        // placeholder, meta
  slate300: '#cbd5e1',
  slate200: '#e2e8f0',        // borders
  slate100: '#f1f5f9',        // dividers, subtle bg
  slate50: '#f8fafc',         // page bg tint

  // Surface
  white: '#ffffff',
  bg: '#ffffff',
  bgSubtle: '#f8fafc',        // section alt bg
  border: '#e8edf2',          // default border
  borderSoft: '#f1f5f9',      // subtle border

  // Semantic
  success: '#16a34a',
  successBg: '#dcfce7',
  successText: '#166534',
  warning: '#d97706',
  warningBg: '#fef9c3',
  warningText: '#854d0e',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  dangerText: '#991b1b',
  info: '#1A6FE8',
  infoBg: '#eef4fd',
  infoText: '#1e40af',
}

// 4px base grid. Always use these, never raw pixel values for spacing.
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
}

export const radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 14,
  '3xl': 16,
  pill: 100,
  full: 9999,
}

export const shadow = {
  none: 'none',
  sm: '0 1px 2px rgba(15, 31, 61, 0.04)',
  md: '0 2px 8px rgba(15, 31, 61, 0.06)',
  lg: '0 4px 16px rgba(15, 31, 61, 0.08)',
  xl: '0 8px 24px rgba(15, 31, 61, 0.1)',
  brand: '0 6px 20px rgba(26, 111, 232, 0.28)',
  accent: '0 6px 20px rgba(249, 115, 22, 0.35)',
}

// Inter-only type system. All font sizes in px, line heights unitless.
export const font = {
  family: {
    sans: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', ui-monospace, Menlo, monospace",
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  // Type scale — use these, don't pick arbitrary sizes
  size: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 15,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 30,
    '5xl': 36,
    '6xl': 42,
    '7xl': 52,
    '8xl': 64,
  },
  lineHeight: {
    tight: 1.15,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.6,
    loose: 1.75,
  },
  letterSpacing: {
    tighter: -1.5,
    tight: -0.8,
    snug: -0.4,
    normal: 0,
    wide: 0.3,
    wider: 0.8,
    widest: 1.5,
  },
}

export const transition = {
  fast: 'all 120ms ease',
  base: 'all 180ms ease',
  slow: 'all 280ms ease',
}

// Common z-index values
export const z = {
  base: 1,
  dropdown: 10,
  sticky: 50,
  overlay: 80,
  modal: 100,
  toast: 200,
}

// Convenience: combined default for new components
export const defaults = {
  fontFamily: font.family.sans,
  color: colors.slate700,
  fontSize: font.size.base,
  lineHeight: font.lineHeight.normal,
}
