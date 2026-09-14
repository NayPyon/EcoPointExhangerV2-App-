import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Platform,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import {
  Colors,
  Semantic,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
} from "@/constants/theme";
import { AnimatedPress } from "@/components/ui/animated-press";

import { db } from "../../firebaseConfig";
import { usePoints } from "../../PointContext";
import { useLocalSearchParams, router } from "expo-router";
import { useAuth } from "../../AuthContext";

export default function ProfileScreen() {
  const { user, userData } = useAuth();
  const { ts } = useLocalSearchParams();
  const animationKey = ts ? String(ts) : "default";
  const insets = useSafeAreaInsets();
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const getBgColor = () => isDark ? Semantic.background.dark : Semantic.background.secondary;
  const getCardBg = () => isDark ? Colors.obsidian[800] : Semantic.background.primary;
  const getTextColor = () => isDark ? Semantic.text.light : Semantic.text.primary;
  const getMutedColor = () => isDark ? Colors.obsidian[400] : Semantic.text.secondary;
  const getBorderColor = () => isDark ? Colors.obsidian[800] : Semantic.border.light;

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { totalPoin } = usePoints();

  // --- RUMUS SULAP ECO-IMPACT ---
  const p = userData?.total_plastik || 0;
  const l = userData?.total_logam || 0;

  // Emisi CO2 Terkurangi (kg)
  const co2Saved = p * 0.08 + l * 0.2;
  const totalItems = p + l;
  const streak = userData?.streak || 5;

  const MENU_ITEMS = [
    {
      id: "edit",
      icon: "user",
      title: "Edit Profil",
      onPress: () => router.push('/edit-profile'),
    },
    {
      id: "history",
      icon: "clock",
      title: "Riwayat Penukaran",
      onPress: () => router.push('/(tabs)/history'),
    },
    {
      id: "help",
      icon: "help-circle",
      title: "Pusat Bantuan",
      onPress: () => router.push('/help'),
    },
    {
      id: "logout",
      icon: "log-out",
      title: "Keluar",
      danger: true,
      onPress: () => setShowLogoutModal(true),
    },
  ];
  return (
    <View style={[styles.container, { backgroundColor: getBgColor() }]} key={animationKey}>
      {/* HEADER DECORATION */}
      <View style={[styles.headerDecor, { backgroundColor: isDark ? Colors.obsidian[950] : Colors.emerald[600] }]} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* --- KARTU PROFIL --- */}
        <Animated.View entering={FadeInDown.duration(500)} style={[styles.profileCard, { backgroundColor: getCardBg(), borderColor: getBorderColor(), borderWidth: isDark ? 1 : 0 }]}>
          <View style={[styles.avatarContainer, { backgroundColor: isDark ? Colors.obsidian[700] : Colors.emerald[100], overflow: 'hidden' }]}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text style={styles.avatarInitial}>
                {userData?.displayName?.[0]?.toUpperCase() || userData?.fullName?.[0]?.toUpperCase() || "N"}
              </Text>
            )}
          </View>
          <Text style={[styles.userName, { color: getTextColor() }]}>{(userData?.displayName || "Pengguna")}</Text>
          <Text style={[styles.userEmail, { color: getMutedColor() }]}>{user?.email || "Email"}</Text>

          <View style={styles.tierBadge}>
            <MaterialCommunityIcons name="shield-star" size={16} color={Colors.amber[500]} />
            <Text style={styles.tierText}>Eco Warrior</Text>
          </View>
        </Animated.View>

        {/* --- STATISTIK ECO-IMPACT --- */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: getCardBg(), borderColor: getBorderColor(), borderWidth: isDark ? 1 : 0 }]}>
            <Feather name="wind" size={24} color={Semantic.success.main} />
            <Text style={[styles.statValue, { color: getTextColor() }]}>{co2Saved.toFixed(1)}kg</Text>
            <Text style={[styles.statLabel, { color: getMutedColor() }]}>CO2 Dicegah</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: getCardBg(), borderColor: getBorderColor(), borderWidth: isDark ? 1 : 0 }]}>
            <Feather name="trash-2" size={24} color={Semantic.primary.main} />
            <Text style={[styles.statValue, { color: getTextColor() }]}>{totalItems}</Text>
            <Text style={[styles.statLabel, { color: getMutedColor() }]}>Item Didaur</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: getCardBg(), borderColor: getBorderColor(), borderWidth: isDark ? 1 : 0 }]}>
            <Feather name="zap" size={24} color={Colors.amber[500]} />
            <Text style={[styles.statValue, { color: getTextColor() }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: getMutedColor() }]}>Hari Beruntun</Text>
          </View>
        </Animated.View>

        {/* --- MENU NAVIGASI --- */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)} style={[styles.menuContainer, { backgroundColor: getCardBg(), borderColor: getBorderColor(), borderWidth: isDark ? 1 : 0 }]}>
          {MENU_ITEMS.map((item, index) => (
            <AnimatedPress key={item.id} style={[styles.menuItem, index !== MENU_ITEMS.length - 1 ? { borderBottomWidth: 1, borderBottomColor: getBorderColor() } : {}]} onPress={item.onPress}>
              <View style={[styles.menuIconBox, { backgroundColor: item.danger ? Colors.red[50] : (isDark ? Colors.obsidian[900] : Colors.emerald[50]) }]}>
                <Feather name={item.icon as any} size={20} color={item.danger ? Semantic.danger.main : Semantic.primary.main} />
              </View>
              <Text style={[styles.menuTitle, { color: item.danger ? Semantic.danger.main : getTextColor() }]}>{item.title}</Text>
              <Feather name="chevron-right" size={20} color={getMutedColor()} />
            </AnimatedPress>
          ))}
        </Animated.View>

        {/* --- FOOTER APP VERSION --- */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.footerContainer}>
          <Text style={styles.versionText}>EcoPoint Exchanger v2.0.0</Text>
          <Text style={styles.madeWithText}>Dibuat oleh Tim EcoPoint</Text>
        </Animated.View>
      </ScrollView>

      {/* MODAL LOGOUT */}
      {showLogoutModal && (
        <View style={StyleSheet.absoluteFill}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)' }]} />
          <Animated.View entering={FadeInDown.duration(300)} style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: getCardBg() }]}>
              <View style={[styles.modalIconBox, { backgroundColor: Colors.red[50] }]}>
                <Feather name="log-out" size={32} color={Semantic.danger.main} />
              </View>
              <Text style={[styles.modalTitle, { color: getTextColor() }]}>Keluar dari Akun?</Text>
              <Text style={[styles.modalDesc, { color: getMutedColor() }]}>
                Sesi kamu akan diakhiri. Pastikan kamu mengingat kata sandi sebelum keluar.
              </Text>
              
              <View style={styles.modalActions}>
                <AnimatedPress 
                  style={[styles.modalBtnCancel, { backgroundColor: isDark ? Colors.obsidian[700] : Colors.neutral[100] }]} 
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={[styles.modalBtnCancelText, { color: getTextColor() }]}>Batal</Text>
                </AnimatedPress>
                
                <AnimatedPress 
                  style={[styles.modalBtnConfirm, { backgroundColor: Semantic.danger.main }]}
                  onPress={async () => {
                    setShowLogoutModal(false);
                    try {
                      const { auth } = require('../../firebaseConfig');
                      await auth.signOut();
                      router.replace('/(auth)/login');
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
  headerDecor: { position: "absolute", top: 0, left: 0, right: 0, height: 200, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  scrollContent: { paddingHorizontal: Spacing.xl },
  profileCard: { borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: "center", marginBottom: Spacing.xl, ...Shadows.md },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: Spacing.md, borderWidth: 4, borderColor: "#FFFFFF" },
  avatarInitial: { fontFamily: Typography.fontFamily.primary, fontSize: 32, color: Semantic.primary.main },
  userName: { fontFamily: Typography.fontFamily.primary, fontSize: 20, marginBottom: 4 },
  userEmail: { fontFamily: Typography.fontFamily.inter, fontSize: 14, marginBottom: Spacing.md },
  tierBadge: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.amber[50], paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full },
  tierText: { fontFamily: Typography.fontFamily.medium, fontSize: 12, color: Colors.amber[700], marginLeft: 4 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: Spacing.xl },
  statBox: { flex: 1, borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: "center", marginHorizontal: 4, ...Shadows.sm },
  statValue: { fontFamily: Typography.fontFamily.primary, fontSize: 18, marginTop: Spacing.sm, marginBottom: 2 },
  statLabel: { fontFamily: Typography.fontFamily.inter, fontSize: 10, textAlign: "center" },
  menuContainer: { borderRadius: BorderRadius.xl, overflow: "hidden", marginBottom: Spacing.xxl, ...Shadows.sm },
  menuItem: { flexDirection: "row", alignItems: "center", padding: Spacing.lg },
  menuIconBox: { width: 40, height: 40, borderRadius: BorderRadius.md, justifyContent: "center", alignItems: "center", marginRight: Spacing.md },
  menuTitle: { flex: 1, fontFamily: Typography.fontFamily.medium, fontSize: 16 },
  footerContainer: { alignItems: "center", paddingBottom: 100 },
  versionText: { fontFamily: Typography.fontFamily.medium, color: Semantic.text.muted, fontSize: Typography.size.sm, marginBottom: 4 },
  madeWithText: { fontFamily: Typography.fontFamily.inter, color: Semantic.text.muted, fontSize: Typography.size.xs },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xl },
  modalContent: { width: "100%", borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: "center", ...Shadows.lg },
  modalIconBox: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", marginBottom: Spacing.lg },
  modalTitle: { fontFamily: Typography.fontFamily.primary, fontSize: 20, marginBottom: Spacing.sm },
  modalDesc: { fontFamily: Typography.fontFamily.inter, fontSize: 14, textAlign: "center", marginBottom: Spacing.xl, lineHeight: 20 },
  modalActions: { flexDirection: "row", gap: Spacing.md, width: "100%" },
  modalBtnCancel: { flex: 1, paddingVertical: 14, borderRadius: BorderRadius.md, alignItems: "center" },
  modalBtnCancelText: { fontFamily: Typography.fontFamily.medium, fontSize: 14 },
  modalBtnConfirm: { flex: 1, paddingVertical: 14, borderRadius: BorderRadius.md, alignItems: "center" },
  modalBtnConfirmText: { fontFamily: Typography.fontFamily.medium, fontSize: 14, color: "#FFF" },
});
