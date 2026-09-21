import React, { useEffect } from 'react';
import { Image, View, StyleSheet, useColorScheme } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { Colors } from '../constants/theme';

export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const isDark = useColorScheme() === 'dark';
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    // Animate scale up with a spring effect
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    
    // Hold for 1.5 seconds, then fade out
    opacity.value = withDelay(
      1500, 
      withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[
        styles.container, 
        { backgroundColor: isDark ? Colors.obsidian[950] : '#FFFFFF' },
        containerAnimatedStyle
      ]}
    >
      <Animated.View style={animatedStyle}>
        <Image 
          source={require('../../assets/images/valo-logo-text.png')}
          style={{ width: 220, height: 80 }}
          resizeMode="contain"
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  }
});
