import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { withLayoutContext } from "expo-router";
import { createMaterialTopTabNavigator } from "expo-router/js-top-tabs";
import { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// 1. Memanggil mesin Top Tabs dari React Navigation
const TopTabs = createMaterialTopTabNavigator().Navigator;

// 2. Mengintegrasikannya ke dalam Expo Router
const SwipeableTabs = withLayoutContext(TopTabs);

// 3. Membuat Desain Custom Tab Bar (Kapsul Melayang)
function CustomFloatingTabBar({ state, descriptors, navigation }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animasi denyut untuk tombol tengah
  useEffect(() => {
    Animated.loop(
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
    ).start();
  }, []);

  return (
    <View style={styles.tabBarWrapper} pointerEvents="box-none">
      {/* Background Kapsul dengan Efek Blur/Kaca */}
      <View style={styles.pillContainer}>
        {/* INI BAGIAN YANG DIPERBAIKI (ANTI LAYAR MERAH ANDROID) */}
        {Platform.OS === "ios" && (
          <BlurView
            intensity={70}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={styles.pillSolidBackground} />
      </View>

      {/* Barisan Ikon Tab & Super FAB */}
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

          let iconName;
          if (route.name === "index") iconName = "home";
          else if (route.name === "history") iconName = "history";
          else if (route.name === "reward") iconName = "gift";
          else if (route.name === "profile") iconName = "user";

          // --- TOMBOL TUKAR (SUPER FAB) ---
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
                  <FontAwesome name="recycle" size={30} color="#FFFFFF" />
                </Pressable>
              </View>
            );
          }

          // --- IKON TAB STANDAR ---
          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
              <FontAwesome
                name={iconName}
                size={22}
                color={isFocused ? "#10B981" : "#9CA3AF"}
                style={{ marginBottom: 4 }}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: isFocused ? "#10B981" : "#9CA3AF" },
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
    <SwipeableTabs
      tabBar={(props) => <CustomFloatingTabBar {...props} />}
      screenOptions={{
        swipeEnabled: true, // INI DIA KUNCI SWIPE-NYA! ✨
        lazy: true,
      }}
      tabBarPosition="bottom" // Kita paksa mesin Top Tabs untuk pindah ke Bawah
    >
      <SwipeableTabs.Screen name="index" options={{ title: "Beranda" }} />
      <SwipeableTabs.Screen name="history" options={{ title: "Riwayat" }} />
      <SwipeableTabs.Screen name="exchange" options={{ title: "Tukar" }} />
      <SwipeableTabs.Screen name="reward" options={{ title: "Reward" }} />
      <SwipeableTabs.Screen name="profile" options={{ title: "Profil" }} />
    </SwipeableTabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "absolute",
    bottom: 25, // Mengambang dari dasar HP
    left: 20, // Tidak menyentuh tepi kiri
    right: 20, // Tidak menyentuh tepi kanan
    height: 70,
    zIndex: 10,
  },
  pillContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 35, // Membuatnya jadi bentuk kapsul lonjong
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  pillSolidBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.90)", // Dibuat sedikit lebih solid agar tetap cantik tanpa blur di Android
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
    backgroundColor: "rgba(16, 185, 129, 0.3)",
  },
  fabButton: {
    position: "absolute",
    top: -30, // Melayang tinggi menembus atas kapsul!
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
});
