import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { doc, onSnapshot } from "firebase/firestore";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { FontAwesome, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import {
  Colors,
  Semantic,
  Components,
  Typography,
  Shadows,
  BorderRadius,
  AnimConfig,
  Gradients,
  Spacing,
} from "@/constants/theme";
import { CURRENT_USER } from "@/constants/user-config";
import { AnimatedPress } from "@/components/ui/animated-press";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { GradientHeader } from "@/components/ui/gradient-header";

import { db } from "../../firebaseConfig";
import { usePoints } from "../../PointContext";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState<any>({
    total_plastik: 0,
    total_logam: 0,
    streak: 0,
  });

  const { totalPoin } = usePoints();

  // MATA-MATA FIREBASE: Mendengarkan Brankas Utama
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "Users", CURRENT_USER.id), (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  // --- RUMUS SULAP ECO-IMPACT ---
  const p = userData.total_plastik || 0;
  const l = userData.total_logam || 0;

  // Emisi CO2 Terkurangi (kg)
  const co2Saved = p * 0.08 + l * 0.2;
  const totalItems = p + l;
  const streak = userData.streak || 5; // Default demo streak jika tidak ada di DB

  // Logika Gamifikasi: Cek Rank Saat Ini
  const getLevelName = () => {
    if (totalPoin >= 50000) return "Radiant Recycler ✨";
    if (totalPoin >= 25000) return "Elderwood Guardian 🛡️";
    if (totalPoin >= 10000) return "Sylvan Sapling 🌳";
    if (totalPoin >= 2500) return "Verdant Sprout 🌿";
    return "Pebble Seed 🌱";
  };

  const MENU_ITEMS = [
    { id: "edit", icon: "user", label: "Edit Profil" },
    { id: "history", icon: "clock", label: "Riwayat Penukaran" },
    { id: "help", icon: "help-circle", label: "Pusat Bantuan" },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      bounces={false}
    >
      {/* HEADER PROFIL */}
      <GradientHeader extraPaddingBottom={40}>
        <Animated.View
          entering={FadeInDown.duration(AnimConfig.duration.normal)}
          style={styles.headerContent}
        >
          <LinearGradient
            colors={[Colors.teal[200], Semantic.success.main]}
            style={styles.avatarRing}
          >
            <View style={styles.avatarInner}>
              <FontAwesome name="leaf" size={48} color={Semantic.success.main} />
            </View>
          </LinearGradient>
          <Text style={styles.userName}>{CURRENT_USER.displayName}</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{getLevelName()}</Text>
          </View>
        </Animated.View>
      </GradientHeader>

      <View style={styles.bodyContainer}>
        {/* JUDUL BAGIAN DAMPAK */}
        <Animated.View entering={FadeInUp.delay(100).duration(AnimConfig.duration.normal)}>
          <Text style={styles.sectionTitle}>Dampak Lingkunganmu</Text>
          <Text style={styles.sectionSubtitle}>
            Kontribusimu sangat berarti bagi bumi!
          </Text>
        </Animated.View>

        {/* KARTU DAMPAK LINGKUNGAN MINI */}
        <View style={styles.statsRow}>
          {/* Kartu 1: Karbon */}
          <Animated.View
            entering={FadeInUp.delay(150).springify()}
            style={styles.statCard}
          >
            <View
              style={[
                styles.statIconBox,
                { backgroundColor: Components.iconWrapper.success.bg },
              ]}
            >
              <MaterialCommunityIcons
                name="molecule-co2"
                size={28}
                color={Semantic.success.main}
              />
            </View>
            <AnimatedCounter value={co2Saved} style={styles.statValue} />
            <Text style={styles.statLabel}>CO2 Hemat</Text>
          </Animated.View>

          {/* Kartu 2: Item */}
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            style={styles.statCard}
          >
            <View
              style={[
                styles.statIconBox,
                { backgroundColor: Components.iconWrapper.primary.bg },
              ]}
            >
              <MaterialCommunityIcons
                name="recycle"
                size={28}
                color={Semantic.primary.main}
              />
            </View>
            <AnimatedCounter value={totalItems} style={styles.statValue} />
            <Text style={styles.statLabel}>Total Item</Text>
          </Animated.View>

          {/* Kartu 3: Streak */}
          <Animated.View
            entering={FadeInUp.delay(250).springify()}
            style={styles.statCard}
          >
            <View
              style={[
                styles.statIconBox,
                { backgroundColor: Components.iconWrapper.warning.bg },
              ]}
            >
              <MaterialCommunityIcons
                name="fire"
                size={28}
                color={Components.iconWrapper.warning.color}
              />
            </View>
            <AnimatedCounter value={streak} style={styles.statValue} />
            <Text style={styles.statLabel}>Hari Beruntun</Text>
          </Animated.View>
        </View>

        {/* TOMBOL PENGATURAN & BANTUAN */}
        <Animated.View entering={FadeInUp.delay(350).springify()}>
          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item, index) => (
              <React.Fragment key={item.id}>
                <AnimatedPress style={styles.menuItem}>
                  <View style={styles.menuIconWrapper}>
                    <Feather name={item.icon as any} size={20} color={Semantic.primary.main} />
                  </View>
                  <Text style={styles.menuText}>{item.label}</Text>
                  <Feather name="chevron-right" size={20} color={Semantic.text.muted} />
                </AnimatedPress>
                {index < MENU_ITEMS.length - 1 && <View style={styles.menuDivider} />}
              </React.Fragment>
            ))}
          </View>
        </Animated.View>

        {/* FOOTER */}
        <Animated.View entering={FadeInUp.delay(450).springify()} style={styles.footer}>
          <Text style={styles.versionText}>EcoPoint App v2.0.0</Text>
          <Text style={styles.madeWithText}>Made with 💚 for IoT Competition</Text>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Semantic.background.secondary,
  },
  headerContent: {
    alignItems: "center",
    paddingTop: Spacing.xl,
  },
  avatarRing: {
    width: 108,
    height: 108,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
    padding: 4,
  },
  avatarInner: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.xl,
    color: Colors.neutral[0],
    marginBottom: Spacing.xs,
  },
  badgeContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  badgeText: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.size.sm,
    color: Colors.neutral[0],
  },
  bodyContainer: {
    paddingHorizontal: Spacing.lg,
    marginTop: -20,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.lg,
    color: Semantic.text.primary,
  },
  sectionSubtitle: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.base,
    color: Semantic.text.secondary,
    marginTop: Spacing.half,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Semantic.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
    marginHorizontal: Spacing.xs,
    ...Shadows.sm,
  },
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontFamily: Typography.fontFamily.interBold,
    fontSize: Typography.size.lg,
    color: Semantic.text.primary,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.xs,
    color: Semantic.text.secondary,
    marginTop: Spacing.half,
    textAlign: "center",
  },
  menuCard: {
    backgroundColor: Semantic.background.primary,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  menuIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Semantic.primary.light,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  menuText: {
    fontFamily: Typography.fontFamily.interMedium,
    flex: 1,
    fontSize: Typography.size.base,
    color: Semantic.text.primary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Semantic.border.light,
    marginLeft: 76,
  },
  footer: {
    marginTop: Spacing.xxxl,
    alignItems: "center",
  },
  versionText: {
    fontFamily: Typography.fontFamily.interMedium,
    color: Semantic.text.muted,
    fontSize: Typography.size.base,
    marginBottom: Spacing.xs,
  },
  madeWithText: {
    fontFamily: Typography.fontFamily.inter,
    color: Semantic.text.secondary,
    fontSize: Typography.size.sm,
  },
});
