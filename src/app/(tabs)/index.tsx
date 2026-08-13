import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePoints } from "../../PointContext";
// 1. Import senjata rahasia kita
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const { totalPoin, totalBottles, hariKonsisten } = usePoints();

  const targetPoints = 1000;
  const progressPercentage = Math.min((totalPoin / targetPoints) * 100, 100);

  const getLevelName = () => {
    if (totalPoin >= 1000) return "Eco-Master 👑";
    if (totalPoin >= 500) return "Eco-Warrior ⚔️";
    return "Eco-Starter 🌱";
  };

  // Fungsi dengan efek getaran (Haptic Feedback)
  const handleSimulatePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); // Getaran tebal/mantap
    addPoints(50, 5, "Simulasi Masukkan 5 Botol");
  };

  const handleBellPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Getaran ringan/halus
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, Nayaka! 👋</Text>
          <Text style={styles.subtitle}>Mari selamatkan bumi hari ini.</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.notificationIcon}
          onPress={handleBellPress}
        >
          <FontAwesome name="bell-o" size={24} color="#111827" />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      {/* 2. Linear Gradient: Membuat warna kartu mengkilat dan berdimensi */}
      <View style={styles.cardWrapper}>
        <LinearGradient
          colors={["#059669", "#10B981", "#34D399"]} // Gradasi dari gelap ke terang
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.pointCard}
        >
          <View style={styles.pointHeader}>
            {/* 3. Glassmorphism: Efek kaca buram (frosted glass) pada label level */}
            <BlurView intensity={40} tint="light" style={styles.glassBadge}>
              <Text style={styles.levelText}>{getLevelName()}</Text>
            </BlurView>
            <FontAwesome name="leaf" size={24} color="#D1FAE5" />
          </View>

          <Text style={styles.pointLabel}>Total Poin</Text>
          <Text style={styles.pointValue}>{totalPoin}</Text>

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
              {totalPoin} / {targetPoints} Poin menuju level berikutnya
            </Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <FontAwesome name="recycle" size={24} color="#10B981" />
          {/* Mengganti angka 12 menjadi totalBottles */}
          <Text style={styles.statNumber}>{totalBottles}</Text>
          <Text style={styles.statLabel}>Botol Didaur</Text>
        </View>
        <View style={styles.statBox}>
          <FontAwesome name="fire" size={24} color="#F59E0B" />
          {/* Mengganti angka 3 menjadi hariKonsisten */}
          <Text style={styles.statNumber}>{hariKonsisten} Hari</Text>
          <Text style={styles.statLabel}>Konsisten</Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <Text style={styles.sectionTitle}>Uji Coba Sistem</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.simulateButton}
          onPress={handleSimulatePress}
        >
          <FontAwesome
            name="plus-circle"
            size={20}
            color="#FFFFFF"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.simulateButtonText}>
            Simulasi Masukkan 5 Botol (+50 Poin)
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: { fontSize: 24, color: "#111827", fontFamily: "Poppins_700Bold" },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
  },
  notificationIcon: {
    padding: 8,
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
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
    overflow: "hidden",
  },
  pointCard: { padding: 24 },
  pointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
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
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },

  pointLabel: {
    color: "#D1FAE5",
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "Poppins_500Medium",
  },
  pointValue: {
    color: "#FFFFFF",
    fontSize: 48,
    marginBottom: 20,
    fontFamily: "Poppins_700Bold",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  progressContainer: { marginTop: 10 },
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
    color: "#E5E7EB",
    fontSize: 12,
    marginTop: 8,
    fontFamily: "Poppins_500Medium",
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 25,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statNumber: {
    fontSize: 22,
    color: "#111827",
    marginTop: 12,
    fontFamily: "Poppins_700Bold",
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    fontFamily: "Poppins_500Medium",
  },

  actionContainer: { padding: 20, marginTop: 15, paddingBottom: 100 },
  sectionTitle: {
    fontSize: 18,
    color: "#111827",
    marginBottom: 15,
    fontFamily: "Poppins_700Bold",
  },
  simulateButton: {
    flexDirection: "row",
    backgroundColor: "#111827",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  simulateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
});
