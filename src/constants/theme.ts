/**
 * EcoVibe Design System — Premium UI
 * "Obsidian Dark & Fresh Emerald"
 */

// ============================================
// RAW COLOR PALETTE (EcoVibe)
// ============================================
export const Colors = {
  emerald: {
    0: "#FFFFFF",
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981", // EcoVibe Primary
    600: "#059669", // EcoVibe Secondary
    700: "#047857",
    800: "#065F46",
    900: "#064E3B",
  },

  amber: {
    0: "#FFFFFF",
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B", // EcoVibe Tertiary
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },

  obsidian: {
    0: "#FFFFFF",
    50: "#F8FAFC", // Light Mode Background
    100: "#F1F5F9", // Light Mode Surface
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B", // Muted Text
    600: "#475569",
    700: "#334155",
    800: "#1E293B", // Dark Mode Surface Light
    900: "#0F172A", // Light Mode Text (Slate)
    950: "#0B1118", // EcoVibe Neutral (Obsidian Dark Background)
  },

  red: {
    0: "#FFFFFF",
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C",
    800: "#991B1B",
    900: "#7F1D1D",
  },
  // Backwards compatibility aliases
  teal: {
    0: "#FFFFFF",
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981",
    600: "#059669",
    700: "#047857",
    800: "#065F46",
    900: "#064E3B",
  },
  neutral: {
    0: "#FFFFFF",
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
  },
  light: {
    text: "#0F172A",
    background: "#FFFFFF",
    tint: "#10B981",
    icon: "#94A3B8",
    tabIconDefault: "#94A3B8",
    tabIconSelected: "#10B981",
  },
  dark: {
    text: "#FFFFFF",
    background: "#0B1118",
    tint: "#34D399",
    icon: "#94A3B8",
    tabIconDefault: "#94A3B8",
    tabIconSelected: "#34D399",
  },
  green: {
    0: "#FFFFFF",
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981",
    600: "#059669",
    700: "#047857",
    800: "#065F46",
    900: "#064E3B",
  },
  warning: {
    0: "#FFFFFF",
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },
};

// ============================================
// SEMANTIC TOKENS (Adapting to System Theme)
// ============================================
export const Semantic = {
  primary: {
    light: Colors.emerald[100],
    main: Colors.emerald[500],
    dark: Colors.emerald[700],
  },
  secondary: {
    light: Colors.emerald[50],
    main: Colors.emerald[600],
    dark: Colors.emerald[800],
  },
  success: {
    light: Colors.emerald[100],
    main: Colors.emerald[500],
    dark: Colors.emerald[700],
  },
  warning: {
    light: Colors.amber[100],
    main: Colors.amber[500],
    dark: Colors.amber[700],
  },
  danger: {
    light: Colors.red[50],
    main: Colors.red[500],
    dark: Colors.red[900],
  },
  // Default values assuming Light Mode.
  // In components we can conditionally use Dark mode hexes.
  text: {
    primary: Colors.obsidian[900],
    secondary: Colors.obsidian[600],
    muted: Colors.obsidian[400],
    light: "#FFFFFF",
  },
  background: {
    primary: "#FFFFFF",
    secondary: Colors.obsidian[50],
    tertiary: Colors.obsidian[100],
    dark: Colors.obsidian[950],
  },
  border: {
    light: Colors.obsidian[200],
    main: Colors.obsidian[300],
    dark: Colors.obsidian[700],
  },
};

// ============================================
// COMPONENT TOKENS
// ============================================
export const Components = {
  card: {
    border: Semantic.border.light,
  },
  iconWrapper: {
    success: { bg: Colors.emerald[100], color: Semantic.success.main },
    warning: { bg: Colors.amber[100], color: Semantic.warning.main },
    danger: { bg: Colors.red[100], color: Semantic.danger.main },
    primary: { bg: Colors.emerald[50], color: Semantic.primary.main },
    info: { bg: Colors.obsidian[100], color: Colors.obsidian[600] },
  },
  glass: {
    bg: "rgba(255, 255, 255, 0.15)",
    bgStrong: "rgba(255, 255, 255, 0.25)",
    border: "rgba(255, 255, 255, 0.3)",
    bgDark: "rgba(11, 17, 24, 0.4)",
  },
  modal: {
    overlay: "rgba(11, 17, 24, 0.6)",
  },
};

// ============================================
// SPACING & RADIUS
// ============================================
export const Spacing = {
  half: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  // Backwards compatibility aliases
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
};
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
// TYPOGRAPHY (EcoVibe - Plus Jakarta Sans)
// ============================================
export const Typography = {
  fontFamily: {
    primary: "PlusJakartaSans_700Bold",
    secondary: "PlusJakartaSans_600SemiBold",
    medium: "PlusJakartaSans_500Medium",
    body: "PlusJakartaSans_400Regular",
    // Fallbacks just in case
    inter: "PlusJakartaSans_400Regular",
    interMedium: "PlusJakartaSans_600SemiBold",
    interBold: "PlusJakartaSans_700Bold",
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
// SHADOWS
// ============================================
export const Shadows = {
  sm: {
    shadowColor: Colors.obsidian[950],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.obsidian[950],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.obsidian[950],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  }),
};

// ============================================
// ANIMATION & GRADIENTS
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

export const Gradients = {
  primary: [Colors.emerald[500], Colors.emerald[600]] as const,
  success: [Colors.emerald[400], Colors.emerald[500]] as const,
  card: [Colors.obsidian[800], Colors.obsidian[900]] as const,
};

// ============================================
// EXPO DEFAULT COMPATIBILITY
// ============================================
export const light = {
  text: Colors.obsidian[900],
  background: "#FFFFFF",
  tint: Colors.emerald[500],
  icon: Colors.obsidian[400],
  tabIconDefault: Colors.obsidian[400],
  tabIconSelected: Colors.emerald[500],
};
export const dark = {
  text: "#FFFFFF",
  background: Colors.obsidian[950],
  tint: Colors.emerald[400],
  icon: Colors.obsidian[400],
  tabIconDefault: Colors.obsidian[400],
  tabIconSelected: Colors.emerald[400],
};

export type ThemeColor = keyof typeof light & keyof typeof dark;
export const Fonts = { mono: "SpaceMono" };

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
  Fonts,
};
