import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { PointProvider } from "../../PointContext";

// Komponen Khusus untuk Tombol Melayang & Beranimasi
const FloatingTukarButton = ({ children }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Membuat animasi denyut (pulse) yang berulang terus-menerus
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1, // Membesar 10%
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1, // Kembali ke ukuran normal
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scaleValue]);

  return (
    <Animated.View
      style={[styles.floatingButton, { transform: [{ scale: scaleValue }] }]}
    >
      {children}
    </Animated.View>
  );
};

export default function TabLayout() {
  return (
    <PointProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#10B981",
          headerShown: false,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontFamily: "Poppins_600SemiBold", // Disesuaikan dengan font yang di-load
            fontSize: 10,
          },
          tabBarStyle: {
            height: 65,
            paddingBottom: 10,
            borderTopWidth: 1,
            borderTopColor: "#F3F4F6",
            backgroundColor: "#FFFFFF",
            elevation: 10, // Memberikan bayangan pada tab bar
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Beranda",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="home" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="history"
          options={{
            title: "Riwayat",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="history" size={24} color={color} />
            ),
          }}
        />

        {/* Menu Tukar dengan Tombol Melayang */}
        <Tabs.Screen
          name="exchange"
          options={{
            title: "", // Sengaja dikosongkan agar teks tidak bertabrakan dengan tombol melayang
            tabBarIcon: () => (
              <FloatingTukarButton>
                <FontAwesome name="recycle" size={32} color="#FFFFFF" />
              </FloatingTukarButton>
            ),
          }}
        />

        <Tabs.Screen
          name="reward"
          options={{
            title: "Reward",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="gift" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profil",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </PointProvider>
  );
}

// Gaya (Style) khusus untuk membuat tombolnya melayang
const styles = StyleSheet.create({
  floatingButton: {
    top: -20, // Menarik tombol ke atas agar keluar dari batas tab bar
    justifyContent: "center",
    alignItems: "center",
    width: 65,
    height: 65,
    borderRadius: 35, // Membuatnya bulat sempurna
    backgroundColor: "#10B981",
    // Efek bayangan hijau agar terlihat glowing
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
});
