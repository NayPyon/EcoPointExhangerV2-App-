/**
 * EcoPoint V2 — Premium Design System
 * "Deep Teal Freshness" — Modern, Glassmorphism-inspired
 */

// ============================================
// RAW COLOR PALETTE
// ============================================
export const Colors = {
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

  green: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    400: "#34D399",
    500: "#10B981",
    600: "#059669",
    700: "#047857",
    800: "#065F46",
    900: "#064E3B",
  },

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

  warning: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    400: "#FBBF24",
    600: "#D97706",
    700: "#F59E0B",
    800: "#B45309",
    900: "#92400E",
  },

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

  // Compatibility aliases for starter components
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
    main: Colors.teal[700],
    dark: Colors.teal[900],
  },

  secondary: {
    light: Colors.blue[100],
    main: Colors.blue[700],
    dark: Colors.blue[900],
  },

  success: {
    light: Colors.green[100],
    main: Colors.green[500],
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
    shadow: "rgba(0, 0, 0, 0.08)",
  },

  header: {
    bg: Colors.neutral[0],
    border: Semantic.border.light,
    text: Semantic.text.primary,
  },

  modal: {
    bg: Colors.neutral[0],
    overlay: "rgba(0, 0, 0, 0.5)",
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

  glass: {
    bg: "rgba(255, 255, 255, 0.15)",
    bgStrong: "rgba(255, 255, 255, 0.25)",
    border: "rgba(255, 255, 255, 0.3)",
    bgDark: "rgba(0, 0, 0, 0.06)",
  },
};

// ============================================
// SPACING
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
  xxxl: 48,
};

// ============================================
// TYPOGRAPHY (NEW)
// ============================================
export const Typography = {
  fontFamily: {
    primary: "Poppins_700Bold",
    secondary: "Poppins_600SemiBold",
    medium: "Poppins_500Medium",
    body: "Poppins_400Regular",
    inter: "Inter_400Regular",
    interMedium: "Inter_600SemiBold",
    interBold: "Inter_700Bold",
  },
  size: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 32,
    hero: 48,
  },
  lineHeight: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
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
  xxl: 28,
  full: 9999,
};

// ============================================
// SHADOWS (NEW)
// ============================================
export const Shadows = {
  sm: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  }),
};

// ============================================
// ANIMATION CONFIG (NEW)
// ============================================
export const AnimConfig = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  spring: {
    gentle: { damping: 20, stiffness: 150 },
    bouncy: { damping: 12, stiffness: 200 },
    snappy: { damping: 15, stiffness: 400 },
  },
  stagger: {
    fast: 50,
    normal: 80,
    slow: 120,
  },
};

// ============================================
// GRADIENT PRESETS (NEW)
// ============================================
export const Gradients = {
  primary: [Colors.teal[900], Colors.teal[700], Colors.teal[400]] as const,
  success: [Colors.green[800], Colors.green[500], Colors.green[400]] as const,
  warmFire: [Colors.warning[100], Colors.warning[700], Colors.red[700]] as const,
  card: [Colors.teal[800], Colors.teal[700], Colors.blue[400]] as const,
};

// ============================================
// COMPATIBILITY
// ============================================
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

export default {
  Colors,
  Semantic,
  Components,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
  AnimConfig,
  Gradients,
};
