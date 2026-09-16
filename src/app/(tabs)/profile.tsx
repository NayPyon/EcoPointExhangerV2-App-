import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from "react-native";
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { AnimatedPress } from "@/components/ui/animated-press";
import {
  BorderRadius,
  Colors,
  Semantic,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";

import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../AuthContext";
import { usePoints } from "../../PointContext";

export default function ProfileScreen() {
  const { user, userData } = useAuth();
  const { ts } = useLocalSearchParams();
  const animationKey = ts ? String(ts) : "default";
  const insets = useSafeAreaInsets();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const getBgColor = () =>
    isDark ? Semantic.background.dark : Semantic.background.secondary;
  const getCardBg = () =>
    isDark ? Colors.obsidian[800] : Semantic.background.primary;
  const getTextColor = () =>
    isDark ? Semantic.text.light : Semantic.text.primary;
  const getMutedColor = () =>
    isDark ? Colors.obsidian[400] : Semantic.text.secondary;
  const getBorderColor = () =>
    isDark ? Colors.obsidian[800] : Semantic.border.light;

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { totalPoin, totalPlastik, totalLogam, hariKonsisten } = usePoints();

  // --- RUMUS SULAP ECO-IMPACT ---
  const p = totalPlastik || 0;
  const l = totalLogam || 0;

  // Emisi CO2 Terkurangi (kg) - Disinkronkan dengan index.tsx
  const co2Saved = p * 0.05 + l * 0.1;
  const totalItems = p + l;
  const streak = hariKonsisten || 0;

  const getLevelName = () => {
    if (totalPoin >= 50000) return "Radiant Recycler ✨";
    if (totalPoin >= 25000) return "Elderwood Guardian 🛡️";
    if (totalPoin >= 10000) return "Sylvan Sapling 🌳";
    if (totalPoin >= 2500) return "Verdant Sprout 🌿";
    return "Pebble Seed 🌱";
  };

  const blob1X = useSharedValue(0);
  const blob2X = useSharedValue(0);

  useEffect(() => {
    blob1X.value = withRepeat(
      withTiming(60, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    blob2X.value = withRepeat(
      withTiming(-60, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [blob1X, blob2X]);

  const animatedBlob1 = useAnimatedStyle(() => ({
    transform: [{ translateX: blob1X.value }, { scale: 1.5 }],
  }));
  const animatedBlob2 = useAnimatedStyle(() => ({
    transform: [{ translateX: blob2X.value }, { scale: 1.5 }],
  }));

  // Border pulsing animation for the profile card
  const borderPulse = useSharedValue(0);
  useEffect(() => {
    borderPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [borderPulse]);

  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      borderColor: isDark 
        ? `rgba(16, 185, 129, ${0.2 + borderPulse.value * 0.4})` // emerald glow in dark mode
        : `rgba(16, 185, 129, ${0.4 + borderPulse.value * 0.4})`, // emerald glow in light mode
      shadowOpacity: 0.1 + borderPulse.value * 0.15,
      shadowRadius: 10 + borderPulse.value * 10,
      elevation: 5 + borderPulse.value * 5,
    };
  });

  const MENU_ITEMS = [
    {
      id: "edit",
      icon: "user",
      title: "Edit Profil",
      onPress: () => router.push("/edit-profile"),
    },
    {
      id: "history",
      icon: "clock",
      title: "Riwayat Penukaran",
      onPress: () => router.push("/(tabs)/history"),
    },
    {
      id: "theme",
      icon: "moon",
      title: "Ubah Tema (Terang/Gelap)",
      onPress: () => {
        const { Appearance } = require('react-native');
        const current = Appearance.getColorScheme();
        Appearance.setColorScheme(current === 'dark' ? 'light' : 'dark');
      },
    },
    {
      id: "help",
      icon: "help-circle",
      title: "Pusat Bantuan",
      onPress: () => router.push("/help"),
    },
    // TOMBOL RAHASIA ADMIN
    ...(userData?.role === "admin" || userData?.Role === "admin"
      ? [
          {
            id: "admin_panel",
            icon: "shield",
            title: "Panel Admin (RVM & Voucher)",
            onPress: () => router.push("/admin-panel"), // Halaman ini akan kita buat nanti
          },
        ]
      : []),
    {
      id: "logout",
      icon: "log-out",
      title: "Keluar",
      danger: true,
      onPress: () => setShowLogoutModal(true),
    },
  ];
  return (
    <View
      style={[styles.container, { backgroundColor: getBgColor() }]}
      key={animationKey}
    >
      {/* HEADER DECORATION (AURORA) */}
      <View
        style={[
          styles.headerDecor,
          {
            backgroundColor: isDark
              ? Colors.obsidian[950]
              : Colors.emerald[600],
            overflow: "hidden",
          },
        ]}
      >
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: 0.9 }, animatedBlob1]}
        >
          <LinearGradient
            colors={[
              isDark ? "rgba(16, 185, 129, 0.4)" : "rgba(52, 211, 153, 0.5)",
              "transparent",
            ]}
            style={{
              position: "absolute",
              width: 250,
              height: 250,
              top: -50,
              left: -50,
              borderRadius: 125,
            }}
          />
        </Animated.View>
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: 0.9 }, animatedBlob2]}
        >
          <LinearGradient
            colors={[
              isDark ? "rgba(245, 158, 11, 0.3)" : "rgba(245, 158, 11, 0.4)",
              "transparent",
            ]}
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              bottom: -50,
              right: -50,
              borderRadius: 100,
            }}
          />
        </Animated.View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* --- KARTU PROFIL --- */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={[
            styles.profileCard,
            {
              backgroundColor: getCardBg(),
              borderWidth: 2,
            },
            animatedBorderStyle,
          ]}
        >
          <View
            style={[
              styles.avatarContainer,
              {
                backgroundColor: isDark
                  ? Colors.obsidian[700]
                  : Colors.emerald[100],
                overflow: "hidden",
              },
            ]}
          >
            {user?.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <Text style={styles.avatarInitial}>
                {userData?.displayName?.[0]?.toUpperCase() ||
                  userData?.fullName?.[0]?.toUpperCase() ||
                  "N"}
              </Text>
            )}
          </View>
          <Text style={[styles.userName, { color: getTextColor() }]}>
            {userData?.displayName || "Pengguna"}
          </Text>
          <Text style={[styles.userEmail, { color: getMutedColor() }]}>
            {user?.email || "Email"}
          </Text>

          <View style={styles.tierBadge}>
            <MaterialCommunityIcons
              name="shield-star"
              size={16}
              color={Colors.amber[500]}
            />
            <Text style={styles.tierText}>{getLevelName()}</Text>
          </View>
        </Animated.View>

        {/* --- STATISTIK ECO-IMPACT --- */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(500)}
          style={styles.statsContainer}
        >
          <View
            style={[
              styles.statBox,
              {
                backgroundColor: getCardBg(),
                borderColor: getBorderColor(),
                borderWidth: isDark ? 1 : 0,
              },
            ]}
          >
            <Feather name="wind" size={24} color={Semantic.success.main} />
            <Text style={[styles.statValue, { color: getTextColor() }]}>
              {co2Saved.toFixed(2)}kg
            </Text>
            <Text style={[styles.statLabel, { color: getMutedColor() }]}>
              CO2 Dicegah
            </Text>
          </View>
          <View
            style={[
              styles.statBox,
              {
                backgroundColor: getCardBg(),
                borderColor: getBorderColor(),
                borderWidth: isDark ? 1 : 0,
              },
            ]}
          >
            <Feather name="trash-2" size={24} color={Semantic.primary.main} />
            <Text style={[styles.statValue, { color: getTextColor() }]}>
              {totalItems}
            </Text>
            <Text style={[styles.statLabel, { color: getMutedColor() }]}>
              Item Didaur
            </Text>
          </View>
          <View
            style={[
              styles.statBox,
              {
                backgroundColor: getCardBg(),
                borderColor: getBorderColor(),
                borderWidth: isDark ? 1 : 0,
              },
            ]}
          >
            <Feather name="zap" size={24} color={Colors.amber[500]} />
            <Text style={[styles.statValue, { color: getTextColor() }]}>
              {streak}
            </Text>
            <Text style={[styles.statLabel, { color: getMutedColor() }]}>
              Hari Beruntun
            </Text>
          </View>
        </Animated.View>

        {/* --- MENU NAVIGASI --- */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(500)}
          style={[
            styles.menuContainer,
            {
              backgroundColor: getCardBg(),
              borderColor: getBorderColor(),
              borderWidth: isDark ? 1 : 0,
            },
          ]}
        >
          {MENU_ITEMS.map((item, index) => (
            <AnimatedPress
              key={item.id}
              style={[
                styles.menuItem,
                index !== MENU_ITEMS.length - 1
                  ? {
                      borderBottomWidth: 1,
                      borderBottomColor: getBorderColor(),
                    }
                  : {},
              ]}
              onPress={item.onPress}
            >
              <View
                style={[
                  styles.menuIconBox,
                  {
                    backgroundColor: item.danger
                      ? Colors.red[50]
                      : isDark
                        ? Colors.obsidian[900]
                        : Colors.emerald[50],
                  },
                ]}
              >
                <Feather
                  name={item.icon as any}
                  size={20}
                  color={
                    item.danger ? Semantic.danger.main : Semantic.primary.main
                  }
                />
              </View>
              <Text
                style={[
                  styles.menuTitle,
                  {
                    color: item.danger ? Semantic.danger.main : getTextColor(),
                  },
                ]}
              >
                {item.title}
              </Text>
              <Feather name="chevron-right" size={20} color={getMutedColor()} />
            </AnimatedPress>
          ))}
        </Animated.View>

        {/* --- FOOTER APP VERSION --- */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.footerContainer}
        >
          <Text style={styles.versionText}>EcoPoint Exchanger v2.0.0</Text>
          <Text style={styles.madeWithText}>Dibuat oleh Tim EcoPoint</Text>
        </Animated.View>
      </ScrollView>

      {/* MODAL LOGOUT */}
      {showLogoutModal && (
        <View style={StyleSheet.absoluteFill}>
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.4)",
              },
            ]}
          />
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={styles.modalOverlay}
          >
            <View
              style={[styles.modalContent, { backgroundColor: getCardBg() }]}
            >
              <View
                style={[
                  styles.modalIconBox,
                  { backgroundColor: Colors.red[50] },
                ]}
              >
                <Feather
                  name="log-out"
                  size={32}
                  color={Semantic.danger.main}
                />
              </View>
              <Text style={[styles.modalTitle, { color: getTextColor() }]}>
                Keluar dari Akun?
              </Text>
              <Text style={[styles.modalDesc, { color: getMutedColor() }]}>
                Sesi kamu akan diakhiri. Pastikan kamu mengingat kata sandi
                sebelum keluar.
              </Text>

              <View style={styles.modalActions}>
                <AnimatedPress
                  style={[
                    styles.modalBtnCancel,
                    {
                      backgroundColor: isDark
                        ? Colors.obsidian[700]
                        : Colors.neutral[100],
                    },
                  ]}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text
                    style={[
                      styles.modalBtnCancelText,
                      { color: getTextColor() },
                    ]}
                  >
                    Batal
                  </Text>
                </AnimatedPress>

                <AnimatedPress
                  style={[
                    styles.modalBtnConfirm,
                    { backgroundColor: Semantic.danger.main },
                  ]}
                  onPress={async () => {
                    setShowLogoutModal(false);
                    try {
                      const { auth } = require("../../firebaseConfig");
                      await auth.signOut();
                      router.replace("/(auth)/login");
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                >
                  <Text style={styles.modalBtnConfirmText}>Ya, Keluar</Text>
                </AnimatedPress>
              </View>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerDecor: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  scrollContent: { paddingHorizontal: Spacing.xl },
  profileCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  avatarInitial: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: 32,
    color: Semantic.primary.main,
  },
  userName: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: 20,
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.amber[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  tierText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: Colors.amber[700],
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  statBox: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
    marginHorizontal: 4,
    ...Shadows.sm,
  },
  statValue: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: 18,
    marginTop: Spacing.sm,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: 10,
    textAlign: "center",
  },
  menuContainer: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    marginBottom: Spacing.xxl,
    ...Shadows.sm,
  },
  menuItem: { flexDirection: "row", alignItems: "center", padding: Spacing.lg },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  menuTitle: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 16,
  },
  footerContainer: { alignItems: "center", paddingBottom: 100 },
  versionText: {
    fontFamily: Typography.fontFamily.medium,
    color: Semantic.text.muted,
    fontSize: Typography.size.sm,
    marginBottom: 4,
  },
  madeWithText: {
    fontFamily: Typography.fontFamily.inter,
    color: Semantic.text.muted,
    fontSize: Typography.size.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    ...Shadows.lg,
  },
  modalIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: 20,
    marginBottom: Spacing.sm,
  },
  modalDesc: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: 14,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  modalActions: { flexDirection: "row", gap: Spacing.md, width: "100%" },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  modalBtnCancelText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
  },
  modalBtnConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  modalBtnConfirmText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: "#FFF",
  },
});

