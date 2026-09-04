/**
 * Sky Blue Freshness Design System
 * Comprehensive color tokens untuk seluruh app
 */

// ============================================
// RAW COLOR PALETTE (5-stop ramps)
// ============================================
export const Colors = {
  // Primary: Dark Teal (056B8D)
  teal: {
    50: "#E8F4F8", // lightest
    100: "#B8DAEB",
    200: "#88C0DE",
    400: "#4A9CC8", // mid
    600: "#1E78A8",
    700: "#056B8D", // darkest / brand primary
    800: "#044B66",
    900: "#022E40",
  },

  // Secondary: Medium Blue (427AA1)
  blue: {
    50: "#F0F6FB",
    100: "#D1E3F0",
    200: "#B2D0E5",
    400: "#6BA8C8",
    600: "#4E8BA6",
    700: "#427AA1", // secondary accent
    800: "#2F5475",
    900: "#1C3149",
  },

  // Light: Sky (EBF2FA) — hampir putih, untuk soft backgrounds
  sky: {
    50: "#F8FAFB",
    100: "#F0F4F8",
    200: "#EBF2FA", // primary light bg
    400: "#D4DFE8",
    600: "#8B9AAC",
    700: "#5A6B7F",
    800: "#3D4A5C",
    900: "#1F2838",
  },

  // Success: Olive Green (679436)
  green: {
    50: "#F5F8F0",
    100: "#E1E9D4",
    200: "#CDDAB8",
    400: "#89A86F",
    600: "#6D8D47",
    700: "#679436", // success / positive
    800: "#4F7029",
    900: "#374A1B",
  },

  // Accent: Lime Yellow (A5BE00)
  lime: {
    50: "#FAFBF0",
    100: "#F3F6DB",
    200: "#EDF1C6",
    400: "#D4DF65",
    600: "#B4C81F",
    700: "#A5BE00", // bright accent
    800: "#7D8F00",
    900: "#556000",
  },

  // Neutral: Gray (untuk text, borders, surfaces)
  neutral: {
    0: "#FFFFFF",
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },

  // Semantic: Alert/Warning (use lime + orange gradient)
  warning: {
    50: "#FFFBF0",
    100: "#FFE5CC",
    200: "#FFD9B3",
    400: "#FFA94D",
    600: "#FF8C00",
    700: "#F59E0B",
    800: "#D97706",
    900: "#92400E",
  },

  // Semantic: Danger/Error (use red)
  red: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    400: "#F87171",
    600: "#DC2626",
    700: "#B91C1C",
    800: "#991B1B",
    900: "#7F1D1D",
  },
};

// ============================================
// SEMANTIC COLOR TOKENS (used in UI)
// ============================================
export const Semantic = {
  // Primary brand — BIRU TEAL (main brand color)
  primary: {
    light: Colors.teal[50],
    main: Colors.teal[700], // 056B8D — PRIMARY BLUE
    dark: Colors.teal[900],
  },

  // Secondary for variants — BIRU MEDIUM (secondary accent)
  secondary: {
    light: Colors.blue[100],
    main: Colors.blue[700], // 427AA1 — SECONDARY BLUE
    dark: Colors.blue[900],
  },

  // Success state (positive actions) — HIJAU UNTUK RECYCLING
  success: {
    light: Colors.green[100],
    main: Colors.green[700], // 679436 — SUCCESS/RECYCLING GREEN
    dark: Colors.green[900],
  },

  // Warning state (alerts, caution)
  warning: {
    light: Colors.warning[100],
    main: Colors.warning[700], // F59E0B
    dark: Colors.warning[900],
  },

  // Danger state (destructive, errors)
  danger: {
    light: Colors.red[100],
    main: Colors.red[700], // B91C1C
    dark: Colors.red[900],
  },

  // Accent: lime untuk highlight/emphasis
  accent: {
    light: Colors.lime[100],
    main: Colors.lime[700], // A5BE00
    dark: Colors.lime[900],
  },

  // Text
  text: {
    primary: Colors.neutral[900], // #111827 - body text
    secondary: Colors.neutral[600], // #4B5563 - supporting text
    muted: Colors.neutral[400], // #9CA3AF - captions, placeholder
    light: Colors.neutral[0], // #FFFFFF - on dark bg
  },

  // Background & surfaces
  background: {
    primary: Colors.neutral[0], // #FFFFFF - main bg
    secondary: Colors.sky[200], // #EBF2FA - card bg / light section
    tertiary: Colors.sky[100], // #F0F4F8 - hover state
    dark: Colors.neutral[900], // #111827 - for dark mode
  },

  // Borders
  border: {
    light: Colors.neutral[200], // #E5E7EB - default border
    main: Colors.neutral[300], // #D1D5DB - strong border
    dark: Colors.neutral[500], // #6B7280 - heavy divider
  },
};

