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
  const { totalPoin, totalPlastik, totalLogam, hariKonsisten } = usePoints();
  const [isExpanded, setIsExpanded] = useState(false);

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

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const GAMIFICATION_TIERS = [
    { name: "Radiant Recycler ✨", req: "50.000+ pts", benefit: "+20% Poin" },
    { name: "Elderwood Guardian 🛡️", req: "25.000 pts", benefit: "+15% Poin" },
    { name: "Sylvan Sapling 🌳", req: "10.000 pts", benefit: "+10% Poin" },
    { name: "Verdant Sprout 🌿", req: "2.500 pts", benefit: "+5% Poin" },
    { name: "Pebble Seed 🌱", req: "0 pts", benefit: "Normal (1x)" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
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
              <View style={styles.pointHeader}>
                {Platform.OS === "ios" ? (
                  <BlurView
                    intensity={40}
                    tint="light"
                    style={styles.glassBadge}
                  >
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

        <View style={styles.statsWrapper}>
          <View style={styles.statsRow}>
            <View style={styles.statBoxSmall}>
              <View style={[styles.iconCircle, { backgroundColor: "#DBEAFE" }]}>
                <FontAwesome name="tint" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.statNumber}>{totalPlastik}</Text>
              <Text style={styles.statLabel}>Plastik Disetor</Text>
            </View>

            <View style={styles.statBoxSmall}>
              <View style={[styles.iconCircle, { backgroundColor: "#E0E7FF" }]}>
                <FontAwesome name="cube" size={20} color="#6366F1" />
              </View>
              <Text style={styles.statNumber}>{totalLogam}</Text>
              <Text style={styles.statLabel}>Logam Disetor</Text>
            </View>
          </View>

          {/* --- BAGIAN KONSISTENSI DENGAN TEMA API 🔥 --- */}
          <View style={styles.consistencyCard}>
            <View style={styles.consistencyHeader}>
              <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                <Text style={styles.consistencyValue}>
                  {hariKonsisten}
                  {hariKonsisten <= 7 && (
                    <Text style={styles.consistencyMax}>/7</Text>
                  )}
                </Text>
                <Text style={[styles.consistencyUnit, { marginLeft: 6 }]}>
                  Hari
                </Text>
              </View>

              <View style={styles.streakBadge}>
                <FontAwesome
                  name="fire"
                  size={14}
                  color="#EF4444"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.streakText}>Streak</Text>
              </View>
            </View>

            {/* Wrapper Baru Agar Icon Api Ada di Sebelah Kanan Bar */}
            <View style={styles.progressBarWrapper}>
              <View style={styles.consistencyBarBg}>
                {/* Menggunakan Linear Gradient untuk Efek Terbakar */}
                <LinearGradient
                  colors={["#FBBF24", "#F97316", "#EF4444"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.consistencyBarFill,
                    { width: `${Math.min((hariKonsisten / 7) * 100, 100)}%` },
                  ]}
                />
              </View>
              {/* Ornamen Api di Ujung Bar */}
              <FontAwesome
                name="fire"
                size={20}
                color="#EF4444"
                style={{ marginLeft: 12 }}
              />
            </View>

            <Text style={styles.consistencyTitle}>
              {hariKonsisten > 7
                ? "Pencapaian Luar Biasa! Terus Pertahankan 🔥"
                : "Target Konsistensi 7 Hari"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
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
  statsWrapper: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statBoxSmall: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#111827",
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  consistencyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  consistencyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  consistencyValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: "#111827",
  },
  consistencyMax: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  consistencyUnit: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#F97316", // Berubah jadi oren agar senada
    marginBottom: 4,
  },
  progressBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  consistencyBarBg: {
    flex: 1, // Membentang penuhi sisa ruang kiri icon api
    height: 12,
    backgroundColor: "#FFEDD5", // Background oren sangat pudar
    borderRadius: 6,
    overflow: "hidden",
  },
  consistencyBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  consistencyTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  streakText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: "#EF4444",
  },
});
