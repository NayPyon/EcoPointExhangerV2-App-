import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePoints } from "../../PointContext"; // Mengambil data poin global

export default function HomeScreen() {
  const { points, totalBottles, addPoints } = usePoints();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Sapaan */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Halo, Nayaka! 👋</Text>
        <Text style={styles.subGreeting}>
          Ayo kumpulkan poin daur ulangmu hari ini.
        </Text>
      </View>

      {/* Kartu Utama Saldo Poin */}
      <View style={styles.cardBalance}>
        <Text style={styles.balanceLabel}>Total Poin Kamu</Text>
        <Text style={styles.balanceValue}>{points} Poin</Text>
        <View style={styles.statsRow}>
          <FontAwesome
            name="recycle"
            size={16}
            color="#FFFFFF"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.statText}>{totalBottles} Botol Terkumpul</Text>
        </View>
      </View>

      {/* Area Simulasi / Fitur Cepat */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aksi Cepat</Text>

        <TouchableOpacity
          style={styles.simulationButton}
          onPress={() => addPoints(50, 5)}
        >
          <FontAwesome
            name="plus-circle"
            size={20}
            color="#FFFFFF"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.simulationText}>
            Simulasi Masukkan 5 Botol (+50 Poin)
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  subGreeting: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  cardBalance: {
    backgroundColor: "#10B981",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#D1FAE5",
    marginBottom: 8,
    fontWeight: "500",
  },
  balanceValue: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  statText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  simulationButton: {
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  simulationText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
});
