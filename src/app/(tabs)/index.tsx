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

export default function HomeScreen() {
  const { points, totalBottles, addPoints } = usePoints();

  // Sistem Leveling Sederhana
  const targetPoints = 1000;
  const progressPercentage = Math.min((points / targetPoints) * 100, 100);

  const getLevelName = () => {
    if (points >= 1000) return "Eco-Master 👑";
    if (points >= 500) return "Eco-Warrior ⚔️";
    return "Eco-Starter 🌱";
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header dengan Sapaan */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, Nayaka! 👋</Text>
          <Text style={styles.subtitle}>Mari selamatkan bumi hari ini.</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} style={styles.notificationIcon}>
          <FontAwesome name="bell-o" size={24} color="#111827" />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      {/* Kartu Poin Utama dengan Progress Bar */}
      <View style={styles.pointCard}>
        <View style={styles.pointHeader}>
          <Text style={styles.levelBadge}>{getLevelName()}</Text>
          <FontAwesome name="leaf" size={20} color="#D1FAE5" />
        </View>

        <Text style={styles.pointLabel}>Total Poin</Text>
        <Text style={styles.pointValue}>{points}</Text>

        {/* Komponen Progress Bar */}
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
            {points} / {targetPoints} Poin menuju level berikutnya
          </Text>
        </View>
      </View>

      {/* Statistik Mini */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <FontAwesome name="recycle" size={24} color="#10B981" />
          <Text style={styles.statNumber}>{totalBottles}</Text>
          <Text style={styles.statLabel}>Botol Didaur</Text>
        </View>
        <View style={styles.statBox}>
          <FontAwesome name="fire" size={24} color="#F59E0B" />
          <Text style={styles.statNumber}>3 Hari</Text>
          <Text style={styles.statLabel}>Konsisten</Text>
        </View>
      </View>

      {/* Tombol Simulasi (Dengan efek tekan activeOpacity) */}
      <View style={styles.actionContainer}>
        <Text style={styles.sectionTitle}>Uji Coba Sistem</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.simulateButton}
          onPress={() => addPoints(50, 5, "Simulasi Masukkan 5 Botol")}
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

  // Perhatikan di sini, kita tambahkan fontFamily
  greeting: {
    fontSize: 24,
    color: "#111827",
    fontFamily: "Poppins_700Bold", // Membuat tulisan jadi tebal (Bold)
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    fontFamily: "Poppins_400Regular", // Membuat tulisan jadi standar (Regular)
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

  pointCard: {
    backgroundColor: "#10B981",
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  pointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  // Font untuk level dan poin
  levelBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    overflow: "hidden",
  },
  pointLabel: {
    color: "#D1FAE5",
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "Poppins_400Regular",
  },
  pointValue: {
    color: "#FFFFFF",
    fontSize: 48,
    marginBottom: 20,
    fontFamily: "Poppins_700Bold",
  },

  progressContainer: { marginTop: 10 },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  progressText: {
    color: "#D1FAE5",
    fontSize: 12,
    marginTop: 8,
    fontFamily: "Poppins_500Medium",
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // Font untuk statistik
  statNumber: {
    fontSize: 20,
    color: "#111827",
    marginTop: 12,
    fontFamily: "Poppins_700Bold",
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
  },

  actionContainer: { padding: 20, marginTop: 10, paddingBottom: 100 },
  sectionTitle: {
    fontSize: 18,
    color: "#111827",
    marginBottom: 15,
    fontFamily: "Poppins_700Bold",
  },
  simulateButton: {
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  simulateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
});
