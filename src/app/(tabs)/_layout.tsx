import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { PointProvider } from "../../PointContext";

export default function TabLayout() {
  return (
    <PointProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#10B981",
          headerShown: false,
          tabBarStyle: { paddingBottom: 5, height: 60 }, // Sedikit memperbesar area navigasi
        }}
      >
        {/* 1. Kiri Luar */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Beranda",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="home" size={24} color={color} />
            ),
          }}
        />

        {/* 2. Kiri Dalam */}
        <Tabs.Screen
          name="history"
          options={{
            title: "Riwayat",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="history" size={24} color={color} />
            ),
          }}
        />

        {/* 3. TENGAH (Menu Utama) */}
        <Tabs.Screen
          name="exchange"
          options={{
            title: "Tukar",
            // Ikon dibuat lebih besar (size 32) agar terlihat menonjol di tengah
            tabBarIcon: ({ color }) => (
              <FontAwesome name="qrcode" size={32} color={color} />
            ),
          }}
        />

        {/* 4. Kanan Dalam */}
        <Tabs.Screen
          name="reward"
          options={{
            title: "Reward",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="gift" size={24} color={color} />
            ),
          }}
        />

        {/* 5. Kanan Luar */}
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
