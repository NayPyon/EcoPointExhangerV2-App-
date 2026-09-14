import { AnimConfig, Semantic, Shadows, Typography, Colors } from "@/constants/theme";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Tabs, Redirect } from "expo-router"; 
import { useAuth } from "../../AuthContext";
import { useEffect, type ComponentProps } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  useColorScheme,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof FontAwesome>["name"];
type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

function TabBarItem({
  route,
  isFocused,
  options,
  onPress,
  iconName,
  isDark,
}: {
  route: any;
  isFocused: boolean;
  options: any;
  onPress: () => void;
  iconName: IconName;
  isDark: boolean;
}) {
  const scale = useSharedValue(isFocused ? 1.15 : 1);
  const dotOpacity = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.15 : 1, AnimConfig.spring.bouncy);
    dotOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused, scale, dotOpacity]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedDotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scale: dotOpacity.value }],
  }));

  const activeColor = Semantic.primary.main;
  const inactiveColor = isDark ? Colors.obsidian[400] : Colors.obsidian[400];

  return (
    <Pressable onPress={onPress} style={styles.tabItem}>
      <Animated.View style={animatedIconStyle}>
        <FontAwesome
          name={iconName}
          size={22}
          color={isFocused ? activeColor : inactiveColor}
          style={{ marginBottom: 4 }}
        />
      </Animated.View>
      <Text
        style={[
          styles.tabText,
          {
            fontFamily: isFocused
              ? Typography.fontFamily.secondary
              : Typography.fontFamily.medium,
            color: isFocused ? activeColor : inactiveColor,
          },
        ]}
      >
        {options.title || route.name}
      </Text>
      {/* Indicator Dot */}
      <Animated.View style={[styles.indicatorDot, { backgroundColor: activeColor }, animatedDotStyle]} />
    </Pressable>
  );
}

function CustomFloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const tabBarWidth = screenWidth - 32;
  const tabContentWidth = tabBarWidth - 20;
  const tabWidth = tabContentWidth / 5;

  const pulseAnim = useSharedValue(1);
  const pressed = useSharedValue(false);
  const indicatorOffset = useSharedValue(state.index * tabWidth);
  const indicatorOpacity = useSharedValue(state.index === 2 ? 0 : 1);

  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.08, {
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      true,
    );
  }, [pulseAnim]);

  useEffect(() => {
    indicatorOffset.value = withSpring(
      state.index * tabWidth,
      AnimConfig.spring.snappy,
    );
    indicatorOpacity.value = withSpring(
      state.index === 2 ? 0 : 1,
      AnimConfig.spring.snappy,
    );
  }, [state.index, tabWidth, indicatorOffset, indicatorOpacity]);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const fabStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(pressed.value ? 0.9 : 1, AnimConfig.spring.bouncy),
      },
    ],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorOffset.value }],
    opacity: indicatorOpacity.value,
  }));

  const blob1X = useSharedValue(0);
  const blob2X = useSharedValue(0);

  useEffect(() => {
    blob1X.value = withRepeat(withTiming(60, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true);
    blob2X.value = withRepeat(withTiming(-60, { duration: 5000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [blob1X, blob2X]);

  const animatedBlob1 = useAnimatedStyle(() => ({
    transform: [{ translateX: blob1X.value }, { scale: 1.5 }],
  }));
  const animatedBlob2 = useAnimatedStyle(() => ({
    transform: [{ translateX: blob2X.value }, { scale: 1.5 }],
  }));

  // Platform specific blur intensity and color
  const blurTint = isDark ? "dark" : "light";
  const bgColor = isDark 
    ? (Platform.OS === "android" ? "rgba(11, 17, 24, 0.95)" : "rgba(11, 17, 24, 0.65)")
    : (Platform.OS === "android" ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.65)");

  return (
    <View
      style={[
        styles.tabBarWrapper,
        { bottom: Math.max(insets.bottom, 12) + 12 },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.pillContainer, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255,255,255,0.7)', borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)" }]}>
        
        {/* Aurora Blobs */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: 0.9 }, animatedBlob1]}>
          <LinearGradient colors={[isDark ? 'rgba(16, 185, 129, 0.6)' : 'rgba(16, 185, 129, 0.3)', 'transparent']} style={{ position: 'absolute', width: 250, height: 120, top: -30, left: -50, borderRadius: 100 }} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: 0.9 }, animatedBlob2]}>
          <LinearGradient colors={[isDark ? 'rgba(245, 158, 11, 0.5)' : 'rgba(245, 158, 11, 0.25)', 'transparent']} style={{ position: 'absolute', width: 200, height: 120, bottom: -30, right: -50, borderRadius: 100 }} />
        </Animated.View>

        <BlurView
          intensity={isDark ? 50 : 80}
          tint={blurTint}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.tabItemsRow} pointerEvents="box-none">

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            } else if (isFocused && !event.defaultPrevented) {
              navigation.setParams({ ts: Date.now() });
            }
          };

          let iconName: IconName = "home";
          if (route.name === "index") iconName = "home";
          else if (route.name === "history") iconName = "history";
          else if (route.name === "reward") iconName = "gift";
          else if (route.name === "profile") iconName = "user";

          if (route.name === "exchange") {
            return (
              <View
                key={route.key}
                style={styles.fabContainer}
                pointerEvents="box-none"
              >
                <Animated.View style={[styles.pulseRing, animatedPulseStyle, { backgroundColor: isDark ? "rgba(16, 185, 129, 0.2)" : Colors.emerald[100] }]} />
                <Animated.View style={[styles.fabButtonWrapper, fabStyle, { borderColor: isDark ? Colors.obsidian[800] : "#FFFFFF" }]}>
                  <Pressable
                    onPressIn={() => (pressed.value = true)}
                    onPressOut={() => (pressed.value = false)}
                    onPress={onPress}
                    style={styles.fabButton}
                    android_ripple={{
                      color: "rgba(255,255,255,0.3)",
                      borderless: true,
                    }}
                  >
                    <FontAwesome
                      name="recycle"
                      size={28}
                      color="#FFFFFF"
                    />
                  </Pressable>
                </Animated.View>
              </View>
            );
          }

          return (
            <TabBarItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              options={options}
              onPress={onPress}
              iconName={iconName}
              isDark={isDark}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0B1118', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#FFF' }}>Memuat...</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomFloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Beranda" }} />
      <Tabs.Screen name="history" options={{ title: "Riwayat" }} />
      <Tabs.Screen name="exchange" options={{ title: "Tukar" }} />
      <Tabs.Screen name="reward" options={{ title: "Reward" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 70,
    zIndex: 10,
  },
  pillContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    overflow: "hidden",
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  tabItemsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  tabText: {
    fontSize: 10,
    marginTop: 2,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
    position: 'absolute',
    bottom: 6,
  },
  fabContainer: {
    width: 70,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    top: -20,
    alignSelf: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  fabButtonWrapper: {
    position: "absolute",
    top: -15,
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.emerald[500],
    shadowColor: Colors.emerald[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 4,
  },
  fabButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
  },
});
