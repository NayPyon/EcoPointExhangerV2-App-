import { BlurView } from "expo-blur";
import React from "react";
import {
  Platform,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { BorderRadius, Components, Shadows } from "@/constants/theme";

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  borderRadius?: number;
  /** Use dark glass (for overlays on gradient backgrounds) */
  dark?: boolean;
}

/**
 * Frosted glass card with BlurView on iOS and translucent fallback on Android.
 * Gives a premium glassmorphism look.
 */
export function GlassCard({
  children,
  style,
  intensity = 40,
  borderRadius = BorderRadius.xl,
  dark = false,
  ...rest
}: GlassCardProps) {
  const bgColor = dark
    ? Components.glass.bg
    : Components.glass.bgStrong;

  if (Platform.OS === "ios") {
    return (
      <View
        style={[
          styles.wrapper,
          { borderRadius },
          Shadows.md,
          style,
        ]}
        {...rest}
      >
        <BlurView
          intensity={intensity}
          tint={dark ? "dark" : "light"}
          style={[StyleSheet.absoluteFill, { borderRadius }]}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius,
              borderWidth: 1,
              borderColor: Components.glass.border,
            },
          ]}
        />
        {children}
      </View>
    );
  }

  // Android / Web fallback
  return (
    <View
      style={[
        styles.wrapper,
        {
          borderRadius,
          backgroundColor: dark
            ? "rgba(255, 255, 255, 0.12)"
            : "rgba(255, 255, 255, 0.85)",
          borderWidth: 1,
          borderColor: dark
            ? "rgba(255, 255, 255, 0.2)"
            : "rgba(255, 255, 255, 0.4)",
        },
        Shadows.md,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
  },
});
