import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { usePoints } from "../../PointContext";

export default function HistoryScreen() {
  // Mengambil data riwayat dari penyimpan global
  const { historyList } = usePoints();

  // Desain untuk masing-masing kartu riwayat
  const renderHistoryItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <FontAwesome name="recycle" size={20} color="#10B981" />
      </View>

      <View style={styles.textWrapper}>
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>

      <View style={styles.pointWrapper}>
        <Text style={styles.pointText}>{item.points}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Bagian Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat Penukaran</Text>
        <Text style={styles.headerSubtitle}>Jejak perjalanan daur ulangmu</Text>
      </View>

      {/* Daftar Riwayat */}
      <FlatList
        data={historyList}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        // Tampilan jika data masih kosong
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome name="inbox" size={50} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>
              Belum ada riwayat penukaran botol.
            </Text>
          </View>
        }
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
    fontFamily: "Poppins_400Regular",
  },
  listContainer: { padding: 20, paddingBottom: 100 },
  card: {
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
    elevation: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textWrapper: { flex: 1 },
  titleText: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 4,
    fontFamily: "Poppins_600SemiBold",
  },
  dateText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
  },
  pointWrapper: {
    backgroundColor: "#DEF7EC",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  pointText: { fontSize: 14, color: "#059669", fontFamily: "Poppins_700Bold" },
  emptyState: { alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyStateText: {
    marginTop: 16,
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
  },
});
