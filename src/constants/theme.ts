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
    50: "#E8F4F8",
    100: "#B8DAEB",
    200: "#88C0DE",
    400: "#4A9CC8",
    600: "#1E78A8",
    700: "#056B8D",
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
    700: "#427AA1",
    800: "#2F5475",
    900: "#1C3149",
  },

  // Light: Sky (EBF2FA)
  sky: {
    50: "#F8FAFB",
    100: "#F0F4F8",
    200: "#EBF2FA",
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
    700: "#679436",
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
    700: "#A5BE00",
    800: "#7D8F00",
    900: "#556000",
  },

  // Neutral: Gray
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

  // Warning
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

  // Red
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

  // Compatibility aliases for the starter components and native tabs.
  light: {
    text: "#111827",
    textSecondary: "#4B5563",
    background: "#FFFFFF",
    tint: "#056B8D",
    icon: "#4B5563",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#056B8D",
    backgroundElement: "#F3F4F6",
    backgroundSelected: "#E8F4F8",
  },
  dark: {
    text: "#F9FAFB",
    textSecondary: "#D1D5DB",
    background: "#111827",
    tint: "#88C0DE",
    icon: "#D1D5DB",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#88C0DE",
    backgroundElement: "#1F2937",
    backgroundSelected: "#044B66",
  },
};

// ============================================
// SEMANTIC TOKENS
// ============================================
export const Semantic = {
  primary: {
    light: Colors.teal[50],
    main: Colors.teal[700], // #056B8D - BIRU PRIMARY
    dark: Colors.teal[900],
  },

  secondary: {
    light: Colors.blue[100],
    main: Colors.blue[700],
    dark: Colors.blue[900],
  },

  success: {
    light: Colors.green[100],
    main: Colors.green[700], // #679436 - HIJAU
    dark: Colors.green[900],
  },

  warning: {
    light: Colors.warning[100],
    main: Colors.warning[700],
    dark: Colors.warning[900],
  },

  danger: {
    light: Colors.red[100],
    main: Colors.red[700],
    dark: Colors.red[900],
  },

  accent: {
    light: Colors.lime[100],
    main: Colors.lime[700],
    dark: Colors.lime[900],
  },

  text: {
    primary: Colors.neutral[900],
    secondary: Colors.neutral[600],
    muted: Colors.neutral[400],
    light: Colors.neutral[0],
  },

  background: {
    primary: Colors.neutral[0],
    secondary: Colors.sky[200],
    tertiary: Colors.sky[100],
    dark: Colors.neutral[900],
  },

  border: {
    light: Colors.neutral[200],
    main: Colors.neutral[300],
    dark: Colors.neutral[500],
  },
};

// ============================================
// COMPONENT TOKENS
// ============================================
export const Components = {
  button: {
    primary: {
      bg: Semantic.primary.main,
      text: Colors.neutral[0],
      hover: Colors.teal[800],
    },
    success: {
      bg: Semantic.success.main,
      text: Colors.neutral[0],
      hover: Colors.green[800],
    },
    ghost: {
      bg: "transparent",
      text: Semantic.primary.main,
      border: Semantic.border.light,
    },
  },

  card: {
    bg: Semantic.background.primary,
    bgLight: Semantic.background.secondary,
    border: Semantic.border.light,
  },

  header: {
    bg: Colors.neutral[0],
    border: Semantic.border.light,
    text: Semantic.text.primary,
  },

  modal: {
    bg: Colors.neutral[0],
    overlay: "rgba(0, 0, 0, 0.45)",
  },

  badge: {
    success: Colors.green[100],
    successText: Colors.green[800],
    warning: Colors.warning[100],
    warningText: Colors.warning[800],
    danger: Colors.red[100],
    dangerText: Colors.red[800],
  },

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
// SPACING & UTILITIES
// ============================================
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const Fonts = {
  mono: "SpaceMono",
};

export type ThemeColor =
  | "text"
  | "textSecondary"
  | "background"
  | "backgroundElement"
  | "backgroundSelected";

export const MaxContentWidth = 960;

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export default {
  Colors,
  Semantic,
  Components,
  Spacing,
  BorderRadius,
};
