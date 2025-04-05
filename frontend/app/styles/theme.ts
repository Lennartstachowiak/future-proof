/**
 * Theme configuration for the restaurant prediction system
 * Based on the modern dashboard design inspiration
 */

export const colors = {
  // Primary colors
  primary: {
    light: '#e0ecff',
    main: '#4070f4',
    dark: '#3060d8',
    contrastText: '#ffffff',
  },
  // Status colors
  status: {
    success: {
      light: '#e6f7ef',
      main: '#34c77b',
      dark: '#2aa967',
    },
    warning: {
      light: '#fff8e6',
      main: '#ffb342',
      dark: '#f59e28',
    },
    error: {
      light: '#fdebeb',
      main: '#f86d6d',
      dark: '#e55757',
    },
    info: {
      light: '#e8f4fd',
      main: '#54a0ff',
      dark: '#3d8de1',
    },
  },
  // Gradients
  gradients: {
    pinkOrange: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    blueCyan: 'linear-gradient(135deg, #90caf9 0%, #80deea 100%)',
    purpleBlue: 'linear-gradient(135deg, #a29bfe 10%, #6c5ce7 100%)',
    greenTeal: 'linear-gradient(135deg, #81fbb8 0%, #28c76f 100%)',
  },
  // Neutral colors for backgrounds, text, etc.
  neutral: {
    50: '#f8fafc', // Lightest background
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a', // Darkest text
  },
  // Background colors
  background: {
    default: '#f8fafc', // Light gray background for the app
    paper: '#ffffff', // White background for cards
    card: '#ffffff',
    sidebar: '#ffffff',
  },
  // Text colors
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    disabled: '#94a3b8',
  },
};

export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontSizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

export const spacing = {
  0: '0',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  8: '2rem',         // 32px
  10: '2.5rem',      // 40px
  12: '3rem',        // 48px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  32: '8rem',        // 128px
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

export const borders = {
  none: 'none',
  thin: '1px solid',
  thick: '2px solid',
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',    // Fully rounded (circles)
};

export const zIndices = {
  0: 0,
  10: 10,    // Elements behind the app interface
  20: 20,    // App interface
  30: 30,    // Floating elements (tooltips, dropdowns)
  40: 40,    // Modals
  50: 50,    // Notifications, toasts
  auto: 'auto',
};

const theme = {
  colors,
  typography,
  spacing,
  shadows,
  borders,
  borderRadius,
  zIndices,
};

export default theme;
