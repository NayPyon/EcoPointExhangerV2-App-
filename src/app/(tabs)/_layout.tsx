import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; 
import { View, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

// 1. Kita buat komponen khusus untuk Tombol Tengah yang beranimasi
const AnimatedTabIcon = () => {
  // Menyiapkan nilai awal animasi (skala 1 = ukuran normal)
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Membuat urutan animasi berulang (loop)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.15, // Tombol membesar 15%
          duration: 1000, // Selama 1 detik
          useNativeDriver: true, // Biar animasinya mulus tidak bikin lag
        }),
        Animated.timing(scaleValue, {
          toValue: 1, // Tombol kembali ke ukuran normal
          duration: 1000, // Selama 1 detik
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{
      top: -15, 
      justifyContent: 'center',
      alignItems: 'center',
      width: 60,
      height: 60,
      borderRadius: 30, 
      backgroundColor: '#10B981', 
      elevation: 5, 
      shadowColor: '#10B981',
      shadowOpacity: 0.4,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 3 },
      transform: [{ scale: scaleValue }] // 2. Terapkan efek denyutnya di sini
    }}>
      <FontAwesome name="recycle" size={32} color="#FFFFFF" />
    </Animated.View>
  );
};

// 3. Ini kerangka navigasi utamanya
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
        headerShown: false, 
        tabBarActiveTintColor: '#10B981', 
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { 
          height: 65, 
          paddingBottom: 10, 
          paddingTop: 5,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: '#FFFFFF',
          elevation: 10,
          shadowOpacity: 0.1,
        }
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="history"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color }) => <FontAwesome name="history" size={24} color={color} />,
        }}
      />

      {/* Tombol Tengah kita panggil komponen animasinya di sini */}
      <Tabs.Screen
        name="exchange"
        options={{
          title: '', 
          tabBarIcon: () => <AnimatedTabIcon />,
        }}
      />

      <Tabs.Screen
        name="reward"
        options={{
          title: 'Reward',
          tabBarIcon: ({ color }) => <FontAwesome name="gift" size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}