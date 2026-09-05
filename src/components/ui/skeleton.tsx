import React, { useEffect } from "react";
import { StyleSheet, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BorderRadius, Colors } from "@/constants/theme";

interface SkeletonProps {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Skeleton shimmer loading placeholder.
 * Uses Reanimated + LinearGradient for smooth shimmer effect.
 */
export function Skeleton({
  width,
  height,
  borderRadius = BorderRadius.md,
  style,
}: SkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shimmer.value,
          [0, 1],
          [-200, 200],
        ),
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: Colors.neutral[200],
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={[
            "transparent",
            "rgba(255, 255, 255, 0.4)",
            "transparent",
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: 200, height: "100%" }}
        />
      </Animated.View>
    </Animated.View>
  );
}

/** Pre-made skeleton for a card row */
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <Animated.View
      style={[
        {
          backgroundColor: Colors.neutral[0],
          borderRadius: BorderRadius.xl,
          padding: 20,
          gap: 12,
        },
        style,
      ]}
    >
      <Skeleton width="40%" height={14} borderRadius={BorderRadius.sm} />
      <Skeleton width="70%" height={28} borderRadius={BorderRadius.md} />
      <Skeleton width="90%" height={10} borderRadius={BorderRadius.xs} />
    </Animated.View>
  );
}

/** Pre-made skeleton for history/list items */
export function SkeletonListItem({ style }: { style?: ViewStyle }) {
  return (
    <Animated.View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: Colors.neutral[0],
          borderRadius: BorderRadius.lg,
          padding: 16,
          gap: 14,
        },
        style,
      ]}
    >
      <Skeleton width={40} height={40} borderRadius={BorderRadius.md} />
      <Animated.View style={{ flex: 1, gap: 6 }}>
        <Skeleton width="60%" height={14} borderRadius={BorderRadius.xs} />
        <Skeleton width="40%" height={10} borderRadius={BorderRadius.xs} />
      </Animated.View>
      <Skeleton width={50} height={18} borderRadius={BorderRadius.xs} />
    </Animated.View>
  );
}
