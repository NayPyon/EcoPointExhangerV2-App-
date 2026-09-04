import {
  Semantic
} from "@/constants/theme";
import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { useEffect, useState, type ComponentProps } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof FontAwesome>["name"];
type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

function CustomFloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View
      style={[styles.tabBarWrapper, { bottom: Math.max(insets.bottom, 12) + 12 }]}
      pointerEvents="box-none"
    >
      <View style={styles.pillContainer}>
        {Platform.OS === "ios" && (
          <BlurView
            intensity={70}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        )}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.pillSolidBackground,
          ]}
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
                <Animated.View
                  style={[
                    styles.pulseRing,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
                <Pressable
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
              </View>
            );
          }

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
              <FontAwesome
                name={iconName}
                size={22}
                color={isFocused ? Semantic.success.main : Semantic.text.muted}
                style={{ marginBottom: 4 }}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isFocused
                      ? Semantic.success.main
                      : Semantic.text.muted,
                  },
                ]}
              >
                {options.title || route.name}
              </Text>
            </Pressable>
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
    ...StyleSheet.absoluteFill,
    borderRadius: 35,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(5, 107, 141, 0.12)",
    shadowColor: Semantic.text.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  pillSolidBackground: {
    backgroundColor: "rgba(255, 255, 255, 0.82)",
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
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
  },
  fabContainer: {
    width: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    top: -35,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Semantic.primary.light,
  },
  fabButton: {
    position: "absolute",
    top: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Semantic.success.main,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Semantic.success.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 4,
    borderColor: Semantic.background.primary,
  },
});
