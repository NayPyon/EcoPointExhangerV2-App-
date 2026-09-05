import {
  Colors,
  Components,
  Semantic,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "@/constants/theme";
import { Feather, FontAwesome } from "@expo/vector-icons";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ListRenderItemInfo,
} from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { db } from "../../firebaseConfig";
import { AnimatedPress } from "@/components/ui/animated-press";
import { SkeletonListItem } from "@/components/ui/skeleton";

interface RiwayatItem {
  id: string;
  user: string;
  tanggal: Timestamp;
  tipe: "penyetoran" | "tukar_voucher" | string;
  poin: number;
  plastik?: number;
  logam?: number;
  nama_hadiah?: string;
}

type FilterType = "Semua" | "Masuk" | "Keluar";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [riwayatData, setRiwayatData] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("Semua");

  useEffect(() => {
    // Mengambil data riwayat milik Nayaka, disusun mengikut tarikh terbaru
    const q = query(
      collection(db, "Riwayat"),
      where("user", "==", "Nayaka"),
      orderBy("tanggal", "desc")
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      const data: RiwayatItem[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as RiwayatItem);
      });
      setRiwayatData(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const formatTanggal = (timestamp?: Timestamp): string => {
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

  const filteredData = riwayatData.filter((item) => {
    if (activeFilter === "Semua") return true;
    if (activeFilter === "Masuk") return item.tipe !== "tukar_voucher";
    if (activeFilter === "Keluar") return item.tipe === "tukar_voucher";
    return true;
  });

  const renderFilterChips = () => {
    const filters: FilterType[] = ["Semua", "Masuk", "Keluar"];
    return (
      <View style={styles.filterContainer}>
        {filters.map((filter) => {
          const isSelected = activeFilter === filter;
          return (
            <AnimatedPress
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterChip,
                isSelected ? styles.filterChipActive : styles.filterChipInactive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  isSelected ? styles.filterTextActive : styles.filterTextInactive,
                ]}
              >
                {filter}
              </Text>
            </AnimatedPress>
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item, index }: ListRenderItemInfo<RiwayatItem>) => {
    const isKredit = item.tipe === "tukar_voucher"; // Keluar
    const isPenyetoran = !isKredit; // Masuk

    const accentColor = isKredit ? Semantic.danger.main : Semantic.success.main;
    const bgColor = isKredit ? Semantic.danger.light : Semantic.success.light;
    const iconColor = isKredit ? Semantic.danger.main : Semantic.success.main;
    const iconBgColor = isKredit ? Colors.red[100] : Colors.green[100];

    return (
      <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
        <AnimatedPress
          style={[
            styles.historyCard,
            { borderLeftColor: accentColor, backgroundColor: bgColor },
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: iconBgColor },
            ]}
          >
            <Feather
              name={isKredit ? "arrow-up-right" : "arrow-down-left"}
              size={20}
              color={iconColor}
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
                { color: accentColor },
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
        </AnimatedPress>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.four }]}>
        <Text style={styles.headerTitle}>Aktivitas</Text>
        <Text style={styles.headerSubtitle}>
          Riwayat penggunaan poin dan penyetoran
        </Text>
        {renderFilterChips()}
      </View>

      {loading ? (
        <View style={styles.listContainer}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonListItem key={i} style={{ marginBottom: Spacing.three }} />
          ))}
        </View>
      ) : filteredData.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <FontAwesome
              name="list-alt"
              size={48}
              color={Semantic.text.muted}
            />
          </View>
          <Text style={styles.emptyStateTitle}>Belum Ada Aktivitas</Text>
          <Text style={styles.emptyStateText}>
            Semua riwayat transaksi masuk dan keluar poinmu akan muncul di sini.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
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
    backgroundColor: Semantic.background.secondary 
  },
  header: {
    backgroundColor: Semantic.background.primary,
    paddingBottom: Spacing.four,
    paddingHorizontal: Spacing.five,
    borderBottomWidth: 1,
    borderColor: Components.card.border,
    ...Shadows.sm,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.xxl,
    color: Semantic.text.primary,
  },
  headerSubtitle: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.base,
    color: Semantic.text.secondary,
    marginTop: Spacing.xs,
  },
  filterContainer: {
    flexDirection: "row",
    marginTop: Spacing.four,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: Semantic.success.main,
    borderColor: Semantic.success.main,
  },
  filterChipInactive: {
    backgroundColor: Colors.neutral[100],
    borderColor: Colors.neutral[200],
  },
  filterText: {
    fontFamily: Typography.fontFamily.interMedium,
    fontSize: Typography.size.sm,
  },
  filterTextActive: {
    color: Colors.neutral[0],
  },
  filterTextInactive: {
    color: Semantic.text.secondary,
  },
  listContainer: { 
    padding: Spacing.five,
    paddingBottom: Spacing.xxxl,
  },
  historyCard: {
    flexDirection: "row",
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.three,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Components.card.border,
    borderLeftWidth: 4,
    ...Shadows.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.four,
  },
  detailsContainer: { 
    flex: 1 
  },
  titleText: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.size.md,
    color: Semantic.text.primary,
  },
  dateText: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.sm,
    color: Semantic.text.muted,
    marginTop: 2,
  },
  subText: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.sm,
    color: Semantic.text.secondary,
    marginTop: Spacing.xs,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pointsText: {
    fontFamily: Typography.fontFamily.interBold,
    fontSize: Typography.size.lg,
    marginRight: Spacing.xs, 
  },
  coinIcon: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    backgroundColor: Semantic.warning.main,
    justifyContent: "center",
    alignItems: "center",
  },
  coinText: {
    fontFamily: Typography.fontFamily.interBold,
    fontSize: Typography.size.xs,
    color: Semantic.background.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xxxl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  emptyStateTitle: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.size.lg,
    color: Semantic.text.primary,
  },
  emptyStateText: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.base,
    color: Semantic.text.secondary,
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
});
