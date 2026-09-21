import { AnimatedPress } from "@/components/ui/animated-press";
import { SkeletonListItem } from "@/components/ui/skeleton";
import {
  BorderRadius,
  Colors,
  Semantic,
  Spacing,
  Typography,
} from "@/constants/theme";
import {
  Feather,
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  Timestamp,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  Image,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../AuthContext";
import { db } from "../../firebaseConfig";

interface RiwayatItem {
  id: string;
  user: string;
  tanggal: Timestamp;
  tipe: "penyetoran" | "tukar_voucher" | "misi_mingguan" | string;
  poin: number;
  essence?: number;
  plastik?: number;
  logam?: number;
  nama_hadiah?: string;
  judul?: string;
}

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
const MONTHS_LONG = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function HistoryScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const getBgColor = () =>
    isDark ? Semantic.background.dark : Semantic.background.primary;
  const getTextColor = () =>
    isDark ? Semantic.text.light : Semantic.text.primary;
  const getMutedColor = () =>
    isDark ? Colors.obsidian[400] : Semantic.text.secondary;
  const getBorderColor = () =>
    isDark ? Colors.obsidian[800] : Semantic.border.light;

  const [riwayatData, setRiwayatData] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Default to current month and year
  const [activeMonth, setActiveMonth] = useState<number>(new Date().getMonth());
  const [activeYear, setActiveYear] = useState<number>(
    new Date().getFullYear(),
  );

  useEffect(() => {
    const q = query(
      collection(db, "Users", user!.uid, "Riwayat"),
      orderBy("tanggal", "desc"),
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

  const groupedTransactions = useMemo(() => {
    const filtered = riwayatData.filter((item) => {
      if (!item.tanggal) return false;
      const date = item.tanggal.toDate();
      return (
        date.getMonth() === activeMonth && date.getFullYear() === activeYear
      );
    });

    const groups: { [key: string]: RiwayatItem[] } = {};
    filtered.forEach((item) => {
      const date = item.tanggal.toDate();
      // Format: "30 September 2024"
      const dateStr = `${date.getDate()} ${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(item);
    });

    // Convert to SectionList format
    return Object.keys(groups).map((key) => ({
      title: key,
      data: groups[key],
    }));
  }, [riwayatData, activeMonth, activeYear]);

  const scrollRef = React.useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll automatically to the current active month on mount
    setTimeout(() => {
      if (scrollRef.current) {
        // Approximate width of chip (60) + gap (8) = 68
        scrollRef.current.scrollTo({ x: activeMonth * 68, animated: true });
      }
    }, 100);
  }, []);

  const renderMonthChips = () => {
    return (
      <View style={styles.monthScrollContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthScrollContent}
        >
          {MONTHS_SHORT.map((month, index) => {
            const isActive = activeMonth === index;
            return (
              <AnimatedPress
                key={month}
                onPress={() => setActiveMonth(index)}
                style={[
                  styles.monthChip,
                  {
                    backgroundColor: isActive
                      ? Semantic.success.main
                      : isDark
                        ? Colors.obsidian[900]
                        : Semantic.background.tertiary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.monthText,
                    { color: isActive ? "#FFFFFF" : getMutedColor() },
                    isActive && { fontFamily: Typography.fontFamily.interBold },
                  ]}
                >
                  {month}
                </Text>
              </AnimatedPress>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: RiwayatItem;
    index: number;
  }) => {
    const isKredit = item.tipe === "tukar_voucher"; // Keluar (-)
    const isMisi = item.tipe === "misi_mingguan" || (item.judul && item.judul.toLowerCase().includes("misi")); // Hadiah Misi
    const isPenyetoran = !isKredit && !isMisi; // Masuk (+) dari sampah

    const amountColor = isKredit ? getTextColor() : Semantic.success.main;
    const iconName = isKredit ? "ticket-percent-outline" : (isMisi ? "target" : "recycle");

    let iconBgColor = isDark ? Colors.obsidian[800] : Semantic.background.tertiary;
    let iconColor = isDark ? Colors.obsidian[300] : Colors.obsidian[400];

    if (isPenyetoran) {
      iconBgColor = isDark ? "rgba(16, 185, 129, 0.2)" : Colors.emerald[50];
      iconColor = Colors.emerald[500];
    } else if (isMisi) {
      iconBgColor = isDark ? "rgba(20, 184, 166, 0.2)" : Colors.teal[50];
      iconColor = Colors.teal[500];
    } else if (isKredit) {
      iconBgColor = isDark ? "rgba(245, 158, 11, 0.2)" : Colors.amber[50];
      iconColor = Colors.amber[500];
    }

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <AnimatedPress
          style={[styles.transactionItem, { backgroundColor: getBgColor() }]}
        >
          <View
            style={[styles.iconContainer, { backgroundColor: iconBgColor }]}
          >
            <MaterialCommunityIcons
              name={iconName}
              size={24}
              color={iconColor}
            />
          </View>

          <View style={styles.detailsContainer}>
            <Text style={[styles.titleText, { color: getTextColor() }]}>
              {item.judul || (isKredit ? "Penukaran Hadiah" : "Penyetoran Sampah")}
            </Text>
            <Text
              style={[styles.subText, { color: getMutedColor() }]}
            >
              {isMisi
                ? "Bonus Poin dari Pencapaian Misi"
                : (isKredit
                    ? `Klaim ${item.nama_hadiah || "Voucher"}`
                    : `Berhasil menyetor ${item.plastik || 0} Plastik & ${item.logam || 0} Logam`)}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end", justifyContent: 'center' }}>
            {/* Gold */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome5 
                name="coins" 
                size={11} 
                color={isKredit ? getTextColor() : Semantic.warning.main} 
                style={{ marginRight: 5 }} 
              />
              <Text style={[styles.pointsText, { color: isKredit ? getTextColor() : Semantic.warning.main }]}>
                {isKredit ? "-" : "+"}
                {item.poin.toLocaleString("id-ID")} Gold
              </Text>
            </View>

            {/* Essence */}
            {!isKredit && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <MaterialCommunityIcons 
                  name="water" 
                  size={12} 
                  color={Colors.teal[500]} 
                  style={{ marginRight: 4 }} 
                />
                <Text style={[styles.pointsText, { color: Colors.teal[500] }]}>
                  +{(item.essence !== undefined ? item.essence : item.poin).toLocaleString("id-ID")} Essence
                </Text>
              </View>
            )}
          </View>
        </AnimatedPress>
      </Animated.View>
    );
  };

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => (
    <View
      style={[styles.sectionHeaderContainer, { backgroundColor: getBgColor() }]}
    >
      <Text style={[styles.sectionHeaderText, { color: getTextColor() }]}>
        {title}
      </Text>
      <View
        style={[styles.sectionDivider, { backgroundColor: getBorderColor() }]}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: getBgColor() }]}>
      {/* Header Area */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.lg,
            backgroundColor: getBgColor(),
          },
        ]}
      >
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: getTextColor() }]}>
            Semua transaksi
          </Text>

          <View
            style={[
              styles.yearPicker,
              {
                backgroundColor: isDark
                  ? Colors.obsidian[800]
                  : Semantic.background.tertiary,
              },
            ]}
          >
            <AnimatedPress
              onPress={() => setActiveYear((y) => y - 1)}
              style={styles.yearArrow}
            >
              <Feather name="chevron-left" size={16} color={getTextColor()} />
            </AnimatedPress>
            <Text style={[styles.yearText, { color: getTextColor() }]}>
              {activeYear}
            </Text>
            <AnimatedPress
              onPress={() => setActiveYear((y) => y + 1)}
              style={styles.yearArrow}
            >
              <Feather name="chevron-right" size={16} color={getTextColor()} />
            </AnimatedPress>
          </View>
        </View>
        {renderMonthChips()}
      </View>

      {/* List Area */}
      {loading ? (
        <View
          style={[styles.listContainer, { paddingBottom: insets.bottom + 100 }]}
        >
          {[1, 2, 3, 4].map((i) => (
            <SkeletonListItem key={i} style={{ marginBottom: Spacing.md }} />
          ))}
        </View>
      ) : groupedTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <View
            style={[
              styles.emptyIconContainer,
              {
                backgroundColor: isDark
                  ? Colors.obsidian[800]
                  : Semantic.background.tertiary,
              },
            ]}
          >
            <FontAwesome
              name="calendar-times-o"
              size={48}
              color={getMutedColor()}
            />
          </View>
          <Text style={[styles.emptyStateTitle, { color: getTextColor() }]}>
            Belum Ada Aktivitas
          </Text>
          <Text style={[styles.emptyStateText, { color: getMutedColor() }]}>
            Tidak ada transaksi pada bulan {MONTHS_LONG[activeMonth]}{" "}
            {activeYear}.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={groupedTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: Spacing.sm,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.lg,
  },
  yearPicker: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  yearText: {
    fontFamily: Typography.fontFamily.interMedium,
    fontSize: Typography.size.sm,
    marginHorizontal: Spacing.md,
  },
  yearArrow: {
    padding: 4,
  },
  monthScrollContainer: {
    paddingBottom: Spacing.sm,
  },
  monthScrollContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  monthChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  monthText: {
    fontFamily: Typography.fontFamily.interMedium,
    fontSize: Typography.size.sm,
  },
  listContainer: {
    paddingHorizontal: Spacing.xl,
  },
  sectionHeaderContainer: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  sectionHeaderText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.base,
    marginBottom: Spacing.sm,
  },
  sectionDivider: {
    height: 1,
    width: "100%",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  detailsContainer: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  titleText: {
    fontFamily: Typography.fontFamily.interMedium,
    fontSize: Typography.size.sm,
    marginBottom: 4,
  },
  subText: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  pointsText: {
    fontFamily: Typography.fontFamily.interBold,
    fontSize: Typography.size.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xxxl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emptyStateTitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.xl,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.sm,
    textAlign: "center",
    lineHeight: 20,
  },
});
