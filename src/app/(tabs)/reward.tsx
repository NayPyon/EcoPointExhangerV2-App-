import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router"; // <--- Kita pakai alat pelacak fokus ini
import React, { useCallback, useRef } from "react";
import {
  Alert,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePoints } from "../../PointContext";

// Komponen Bungkusan Animasi
const AnimatedCard = ({ children, index }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  // useFocusEffect akan menjalankan animasi SETIAP KALI tab ini diklik
  useFocusEffect(
    useCallback(() => {
      // 1. Kembalikan posisi kartu ke bawah dan sembunyikan (transparan)
      opacity.setValue(0);
      translateY.setValue(50);

      // 2. Mainkan animasinya lagi
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, []),
  );

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

export default function RewardScreen() {
  const { points } = usePoints();

  const rewardItems = [
    {
      id: "1",
      title: "Saldo GoPay Rp50.000",
      cost: 500,
      icon: "google-wallet",
      color: "#00AED6",
    },
    {
      id: "2",
      title: "Saldo OVO Rp50.000",
      cost: 500,
      icon: "credit-card-alt",
      color: "#4C3494",
    },
    {
      id: "3",
      title: "Voucher Momoyo Rp20.000",
      cost: 200,
      icon: "star",
      color: "#F59E0B",
    },
    {
      id: "4",
      title: "Steam Wallet IDR 45.000",
      cost: 450,
      icon: "steam",
      color: "#111827",
    },
    {
      id: "5",
      title: "Voucher Burger King",
      cost: 300,
      icon: "cutlery",
      color: "#D97706",
    },
    {
      id: "6",
      title: "Langganan Spotify 1 Bulan",
      cost: 600,
      icon: "spotify",
      color: "#1DB954",
    },
  ];

  const handleRedeem = (item) => {
    if (points >= item.cost) {
      Alert.alert(
        "Konfirmasi Penukaran",
        `Apakah kamu yakin ingin menukar ${item.cost} poin dengan ${item.title}?`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Tukar",
            onPress: () =>
              Alert.alert(
                "Berhasil! 🎉",
                "Voucher akan segera dikirim ke akunmu.",
              ),
          },
        ],
      );
    } else {
      const selisih = item.cost - points;
      Alert.alert(
        "Poin Tidak Cukup",
        `Kamu butuh ${selisih} poin lagi untuk menukar hadiah ini.`,
      );
    }
  };

  const renderRewardItem = ({ item, index }) => (
    <AnimatedCard index={index}>
      <View style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: item.color + "1A" }]}>
          <FontAwesome name={item.icon} size={32} color={item.color} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.titleText}>{item.title}</Text>
          <View style={styles.costBadge}>
            <FontAwesome name="star" size={12} color="#F59E0B" />
            <Text style={styles.costText}>{item.cost} Poin</Text>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.redeemButton,
            points < item.cost && styles.redeemButtonDisabled,
          ]}
          onPress={() => handleRedeem(item)}
        >
          <Text style={styles.redeemButtonText}>Tukar</Text>
        </TouchableOpacity>
      </View>
    </AnimatedCard>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Katalog Reward</Text>
        <Text style={styles.headerSubtitle}>
          Tukarkan poinmu dengan hadiah menarik
        </Text>
        <View style={styles.pointCard}>
          <Text style={styles.pointCardLabel}>Poin Tersedia</Text>
          <Text style={styles.pointCardValue}>{points}</Text>
        </View>
      </View>

      <FlatList
        data={rewardItems}
        keyExtractor={(item) => item.id}
        renderItem={renderRewardItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 24,
    color: "#111827",
    fontFamily: "Poppins_700Bold",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 20,
    fontFamily: "Poppins_400Regular",
  },
  pointCard: {
    backgroundColor: "#10B981",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  pointCardLabel: {
    color: "#D1FAE5",
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "Poppins_500Medium",
  },
  pointCardValue: {
    color: "#FFFFFF",
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
  },
  listContainer: { padding: 20, paddingBottom: 100 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardContent: { flex: 1 },
  titleText: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 8,
    fontFamily: "Poppins_600SemiBold",
  },
  costBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  costText: {
    fontSize: 12,
    color: "#D97706",
    marginLeft: 4,
    fontFamily: "Poppins_700Bold",
  },
  redeemButton: {
    backgroundColor: "#10B981",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  redeemButtonDisabled: { backgroundColor: "#D1D5DB" },
  redeemButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
});
