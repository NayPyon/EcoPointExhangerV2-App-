import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { usePoints } from "../../PointContext";

export default function ProfileScreen() {
  const { points, totalBottles } = usePoints();

  // State untuk mengontrol jendela Pop-up (Modal)
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [walletModalVisible, setWalletModalVisible] = useState(false);

  // State untuk data profil (Bisa diedit)
  const [name, setName] = useState("Nayaka");
  const [bio, setBio] = useState("Pejuang Lingkungan (Eco-Warrior)");
  const [location, setLocation] = useState("Denpasar, Bali");

  // State E-Wallet yang aktif
  const [activeWallet, setActiveWallet] = useState("Belum terhubung");

  const handleMenuPress = (actionId, title) => {
    switch (actionId) {
      case "edit":
        setEditModalVisible(true);
        break;
      case "wallet":
        setWalletModalVisible(true);
        break;
      case "logout":
        Alert.alert(
          "Konfirmasi Keluar",
          "Apakah kamu yakin ingin keluar dari sesi aplikasi saat ini?",
          [
            { text: "Batal", style: "cancel" },
            {
              text: "Ya, Keluar",
              style: "destructive",
              onPress: () => console.log("Proses Logout..."),
            },
          ],
        );
        break;
      default:
        Alert.alert(
          "Fitur Segera Hadir",
          `Halaman pengaturan untuk "${title}" sedang dalam tahap pengembangan.`,
        );
        break;
    }
  };

  const menuItems = [
    { id: "1", actionId: "edit", icon: "edit", title: "Edit Profil" },
    {
      id: "2",
      actionId: "wallet",
      icon: "credit-card",
      title: "Metode Pencairan (E-Wallet)",
    },
    { id: "3", actionId: "notif", icon: "bell-o", title: "Notifikasi" },
    { id: "4", actionId: "security", icon: "shield", title: "Keamanan Akun" },
    {
      id: "5",
      actionId: "help",
      icon: "question-circle-o",
      title: "Bantuan & Dukungan",
    },
    {
      id: "6",
      actionId: "logout",
      icon: "sign-out",
      title: "Keluar",
      color: "#EF4444",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Area Header Profil */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <FontAwesome name="user-circle" size={90} color="#D1D5DB" />
            <TouchableOpacity style={styles.editAvatarButton}>
              <FontAwesome name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.bio}>{bio}</Text>
          <View style={styles.locationRow}>
            <FontAwesome name="map-marker" size={14} color="#9CA3AF" />
            <Text style={styles.locationText}>{location}</Text>
          </View>
        </View>

        {/* Area Statistik */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{points}</Text>
            <Text style={styles.statLabel}>Total Poin</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalBottles}</Text>
            <Text style={styles.statLabel}>Botol Didaur</Text>
          </View>
        </View>

        {/* Info Wallet Aktif */}
        <View style={styles.walletInfo}>
          <Text style={styles.walletLabel}>Status Pencairan:</Text>
          <Text
            style={[
              styles.walletStatus,
              activeWallet !== "Belum terhubung" && { color: "#10B981" },
            ]}
          >
            {activeWallet}
          </Text>
        </View>

        {/* Area Daftar Menu */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.actionId, item.title)}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconWrapper}>
                  <FontAwesome
                    name={item.icon}
                    size={20}
                    color={item.color || "#4B5563"}
                  />
                </View>
                <Text
                  style={[styles.menuText, item.color && { color: item.color }]}
                >
                  {item.title}
                </Text>
              </View>
              <FontAwesome name="angle-right" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.versionText}>Eco-Point v1.0.0</Text>
      </ScrollView>

      {/* ========================================== */}
      {/* MODAL 1: EDIT PROFIL */}
      {/* ========================================== */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profil</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <FontAwesome name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nama Panggilan</Text>
            <TextInput
              style={styles.inputField}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.inputLabel}>Bio Singkat</Text>
            <TextInput
              style={styles.inputField}
              value={bio}
              onChangeText={setBio}
            />

            <Text style={styles.inputLabel}>Lokasi Domisili</Text>
            <TextInput
              style={styles.inputField}
              value={location}
              onChangeText={setLocation}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 2: PILIH E-WALLET */}
      {/* ========================================== */}
      <Modal visible={walletModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hubungkan E-Wallet</Text>
              <TouchableOpacity onPress={() => setWalletModalVisible(false)}>
                <FontAwesome name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Pilih dompet digital untuk mencairkan poinmu.
            </Text>

            <TouchableOpacity
              style={styles.walletOption}
              onPress={() => {
                setActiveWallet("Terhubung ke GoPay");
                setWalletModalVisible(false);
              }}
            >
              <FontAwesome
                name="google-wallet"
                size={24}
                color="#00AED6"
                style={{ width: 35 }}
              />
              <Text style={styles.walletOptionText}>GoPay</Text>
              <FontAwesome
                name="check-circle"
                size={20}
                color={activeWallet.includes("GoPay") ? "#10B981" : "#E5E7EB"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.walletOption}
              onPress={() => {
                setActiveWallet("Terhubung ke OVO");
                setWalletModalVisible(false);
              }}
            >
              <FontAwesome
                name="credit-card-alt"
                size={20}
                color="#4C3494"
                style={{ width: 35 }}
              />
              <Text style={styles.walletOptionText}>OVO</Text>
              <FontAwesome
                name="check-circle"
                size={20}
                color={activeWallet.includes("OVO") ? "#10B981" : "#E5E7EB"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 25,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarWrapper: { position: "relative", marginBottom: 15 },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#10B981",
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  name: {
    fontSize: 22,
    color: "#111827",
    marginBottom: 4,
    fontFamily: "Poppins_700Bold",
  },
  bio: {
    fontSize: 14,
    color: "#10B981",
    marginBottom: 8,
    fontFamily: "Poppins_500Medium",
  },
  locationRow: { flexDirection: "row", alignItems: "center" },
  locationText: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 6,
    fontFamily: "Poppins_400Regular",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: { flex: 1, alignItems: "center" },
  divider: { width: 1, backgroundColor: "#F3F4F6" },
  statValue: {
    fontSize: 24,
    color: "#111827",
    marginBottom: 4,
    fontFamily: "Poppins_700Bold",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  walletInfo: { flexDirection: "row", justifyContent: "center", marginTop: 15 },
  walletLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginRight: 5,
    fontFamily: "Poppins_400Regular",
  },
  walletStatus: {
    fontSize: 13,
    color: "#EF4444",
    fontFamily: "Poppins_700Bold",
  },
  menuContainer: { marginTop: 15, paddingHorizontal: 20 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  menuLeft: { flexDirection: "row", alignItems: "center" },
  iconWrapper: { width: 30, alignItems: "center", marginRight: 15 },
  menuText: {
    fontSize: 15,
    color: "#374151",
    fontFamily: "Poppins_600SemiBold",
  },
  versionText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
    fontFamily: "Poppins_400Regular",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, color: "#111827", fontFamily: "Poppins_700Bold" },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
    fontFamily: "Poppins_400Regular",
  },
  inputLabel: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 8,
    fontFamily: "Poppins_600SemiBold",
  },
  inputField: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 16,
    color: "#111827",
    fontFamily: "Poppins_500Medium",
  },
  saveButton: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  walletOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 12,
  },
  walletOptionText: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    fontFamily: "Poppins_600SemiBold",
  },
});
