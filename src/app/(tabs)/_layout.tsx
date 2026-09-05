import { AnimConfig, Semantic, Shadows, Typography } from "@/constants/theme";
import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { useEffect, type ComponentProps } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
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
}: {
  route: any;
  isFocused: boolean;
  options: any;
  onPress: () => void;
  iconName: IconName;
}) {
  const scale = useSharedValue(isFocused ? 1.15 : 1);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.15 : 1, AnimConfig.spring.bouncy);
  }, [isFocused, scale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={onPress} style={styles.tabItem}>
      <Animated.View style={animatedIconStyle}>
        <FontAwesome
          name={iconName}
          size={22}
          color={isFocused ? Semantic.success.main : Semantic.text.muted}
          style={{ marginBottom: 4 }}
        />
      </Animated.View>
      <Text
        style={[
          styles.tabText,
          {
            fontFamily: isFocused
              ? Typography.fontFamily.interBold
              : Typography.fontFamily.interMedium,
            color: isFocused ? Semantic.success.main : Semantic.text.muted,
          },
        ]}
      >
        {options.title || route.name}
      </Text>
    </Pressable>
  );
}

function CustomFloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

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

  return (
    <View
      style={[
        styles.tabBarWrapper,
        { bottom: Math.max(insets.bottom, 12) + 12 },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.pillContainer}>
        {Platform.OS === "ios" && (
          <BlurView
            intensity={80}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        )}
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.pillSolidBackground]}
        />
      </View>

      <View style={styles.tabItemsRow} pointerEvents="box-none">
        {/* Animated Indicator Dot */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={styles.indicatorTrack}>
            <Animated.View
              style={[
                styles.indicatorContainer,
                { width: tabWidth },
                indicatorStyle,
              ]}
            >
              <View style={styles.indicatorDot} />
            </Animated.View>
          </View>
        </View>

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
                <Animated.View style={[styles.pulseRing, animatedPulseStyle]} />
                <Animated.View style={[styles.fabButtonWrapper, fabStyle]}>
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
                      size={30}
                      color={Semantic.background.primary}
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
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomFloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        unmountOnBlur: true,
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
    backgroundColor:
      Platform.OS === "android"
        ? "rgba(255, 255, 255, 0.95)"
        : "rgba(255, 255, 255, 0.55)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: Shadows.lg.shadowColor,
    shadowOffset: Shadows.lg.shadowOffset,
    shadowOpacity: Shadows.lg.shadowOpacity,
    shadowRadius: Shadows.lg.shadowRadius,
    elevation: 10,
  },
  pillSolidBackground: {
    backgroundColor:
      Platform.OS === "android" ? "transparent" : "rgba(255, 255, 255, 0.2)",
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
  indicatorTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
  },
  indicatorContainer: {
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
  },
  indicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Semantic.success.main,
  },
  fabContainer: {
    width: 70,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    top: -35,
    alignSelf: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Semantic.primary.light,
  },
  fabButtonWrapper: {
    position: "absolute",
    top: -30,
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Semantic.success.main,
    shadowColor: Semantic.success.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 4,
    borderColor: Semantic.background.primary,
  },
  fabButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
  },
});
