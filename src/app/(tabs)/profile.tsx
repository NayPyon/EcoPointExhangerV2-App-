import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePoints } from "../../PointContext"; // Narik data poin asli

export default function ProfileScreen() {
  const { totalPoin } = usePoints();

  // Daftar menu yang ada di Profil
  const MENU_ITEMS = [
    { id: "1", title: "Edit Profil", icon: "user", color: "#3B82F6" },
    { id: "2", title: "Keamanan Akun", icon: "shield", color: "#10B981" },
    { id: "3", title: "Pengaturan Notifikasi", icon: "bell", color: "#F59E0B" },
    {
      id: "4",
      title: "Bantuan & FAQ",
      icon: "question-circle",
      color: "#8B5CF6",
    },
    {
      id: "5",
      title: "Tentang Aplikasi",
      icon: "info-circle",
      color: "#6B7280",
    },
  ];

  // Logika saat tombol keluar ditekan
  const handleLogout = () => {
    Alert.alert(
      "Keluar Akun",
      "Apakah kamu yakin ingin keluar dari aplikasi EcoPoint?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: () => console.log("Proses Log Out..."),
          // Nanti logika hapus sesi / Firebase Auth bisa ditaruh di sini
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Bagian Header (Foto Profil & Info Singkat) */}
      <View style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <FontAwesome name="user" size={40} color="#10B981" />
        </View>
        <Text style={styles.name}>Nayaka</Text>
        <Text style={styles.email}>nayaka@ecopoint.id</Text>

        {/* Lencana Poin yang terhubung dengan PointContext */}
        <View style={styles.badgeContainer}>
          <FontAwesome name="star" size={14} color="#F59E0B" />
          <Text style={styles.badgeText}>{totalPoin} Poin Terkumpul</Text>
        </View>
      </View>

      {/* 2. Daftar Menu Pengaturan */}
      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Pengaturan Akun</Text>

        {MENU_ITEMS.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuItem}>
            <View
              style={[styles.iconBox, { backgroundColor: item.color + "15" }]}
            >
              <FontAwesome
                name={item.icon as any}
                size={20}
                color={item.color}
              />
            </View>
            <Text style={styles.menuText}>{item.title}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      {/* 3. Tombol Keluar (Merah) */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="#EF4444" />
        <Text style={styles.logoutText}>Keluar Akun</Text>
      </TouchableOpacity>

      {/* 4. Versi Aplikasi (Detail kecil biar terlihat pro) */}
      <Text style={styles.version}>EcoPoint v1.0.0 (Beta)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  badgeText: {
    color: "#B45309",
    fontWeight: "bold",
    fontSize: 13,
    marginLeft: 6,
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 16,
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  version: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 24,
    marginBottom: 40,
  },
});
