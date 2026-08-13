import { FontAwesome } from "@expo/vector-icons";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
// Pastikan jumlah titik-titik untuk import db ini sesuai (biasanya ../../firebaseConfig)
import { db } from "../../firebaseConfig";

export default function HistoryScreen() {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Membuat query untuk menyedot data dari koleksi 'Riwayat_Transaksi'
    // orderBy('timestamp', 'desc') memastikan data terbaru ada di urutan paling atas
    const q = query(
      collection(db, "Riwayat_Transaksi"),
      orderBy("timestamp", "desc"),
    );

    // 2. onSnapshot akan memantau perubahan data secara real-time
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const dataHistory: any = [];
        snapshot.forEach((doc) => {
          dataHistory.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setRiwayat(dataHistory);
        setLoading(false);
      },
      (error) => {
        console.error("Gagal menarik data riwayat:", error);
        setLoading(false);
      },
    );

    // Membersihkan memori saat pindah layar
    return () => unsubscribe();
  }, []);

  // Fungsi untuk merapikan format waktu dari Firebase
  const formatTanggal = (timestamp: any) => {
    if (!timestamp) return "Waktu tidak diketahui";
    const date = timestamp.toDate(); // Ubah format Firebase ke format Javascript
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Desain untuk setiap baris kartu riwayat
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <FontAwesome name="recycle" size={24} color="#10B981" />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>Tukar {item.total_botol || 0} Botol</Text>
        <Text style={styles.date}>{formatTanggal(item.timestamp)}</Text>
      </View>
      <View style={styles.pointContainer}>
        <Text style={styles.pointText}>+{item.poin_didapat || 0} Poin</Text>
      </View>
    </View>
  );

  // Tampilan saat data masih loading
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Riwayat Penukaran</Text>

      {riwayat.length === 0 ? (
        // Tampilan jika belum ada transaksi sama sekali
        <View style={styles.emptyContainer}>
          <FontAwesome name="inbox" size={50} color="#D1D5DB" />
          <Text style={styles.emptyText}>
            Belum ada riwayat penukaran botol.
          </Text>
          <Text style={styles.emptySubText}>
            Ayo mulai selamatkan bumi hari ini!
          </Text>
        </View>
      ) : (
        // Tampilan list daftar riwayat
        <FlatList
          data={riwayat}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 24,
    color: "#111827",
    marginBottom: 20,
    fontWeight: "bold", // Hapus baris ini kalau font Poppins sudah tersetting global
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
  },
  pointContainer: {
    backgroundColor: "#DEF7EC",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  pointText: {
    color: "#046C4E",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
});
