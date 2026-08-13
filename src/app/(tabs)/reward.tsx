import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePoints } from "../../PointContext"; // Pastikan titik-titiknya pas ya!

export default function RewardScreen() {
  // Menarik data poin asli dari mesin utama kita
  const { totalPoin } = usePoints();

  // Katalog Hadiah
  const REWARDS = [
    {
      id: "1",
      title: "Saldo GoPay Rp 10.000",
      points: 500,
      icon: "wallet",
      color: "#00AED6",
    },
    {
      id: "2",
      title: "Saldo OVO Rp 10.000",
      points: 500,
      icon: "wallet",
      color: "#4C3494",
    },
    {
      id: "3",
      title: "Voucher Momoyo Ice Cream",
      points: 300,
      icon: "ice-cream",
      color: "#F43F5E",
    },
    {
      id: "4",
      title: "Langganan Vidio Platinum",
      points: 1000,
      icon: "television-play",
      color: "#E11D48",
    },
    {
      id: "5",
      title: "Valorant Points (VP)",
      points: 1200,
      icon: "gamepad-variant",
      color: "#EF4444",
    },
  ];

  // Logika saat tombol Tukar ditekan
  const handleRedeem = (item: any) => {
    if (totalPoin >= item.points) {
      // Jika poin cukup
      Alert.alert(
        "Konfirmasi Penukaran",
        `Apakah kamu yakin ingin menukar ${item.points} poin dengan ${item.title}?`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Tukar",
            onPress: () =>
              Alert.alert("Berhasil! 🎉", "Hadiahmu sedang diproses."),
            // Catatan: Nanti di sini kita bisa tambahkan logika pemotongan poin ke Firebase
          },
        ],
      );
    } else {
      // Jika poin kurang
      const kurang = item.points - totalPoin;
      Alert.alert(
        "Poin Belum Cukup 😅",
        `Kamu butuh ${kurang} poin lagi untuk menukarkan ${item.title}. Ayo daur ulang lebih banyak botol!`,
      );
    }
  };

  const renderRewardItem = ({ item }: { item: any }) => {
    const isPoinCukup = totalPoin >= item.points;

    return (
      <View style={styles.card}>
        <View
          style={[styles.iconContainer, { backgroundColor: item.color + "20" }]}
        >
          <MaterialCommunityIcons
            name={item.icon}
            size={32}
            color={item.color}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.pointBadge}>
            <FontAwesome name="star" size={12} color="#F59E0B" />
            <Text style={styles.pointText}>{item.points} Poin</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            isPoinCukup ? styles.buttonActive : styles.buttonDisabled,
          ]}
          onPress={() => handleRedeem(item)}
        >
          <Text
            style={[
              styles.buttonText,
              isPoinCukup ? styles.textActive : styles.textDisabled,
            ]}
          >
            Tukar
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Poin Saat Ini */}
      <View style={styles.headerCard}>
        <Text style={styles.headerLabel}>Poin Tersedia</Text>
        <Text style={styles.headerValue}>{totalPoin}</Text>
      </View>

      <Text style={styles.sectionTitle}>Katalog Hadiah</Text>

      {/* Daftar Hadiah */}
      <FlatList
        data={REWARDS}
        keyExtractor={(item) => item.id}
        renderItem={renderRewardItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  headerCard: {
    backgroundColor: "#10B981",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#10B981",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  headerLabel: {
    color: "#D1FAE5",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600",
  },
  headerValue: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#111827",
    fontWeight: "bold",
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "bold",
    marginBottom: 6,
  },
  pointBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  pointText: {
    color: "#B45309",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginLeft: 10,
  },
  buttonActive: {
    backgroundColor: "#10B981",
  },
  buttonDisabled: {
    backgroundColor: "#F3F4F6",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  textActive: {
    color: "#FFFFFF",
  },
  textDisabled: {
    color: "#9CA3AF",
  },
});