// ============================================
// COMPONENT-SPECIFIC TOKENS
// ============================================
export const Components = {
  // Buttons
  button: {
    primary: {
      bg: Semantic.primary.main,
      text: Colors.neutral[0],
      hover: Colors.teal[800],
      active: Colors.teal[900],
    },
    secondary: {
      bg: Semantic.secondary.light,
      text: Semantic.secondary.main,
      hover: Semantic.secondary.light,
      border: Semantic.secondary.main,
    },
    success: {
      bg: Semantic.success.main,
      text: Colors.neutral[0],
      hover: Colors.green[800],
      active: Colors.green[900],
    },
    ghost: {
      bg: "transparent",
      text: Semantic.primary.main,
      border: Semantic.border.light,
      hover: Semantic.background.secondary,
    },
  },

  // Cards & containers
  card: {
    bg: Semantic.background.primary,
    bgLight: Semantic.background.secondary,
    border: Semantic.border.light,
    shadow: "rgba(0, 0, 0, 0.08)",
  },

  // Inputs
  input: {
    bg: Colors.neutral[0],
    border: Semantic.border.light,
    borderActive: Semantic.primary.main,
    text: Semantic.text.primary,
    placeholder: Semantic.text.muted,
  },

  // Headers
  header: {
    bg: Colors.neutral[0],
    border: Semantic.border.light,
    text: Semantic.text.primary,
    badgeText: Semantic.primary.main,
  },

  // Modals & overlays
  modal: {
    bg: Colors.neutral[0],
    overlay: "rgba(0, 0, 0, 0.45)",
  },

  // Badges & status
  badge: {
    success: Semantic.success.light,
    successText: Semantic.success.dark,
    warning: Colors.warning[100],
    warningText: Colors.warning[800],
    danger: Colors.red[100],
    dangerText: Colors.red[800],
    info: Semantic.background.secondary,
    infoText: Semantic.primary.main,
  },

  // Icon wrappers (colored circles)
  iconWrapper: {
    success: {
      bg: Colors.green[100],
      color: Semantic.success.main,
    },
    warning: {
      bg: Colors.warning[100],
      color: Colors.warning[700],
    },
    danger: {
      bg: Colors.red[100],
      color: Colors.red[700],
    },
    primary: {
      bg: Colors.teal[100],
      color: Semantic.primary.main,
    },
    info: {
      bg: Colors.blue[100],
      color: Semantic.secondary.main,
    },
  },
};

// ============================================
// SPACING TOKENS (already in original theme)
// ============================================
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// ============================================
// TYPOGRAPHY (already in original theme)
// ============================================
export const Typography = {
  fontFamily: {
    primary: "Poppins_700Bold",
    secondary: "Poppins_600SemiBold",
    body: "Poppins_400Regular",
  },
  size: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 22,
    xxxl: 24,
    huge: 32,
  },
};

// ============================================
// BORDER RADIUS
// ============================================
export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// ============================================
// SHADOWS
// ============================================
export const Shadows = {
  sm: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
};

// ============================================
// DARK MODE VARIANTS (future-proof)
// ============================================
export const DarkMode = {
  background: {
    primary: Colors.neutral[900],
    secondary: Colors.neutral[800],
    tertiary: Colors.neutral[700],
  },
  text: {
    primary: Colors.neutral[0],
    secondary: Colors.neutral[300],
    muted: Colors.neutral[400],
  },
  border: {
    light: Colors.neutral[700],
    main: Colors.neutral[600],
  },
};

export default {
  Colors,
  Semantic,
  Components,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
  DarkMode,
};
