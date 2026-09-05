import {
  BorderRadius,
  Colors,
  Components,
  Semantic,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { AnimatedPress } from "@/components/ui/animated-press";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── Types ──────────────────────────────────────────────
interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  icon: string;
  color: string;
  unread?: boolean;
}

// ── Static Data ────────────────────────────────────────
const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Selamat Datang di EcoPoint!",
    desc: "Terima kasih sudah bergabung. Mari selamatkan bumi bersama-sama.",
    time: "Baru saja",
    icon: "leaf",
    color: Semantic.success.main,
    unread: true,
  },
  {
    id: "2",
    title: "Level Up Terbuka 🌟",
    desc: "Kumpulkan 1000 poin pertamamu untuk naik dari level Eco-Starter.",
    time: "2 jam yang lalu",
    icon: "star",
    color: Semantic.warning.main,
    unread: true,
  },
  {
    id: "3",
    title: "Mesin RVM #01 Aktif Kembali",
    desc: "Mesin penukar di Gedung A sudah online. Yuk setor sampahmu!",
    time: "5 jam yang lalu",
    icon: "recycle",
    color: Semantic.primary.main,
    unread: false,
  },
  {
    id: "4",
    title: "Promo Reward Baru! 🎁",
    desc: "Voucher GoPay Rp 25.000 kini tersedia di katalog reward.",
    time: "1 hari yang lalu",
    icon: "gift",
    color: Colors.red[400],
    unread: false,
  },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  const renderItem = ({
    item,
    index,
  }: {
    item: NotificationItem;
    index: number;
  }) => (
    <Animated.View entering={FadeInRight.delay(index * 80).springify()}>
      <AnimatedPress style={styles.card} haptic={false}>
        {/* Unread accent bar */}
        {item.unread && <View style={[styles.unreadBar, { backgroundColor: item.color }]} />}

        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: item.color + "15" },
          ]}
        >
          <FontAwesome
            name={item.icon as any}
            size={20}
            color={item.color}
          />
        </View>

        {/* Content */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            {item.unread && <View style={[styles.unreadDot, { backgroundColor: item.color }]} />}
          </View>
          <Text style={styles.desc} numberOfLines={2}>
            {item.desc}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </AnimatedPress>
    </Animated.View>
  );

  const renderEmpty = () => (
    <Animated.View
      entering={FadeInDown.delay(200).springify()}
      style={styles.emptyState}
    >
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons
          name="bell-off-outline"
          size={48}
          color={Semantic.text.muted}
        />
      </View>
      <Text style={styles.emptyTitle}>Belum Ada Notifikasi</Text>
      <Text style={styles.emptyDesc}>
        Notifikasi tentang poin masuk, promo reward, dan status mesin akan muncul
        di sini.
      </Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(300)}
        style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}
      >
        <AnimatedPress
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome
            name="arrow-left"
            size={18}
            color={Semantic.text.primary}
          />
        </AnimatedPress>
        <Text style={styles.headerTitle}>Notifikasi</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* List */}
      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Semantic.background.tertiary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Semantic.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Semantic.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Semantic.background.tertiary,
  },
  headerTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: Semantic.text.primary,
  },
  listContainer: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    backgroundColor: Semantic.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: "hidden",
    ...Shadows.sm,
  },
  unreadBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: BorderRadius.xl,
    borderBottomLeftRadius: BorderRadius.xl,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: Semantic.text.primary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  desc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Semantic.text.secondary,
    marginTop: 2,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  time: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Semantic.text.muted,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Semantic.background.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: Semantic.text.primary,
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Semantic.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
