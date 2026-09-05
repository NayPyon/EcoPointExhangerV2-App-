import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gradients, Spacing } from "@/constants/theme";

interface GradientHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
  colors?: readonly [string, string, ...string[]];
  /** Extra bottom padding beyond default */
  extraPaddingBottom?: number;
}

/**
 * Reusable gradient header section with safe area insets.
 * Used for profile, home, and any screen needing a teal gradient top.
 */
export function GradientHeader({
  children,
  style,
  colors = Gradients.primary,
  extraPaddingBottom = 0,
}: GradientHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: Spacing.xl + extraPaddingBottom,
        },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
  },
});
