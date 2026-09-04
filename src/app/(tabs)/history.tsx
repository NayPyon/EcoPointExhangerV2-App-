import {
  Colors,
  Components,
  Semantic
} from "@/constants/theme";
import { Feather, FontAwesome } from "@expo/vector-icons";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { db } from "../../firebaseConfig";

export default function HistoryScreen() {
  const [riwayatData, setRiwayatData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mengambil data riwayat milik Nayaka, disusun mengikut tarikh terbaru
    const q = query(
      collection(db, "Riwayat"),
      where("user", "==", "Nayaka"),
      orderBy("tanggal", "desc"),
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setRiwayatData(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const formatTanggal = (timestamp) => {
    if (!timestamp) return "Baru sahaja";
    const date = timestamp.toDate();
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderItem = ({ item }) => {
    const isKredit = item.tipe === "tukar_voucher";

    return (
      <View style={styles.historyCard}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isKredit
                ? Colors.red[100]
                : Components.iconWrapper.success.bg,
            },
          ]}
        >
          <Feather
            name={isKredit ? "arrow-up-right" : "arrow-down-left"}
            size={20}
            color={isKredit ? Semantic.danger.main : Semantic.success.main}
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.titleText}>
            {isKredit ? "Penukaran Hadiah" : "Penyetoran Sampah"}
          </Text>
          <Text style={styles.dateText}>{formatTanggal(item.tanggal)}</Text>

          <Text style={styles.subText}>
            {isKredit
              ? `Klaim ${item.nama_hadiah || "Voucher"}`
              : `Berhasil menyetor ${item.plastik || 0} Plastik & ${item.logam || 0} Logam`}
          </Text>
        </View>

        {/* --- BAGIAN POIN & LOGO YANG BARU --- */}
        <View style={styles.pointsContainer}>
          <Text
            style={[
              styles.pointsText,
              {
                color: isKredit ? Semantic.danger.main : Semantic.success.main,
              },
            ]}
          >
            {isKredit ? "-" : "+"}
            {item.poin}
          </Text>

          {/* Logo Koin "P" Identik dengan Beranda & Reward */}
          <View style={styles.coinIcon}>
            <Text style={styles.coinText}>P</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Aktivitas</Text>
        <Text style={styles.headerSubtitle}>
          Riwayat penggunaan poin dan penyetoran
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Semantic.success.main}
          style={{ marginTop: 50 }}
        />
      ) : riwayatData.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome
            name="list-alt"
            size={50}
            color={Components.card.border}
          />
          <Text style={styles.emptyStateTitle}>Belum Ada Aktivitas</Text>
          <Text style={styles.emptyStateText}>
            Semua riwayat transaksi masuk dan keluar poinmu akan muncul di sini.
          </Text>
        </View>
      ) : (
        <FlatList
          data={riwayatData}
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
  container: { flex: 1, backgroundColor: Semantic.background.secondary },
  header: {
    backgroundColor: Semantic.background.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: Components.card.border,
  },
  headerTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 22,
    color: Semantic.text.primary,
  },
  headerSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Semantic.text.secondary,
    marginTop: 4,
  },
  listContainer: { padding: 20 },
  historyCard: {
    flexDirection: "row",
    backgroundColor: Semantic.background.primary,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Components.card.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  detailsContainer: { flex: 1 },
  titleText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: Semantic.text.primary,
  },
  dateText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Semantic.text.muted,
    marginTop: 1,
  },
  subText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Semantic.text.secondary,
    marginTop: 4,
  },
  // --- STYLING BARU UNTUK FLEX-ROW LOGO POIN ---
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pointsText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    marginRight: 4, // Jarak sedikit antara angka dan logo koin
  },
  coinIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Semantic.warning.main,
    justifyContent: "center",
    alignItems: "center",
  },
  coinText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: Semantic.background.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyStateTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: Semantic.text.primary,
    marginTop: 16,
  },
  emptyStateText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Semantic.text.secondary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
});
