import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { usePoints } from "../../PointContext";

// Mengaktifkan fitur animasi layout untuk Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const { totalPoin, totalBottles, hariKonsisten } = usePoints();
  const [isExpanded, setIsExpanded] = useState(false); // State untuk mengatur buka/tutup kartu

  const getLevelName = () => {
    if (totalPoin >= 50000) return "Radiant Recycler ✨";
    if (totalPoin >= 25000) return "Elderwood Guardian 🛡️";
    if (totalPoin >= 10000) return "Sylvan Sapling 🌳";
    if (totalPoin >= 2500) return "Verdant Sprout 🌿";
    return "Pebble Seed 🌱";
  };

  const getTargetPoints = () => {
    if (totalPoin >= 50000) return totalPoin;
    if (totalPoin >= 25000) return 50000;
    if (totalPoin >= 10000) return 25000;
    if (totalPoin >= 2500) return 10000;
    return 2500;
  };

  const targetPoints = getTargetPoints();
  const progressPercentage =
    totalPoin >= 50000 ? 100 : Math.min((totalPoin / targetPoints) * 100, 100);

  const handleBellPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/notifications");
  };

  // Fungsi saat kartu hijau ditekan
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Animasi smooth
    setIsExpanded(!isExpanded);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Data gamifikasi untuk ditampilkan di dalam kartu yang mengekspansi
  const GAMIFICATION_TIERS = [
    { name: "Radiant Recycler ✨", req: "50.000+ pts", benefit: "+20% Poin" },
    { name: "Elderwood Guardian 🛡️", req: "25.000 pts", benefit: "+15% Poin" },
    { name: "Sylvan Sapling 🌳", req: "10.000 pts", benefit: "+10% Poin" },
    { name: "Verdant Sprout 🌿", req: "2.500 pts", benefit: "+5% Poin" },
    { name: "Pebble Seed 🌱", req: "0 pts", benefit: "Normal (1x)" },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, Nayaka! 👋</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.notificationIcon}
          onPress={handleBellPress}
        >
          <FontAwesome name="bell-o" size={22} color="#111827" />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardWrapper}>
        <TouchableOpacity activeOpacity={0.9} onPress={toggleExpand}>
          <LinearGradient
            colors={["#059669", "#10B981", "#34D399"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pointCard}
          >
            {/* INI BAGIAN YANG SUDAH DIPERBAIKI */}
            <View style={styles.pointHeader}>
              {Platform.OS === "ios" ? (
                <BlurView intensity={40} tint="light" style={styles.glassBadge}>
                  <Text style={styles.levelText}>{getLevelName()}</Text>
                </BlurView>
              ) : (
                <View
                  style={[
                    styles.glassBadge,
                    { backgroundColor: "rgba(255, 255, 255, 0.25)" },
                  ]}
                >
                  <Text style={styles.levelText}>{getLevelName()}</Text>
                </View>
              )}
              <FontAwesome name="leaf" size={24} color="#D1FAE5" />
            </View>

            <View style={styles.pointContent}>
              <Text style={styles.pointLabel}>Total Poin Saat Ini</Text>
              <Text style={styles.pointValue}>{totalPoin}</Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {totalPoin >= 50000
                  ? "Rank Maksimal Tercapai! Sultan RVM 🎉"
                  : `${totalPoin} / ${targetPoints} Poin menuju level berikutnya`}
              </Text>
            </View>

            {/* Bagian yang akan Terbuka (Expand) */}
            {isExpanded && (
              <View style={styles.expandedContent}>
                <View style={styles.divider} />
                <Text style={styles.expandedTitle}>Keuntungan Tiap Rank</Text>

                {GAMIFICATION_TIERS.map((tier, index) => (
                  <View key={index} style={styles.rankRow}>
                    <View>
                      <Text style={styles.rankName}>{tier.name}</Text>
                      <Text style={styles.rankReq}>Butuh {tier.req}</Text>
                    </View>
                    <View style={styles.benefitBadge}>
                      <Text style={styles.benefitText}>{tier.benefit}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Indikator Panah Bawah/Atas */}
            <View style={styles.expandHintRow}>
              <Text style={styles.expandHintText}>
                {isExpanded
                  ? "Tutup Info Rank"
                  : "Lihat Info Rank & Keuntungan"}
              </Text>
              <FontAwesome
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={10}
                color="rgba(255, 255, 255, 0.7)"
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <View style={styles.iconCircle}>
            <FontAwesome name="recycle" size={26} color="#10B981" />
          </View>
          <Text style={styles.statNumber}>{totalBottles}</Text>
          <Text style={styles.statLabel}>Botol Didaur</Text>
        </View>
        <View style={styles.statBox}>
          <View style={[styles.iconCircle, { backgroundColor: "#FEF3C7" }]}>
            <FontAwesome name="fire" size={26} color="#F59E0B" />
          </View>
          <Text style={styles.statNumber}>{hariKonsisten} Hari</Text>
          <Text style={styles.statLabel}>Konsisten</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontFamily: "Poppins_700Bold",
    fontSize: 22,
    color: "#111827",
  },
  notificationIcon: {
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    backgroundColor: "#EF4444",
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  cardWrapper: {
    marginHorizontal: 20,
    borderRadius: 24,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  pointCard: {
    padding: 24,
  },
  pointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  glassBadge: {
    borderRadius: 20,
    overflow: "hidden",
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  levelText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 13,
  },
  pointContent: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  pointLabel: {
    fontFamily: "Inter_400Regular",
    color: "#D1FAE5",
    fontSize: 13,
    marginBottom: -5,
  },
  pointValue: {
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    fontSize: 64,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  progressContainer: {
    marginTop: 15,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  progressText: {
    fontFamily: "Inter_600SemiBold",
    color: "#E5E7EB",
    fontSize: 11,
    marginTop: 8,
    textAlign: "center",
  },

  // STYLING BARU UNTUK KARTU YANG EXPAND
  expandedContent: {
    marginTop: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 15,
  },
  expandedTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 12,
  },
  rankRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rankName: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 13,
  },
  rankReq: {
    fontFamily: "Inter_400Regular",
    color: "#D1FAE5",
    fontSize: 11,
    marginTop: 2,
  },
  benefitBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  benefitText: {
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    fontSize: 11,
  },
  expandHintRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  expandHintText: {
    fontFamily: "Inter_500Medium",
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 11,
    marginRight: 6,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 100, // Tambah jarak bawah ekstra agar aman saat kartu memanjang dan digeser
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#111827",
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
});
