const fs = require('fs');
let content = fs.readFileSync('src/app/(auth)/login.tsx', 'utf8');

// Imports
content = content.replace(/import \{ View, Text, TextInput, StyleSheet, useColorScheme, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator \} from \'react-native\';/, 'import { View, Text, TextInput, StyleSheet, useColorScheme, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from \'react-native\';\nimport { BlurView } from "expo-blur";\nimport { LinearGradient } from "expo-linear-gradient";');

content = content.replace(/import Animated, \{ FadeInDown, FadeInUp \} from \'react-native-reanimated\';/, 'import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from \'react-native-reanimated\';\nimport { useEffect } from "react";');

// Component logic
const replacement = \const getInputBg = () => isDark ? Colors.obsidian[950] : Colors.neutral[50];

  const blob1X = useSharedValue(0);
  const blob2X = useSharedValue(0);

  useEffect(() => {
    blob1X.value = withRepeat(withTiming(80, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true);
    blob2X.value = withRepeat(withTiming(-80, { duration: 5000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [blob1X, blob2X]);

  const animatedBlob1 = useAnimatedStyle(() => ({
    transform: [{ translateX: blob1X.value }, { scale: 1.5 }],
  }));
  const animatedBlob2 = useAnimatedStyle(() => ({
    transform: [{ translateX: blob2X.value }, { scale: 1.5 }],
  }));

  const blurTint = isDark ? "dark" : "light";
  const handleLogin = async () => {\;

content = content.replace(/const getInputBg = \(\) => isDark \? Colors\.obsidian\[950\] : Colors\.neutral\[50\];\n\n  const handleLogin = async \(\) => \{/, replacement);

// Background JSX
const bgReplacement = \ehavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: 0.9 }, animatedBlob1]}>
          <LinearGradient colors={[isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)', 'transparent']} style={{ position: 'absolute', width: 400, height: 400, top: -50, left: -100, borderRadius: 200 }} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: 0.9 }, animatedBlob2]}>
          <LinearGradient colors={[isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.25)', 'transparent']} style={{ position: 'absolute', width: 350, height: 350, bottom: -50, right: -100, borderRadius: 175 }} />
        </Animated.View>
        <BlurView intensity={isDark ? 50 : 80} tint={blurTint} style={StyleSheet.absoluteFill} />
      </View>

      <ScrollView\;

content = content.replace(/behavior=\{Platform\.OS === \'ios\' \? \'padding\' : \'height\'\}\n    >\n      <ScrollView/, bgReplacement);

// Make the card slightly more transparent so we can see the aurora
content = content.replace(/const getCardBg = \(\) => isDark \? Colors\.obsidian\[800\] : Semantic\.background\.primary;/, 'const getCardBg = () => isDark ? "rgba(30, 41, 59, 0.85)" : "rgba(255,255,255,0.85)";');
content = content.replace(/const getBgColor = \(\) => isDark \? Semantic\.background\.dark : Semantic\.background\.secondary;/, 'const getBgColor = () => isDark ? "#0B1118" : "#F1F5F9";');


fs.writeFileSync('src/app/(auth)/login.tsx', content);
