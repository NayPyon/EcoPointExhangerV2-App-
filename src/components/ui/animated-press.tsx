import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, type PressableProps, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { AnimConfig } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressProps extends PressableProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  scaleDown?: number;
  haptic?: boolean;
}

/**
 * Pressable wrapper with scale-down micro-interaction and optional haptic feedback.
 * Drop-in replacement for TouchableOpacity with premium feel.
 */
export function AnimatedPress({
  children,
  style,
  scaleDown = 0.97,
  haptic = true,
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: AnimatedPressProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    scale.value = withSpring(scaleDown, AnimConfig.spring.snappy);
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, AnimConfig.spring.bouncy);
    onPressOut?.(e);
  };

  const handlePress = (e: any) => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(e);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[animatedStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
