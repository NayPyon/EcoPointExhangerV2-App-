import { useEffect } from "react";
import { StyleSheet, Text, type TextStyle } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
  useDerivedValue,
} from "react-native-reanimated";

const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: TextStyle;
  prefix?: string;
  suffix?: string;
  separator?: boolean;
  locale?: string;
}

/**
 * Animated number counter that smoothly counts up from 0 (or previous value) to target.
 * Uses Reanimated for 60fps animation on the UI thread.
 */
export function AnimatedCounter({
  value,
  duration = 800,
  style,
  prefix = "",
  suffix = "",
  separator = true,
  locale = "id-ID",
}: AnimatedCounterProps) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration, animatedValue]);

  // Since we can't directly animate text on native easily,
  // we use a derived value and re-render approach
  const displayValue = useDerivedValue(() => {
    const num = Math.round(animatedValue.value);
    if (separator) {
      return `${prefix}${num.toLocaleString(locale)}${suffix}`;
    }
    return `${prefix}${num}${suffix}`;
  });

  // For React Native, we use the animated props approach with a Text component
  // However, since RN doesn't support animatedProps on Text.children directly,
  // we use a simpler approach with useAnimatedProps on a default animated text
  const animatedProps = useAnimatedProps(() => {
    const num = Math.round(animatedValue.value);
    let text: string;
    if (separator) {
      // Manual thousand separator since toLocaleString not available in worklet
      const parts = [];
      let n = num;
      if (n === 0) {
        text = "0";
      } else {
        while (n > 0) {
          parts.unshift(String(n % 1000).padStart(parts.length > 0 ? 3 : 1, "0"));
          n = Math.floor(n / 1000);
        }
        text = parts.join(".");
      }
    } else {
      text = String(num);
    }
    return {
      text: `${prefix}${text}${suffix}`,
      defaultValue: `${prefix}${text}${suffix}`,
    } as any;
  });

  return (
    <AnimatedText style={style} animatedProps={animatedProps}>
      {`${prefix}${separator ? value.toLocaleString(locale) : value}${suffix}`}
    </AnimatedText>
  );
}
