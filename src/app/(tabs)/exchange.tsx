import {
  AnimConfig,
  BorderRadius,
  Colors,
  Components,
  Gradients,
  Semantic,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import { CURRENT_USER } from "@/constants/user-config";
import { AnimatedPress } from "@/components/ui/animated-press";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";

import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { db } from "../../firebaseConfig";

import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  withRepeat,
  withSpring,
  withTiming,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";

export default function ExchangeScreen() {
  const insets = useSafeAreaInsets();
  const isFocusedRef = useRef(true);
  
  const [qrToken, setQrToken] = useState("ECO-SESSION-INITIAL");
  const [timeLeft, setTimeLeft] = useState(60);

  const [showQR, setShowQR] = useState(false);
  const [statusSesi, setStatusSesi] = useState("idle");

  const [jumlahPlastik, setJumlahPlastik] = useState(0);
  const [jumlahLogam, setJumlahLogam] = useState(0);
  const [jumlahReject, setJumlahReject] = useState(0);

  const [showCelebration, setShowCelebration] = useState(false);
  const [isMesinAktif, setIsMesinAktif] = useState(true);

  // Animation Values
  const pulseOpacity = useSharedValue(0.5);
  const pulseScale = useSharedValue(1);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.5, { duration: 1000 })
      ),
      -1,
      true
    );
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));
  const pulseIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));
  
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  useFocusEffect(
    useRef(() => {
      isFocusedRef.current = true;
      return () => {
        isFocusedRef.current = false;
      };
    }).current,
  );

  useEffect(() => {
    const unsubMesin = onSnapshot(doc(db, "RVM", "status_mesin"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsMesinAktif(data.status === "aktif");
      }
    });
    return () => unsubMesin();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "Sesi_Aktif", CURRENT_USER.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status) setStatusSesi(data.status);
        if (data.botol_plastik !== undefined) setJumlahPlastik(data.botol_plastik);
        if (data.botol_logam !== undefined) setJumlahLogam(data.botol_logam);
        if (data.sampah_reject !== undefined) setJumlahReject(data.sampah_reject);
      }
    });
    return () => unsub();
  }, []);

  const generateNewToken = () => {
    const randomCode = "ECO-" + Math.floor(10000000 + Math.random() * 90000000);
    setQrToken(randomCode);
    setTimeLeft(60);
    return randomCode;
  };

  const handleManualRefresh = async () => {
    const newToken = generateNewToken();
    try {
      await setDoc(
        doc(db, "Sesi_Aktif", CURRENT_USER.id),
        { kode_sesi: newToken },
        { merge: true },
      );
    } catch (error) {
      console.error("Gagal refresh token:", error);
    }
  };

  const mulaiSesi = async () => {
    if (!isMesinAktif) return;
    const newToken = generateNewToken();
    setShowQR(true);
    try {
      await setDoc(
        doc(db, "Sesi_Aktif", CURRENT_USER.id),
        {
          kode_sesi: newToken,
          waktu_dibuat: serverTimestamp(),
          status: "menunggu_mesin",
          botol_plastik: 0,
          botol_logam: 0,
          sampah_reject: 0,
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Gagal memulai sesi:", error);
    }
  };

  const batalkanSesi = async () => {
    setShowQR(false);
    await setDoc(
      doc(db, "Sesi_Aktif", CURRENT_USER.id),
      { status: "idle" },
      { merge: true },
    );
  };

  const akhiriSesi = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowCelebration(true);
    checkScale.value = 0;
    checkScale.value = withSpring(1, AnimConfig.spring.bouncy);

    await setDoc(
      doc(db, "Sesi_Aktif", CURRENT_USER.id),
      { status: "selesai" },
      { merge: true },
    );

    setTimeout(() => {
      setShowCelebration(false);
      setShowQR(false);
      router.push("/");
    }, 3500);
  };

  useEffect(() => {
    if (!showQR || statusSesi !== "menunggu_mesin" || !isFocusedRef.current)
      return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          const randomCode = "ECO-" + Math.floor(10000000 + Math.random() * 90000000);
          setQrToken(randomCode);
          setDoc(
            doc(db, "Sesi_Aktif", CURRENT_USER.id),
            { kode_sesi: randomCode },
            { merge: true },
          );
          return 60;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showQR, statusSesi]);

  useEffect(() => {
    if (!isFocusedRef.current && showQR && statusSesi === "menunggu_mesin") {
      batalkanSesi();
    }
  }, [showQR, statusSesi]);

  const poinPlastik = jumlahPlastik * 100;
  const poinLogam = jumlahLogam * 300;
  const totalSemuaPoin = poinPlastik + poinLogam;
  const totalSemuaSampah = jumlahPlastik + jumlahLogam + jumlahReject;

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.xl }]}>
      <Modal visible={showCelebration} transparent={true} animationType="fade">
        <View style={styles.modalCelebrationBg}>
          <Animated.View entering={FadeInUp} style={styles.celebrationCard}>
            <Animated.View style={checkStyle}>
              <View style={styles.checkIconWrapper}>
                <FontAwesome name="check" size={60} color={Semantic.background.primary} />
              </View>
            </Animated.View>
            <Text style={styles.celebrationTitle}>Sesi Selesai!</Text>
            <Text style={styles.celebrationSub}>
              Pintu ditutup. Terima kasih telah mendaur ulang hari ini!
            </Text>
          </Animated.View>
        </View>
      </Modal>

      <Text style={styles.headerTitle}>Tukar Sampah</Text>

      {/* STAGE IDLE */}
      {!showQR && statusSesi !== "pintu_terbuka" && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.contentWrapper}>
          <View style={styles.statusRvmCard}>
            <View style={styles.statusHeaderRow}>
              <Text style={styles.statusTitle}>Status RVM Saat Ini</Text>
              <View style={[styles.badgeBase, isMesinAktif ? styles.badgeOnline : styles.badgeOffline]}>
                {isMesinAktif && (
                  <Animated.View style={[styles.dotIndicator, pulseStyle]} />
                )}
                {!isMesinAktif && <View style={[styles.dotIndicator, { backgroundColor: Semantic.text.muted }]} />}
                <Text style={[styles.badgeText, !isMesinAktif && styles.badgeTextOffline]}>
                  {isMesinAktif ? " AKTIF" : " NONAKTIF"}
                </Text>
              </View>
            </View>
            <Text style={styles.statusSub}>
              {isMesinAktif
                ? "Mesin siap digunakan"
                : "Mesin sedang offline / tidak terhubung"}
            </Text>
          </View>

          <AnimatedPress
            style={[styles.ctaWrapper, !isMesinAktif ? { opacity: 0.7 } : {}]}
            onPress={mulaiSesi}
            disabled={!isMesinAktif}
          >
            <LinearGradient
              colors={isMesinAktif ? Gradients.success : [Semantic.background.secondary, Semantic.background.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.promoBanner}
            >
              <View style={styles.bannerTextContainer}>
                <Text style={[styles.bannerTitle, !isMesinAktif && { color: Semantic.text.primary }]}>
                  Ayo Mulai Menukar!
                </Text>
                <Text style={[styles.bannerSubtitle, !isMesinAktif && { color: Semantic.text.secondary }]}>
                  {isMesinAktif
                    ? "Tekan di sini untuk memunculkan QR Code dan membuka pintu mesin."
                    : "Harap tunggu hingga mesin kembali online untuk menukar."}
                </Text>
              </View>
              <Animated.View style={isMesinAktif ? pulseIconStyle : undefined}>
                <FontAwesome
                  name="qrcode"
                  size={60}
                  color={isMesinAktif ? Semantic.background.primary : Semantic.text.muted}
                  style={styles.bannerIcon}
                />
              </Animated.View>
            </LinearGradient>
          </AnimatedPress>
        </Animated.View>
      )}

      {/* STAGE QR (menunggu_mesin) */}
      {showQR && statusSesi === "menunggu_mesin" && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.contentWrapper}>
          <Text style={styles.subtitle}>
            Arahkan layar HP Anda ke pemindai di mesin RVM.
          </Text>
          <GlassCard style={styles.qrCard} intensity={80}>
            <View style={styles.qrInner}>
              <QRCode
                value={qrToken}
                size={240}
                color={Semantic.text.primary}
                backgroundColor="transparent"
              />
            </View>
            <Text style={styles.tokenLabel}>Kode Sesi Sementara:</Text>
            <Text style={styles.tokenText}>{qrToken}</Text>
            
            <View style={[styles.timerPill, timeLeft <= 10 && styles.timerPillDanger]}>
              <FontAwesome
                name="clock-o"
                size={16}
                color={timeLeft <= 10 ? Semantic.background.primary : Semantic.warning.main}
              />
              <Text style={[styles.timerText, timeLeft <= 10 && { color: Semantic.background.primary }]}>
                Perbarui dalam {timeLeft}s
              </Text>
            </View>

            <View style={styles.actionRow}>
              <AnimatedPress style={styles.btnPrimary} onPress={handleManualRefresh}>
                <FontAwesome name="refresh" size={16} color={Semantic.background.primary} style={{ marginRight: 8 }} />
                <Text style={styles.btnPrimaryText}>Perbarui</Text>
              </AnimatedPress>
              <AnimatedPress style={styles.btnOutline} onPress={batalkanSesi}>
                <Text style={styles.btnOutlineText}>Batal</Text>
              </AnimatedPress>
            </View>
          </GlassCard>
        </Animated.View>
      )}

      {/* STAGE PINTU TERBUKA */}
      {statusSesi === "pintu_terbuka" && (
        <Animated.View entering={FadeInUp.duration(500)} style={styles.contentWrapper}>
          <Text style={styles.subtitle}>
            Mesin mengenali Anda. Masukkan sampah satu per satu.
          </Text>
          <View style={styles.dashCard}>
            <Animated.View style={pulseIconStyle}>
              <FontAwesome name="unlock-alt" size={48} color={Semantic.success.main} style={{ marginBottom: 10 }} />
            </Animated.View>
            <Text style={styles.doorOpenText}>Pintu Terbuka</Text>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelRow}>
                  <View style={[styles.iconBg, { backgroundColor: Colors.teal[100] }]}>
                    <MaterialCommunityIcons name="bottle-soda" size={20} color={Semantic.primary.main} />
                  </View>
                  <Text style={styles.detailLabel}>Plastik</Text>
                </View>
                <AnimatedCounter value={jumlahPlastik} suffix="x" style={styles.detailCount} />
                <AnimatedCounter value={poinPlastik} prefix="+" style={styles.detailSubtotal} />
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLabelRow}>
                  <View style={[styles.iconBg, { backgroundColor: Colors.teal[100] }]}>
                    <MaterialCommunityIcons name="package-variant" size={20} color={Semantic.primary.main} />
                  </View>
                  <Text style={styles.detailLabel}>Logam</Text>
                </View>
                <AnimatedCounter value={jumlahLogam} suffix="x" style={styles.detailCount} />
                <AnimatedCounter value={poinLogam} prefix="+" style={styles.detailSubtotal} />
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLabelRow}>
                  <View style={[styles.iconBg, { backgroundColor: Colors.red[100] }]}>
                    <MaterialCommunityIcons name="close-circle" size={20} color={Semantic.danger.main} />
                  </View>
                  <Text style={styles.detailLabel}>Ditolak</Text>
                </View>
                <AnimatedCounter value={jumlahReject} suffix="x" style={{...styles.detailCount, color: Semantic.danger.main}} />
                <Text style={[styles.detailSubtotal, { color: Semantic.danger.main }]}>0</Text>
              </View>
            </View>

            <LinearGradient
              colors={Gradients.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.totalCard}
            >
              <View>
                <Text style={styles.totalLabelWhite}>Total Item</Text>
                <AnimatedCounter value={totalSemuaSampah} style={styles.totalValueWhite} />
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.totalLabelWhite}>Grand Total Poin</Text>
                <AnimatedCounter value={totalSemuaPoin} style={styles.totalValueYellow} />
              </View>
            </LinearGradient>

            <AnimatedPress style={styles.btnDanger} onPress={akhiriSesi}>
              <FontAwesome name="check-circle" size={18} color={Semantic.background.primary} style={{ marginRight: 8 }} />
              <Text style={styles.btnPrimaryText}>Akhiri Sesi & Tutup Pintu</Text>
            </AnimatedPress>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Semantic.background.tertiary,
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  contentWrapper: {
    width: "100%",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.xxl,
    color: Semantic.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.base,
    color: Semantic.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  statusRvmCard: {
    backgroundColor: Semantic.background.primary,
    width: "100%",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Components.card.border,
    ...Shadows.sm,
  },
  statusHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  statusTitle: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.size.md,
    color: Semantic.text.primary,
  },
  badgeBase: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  badgeOnline: {
    backgroundColor: Components.iconWrapper.success.bg,
  },
  badgeOffline: {
    backgroundColor: Semantic.background.tertiary,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Semantic.success.main,
    marginRight: 4,
  },
  badgeText: {
    fontFamily: Typography.fontFamily.interBold,
    fontSize: Typography.size.xs,
    color: Semantic.success.main,
  },
  badgeTextOffline: {
    color: Semantic.text.muted,
  },
  statusSub: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.sm,
    color: Semantic.text.secondary,
  },
  ctaWrapper: {
    width: "100%",
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    ...Shadows.md,
  },
  promoBanner: {
    width: "100%",
    padding: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerTextContainer: { flex: 1, paddingRight: Spacing.lg },
  bannerTitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.lg,
    color: Semantic.background.primary,
    marginBottom: Spacing.xs,
  },
  bannerSubtitle: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.sm,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 18,
  },
  bannerIcon: { opacity: 0.9 },
  qrCard: {
    width: "100%",
    padding: Spacing.xl,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  qrInner: {
    padding: Spacing.lg,
    backgroundColor: Semantic.background.primary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Components.card.border,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  tokenLabel: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.sm,
    color: Semantic.text.muted,
    marginBottom: 4,
  },
  tokenText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.xxl,
    color: Semantic.success.main,
    letterSpacing: 2,
    marginBottom: Spacing.lg,
  },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Semantic.warning.light,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xl,
  },
  timerPillDanger: {
    backgroundColor: Semantic.danger.main,
  },
  timerText: {
    fontFamily: Typography.fontFamily.interMedium,
    fontSize: Typography.size.sm,
    color: Semantic.warning.main,
    marginLeft: Spacing.xs,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
  },
  btnPrimary: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: Semantic.success.main,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    fontFamily: Typography.fontFamily.secondary,
    color: Semantic.background.primary,
    fontSize: Typography.size.base,
  },
  btnOutline: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Semantic.danger.main,
    backgroundColor: Colors.red[50],
  },
  btnOutlineText: {
    fontFamily: Typography.fontFamily.secondary,
    color: Semantic.danger.main,
    fontSize: Typography.size.base,
  },
  dashCard: {
    backgroundColor: Semantic.background.primary,
    width: "100%",
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    ...Shadows.md,
  },
  doorOpenText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.xl,
    color: Semantic.text.primary,
    marginBottom: Spacing.xl,
  },
  detailsContainer: {
    width: "100%",
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Components.card.border,
  },
  detailLabelRow: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconBg: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  detailLabel: {
    fontFamily: Typography.fontFamily.interMedium,
    fontSize: Typography.size.sm,
    color: Semantic.text.primary,
  },
  detailCount: {
    fontFamily: Typography.fontFamily.interBold,
    flex: 1,
    fontSize: Typography.size.base,
    color: Semantic.text.primary,
    textAlign: "center",
  },
  detailSubtotal: {
    fontFamily: Typography.fontFamily.interBold,
    flex: 1,
    fontSize: Typography.size.base,
    color: Semantic.success.main,
    textAlign: "right",
  },
  totalCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  totalLabelWhite: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.xs,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 2,
  },
  totalValueWhite: {
    fontFamily: Typography.fontFamily.interBold,
    fontSize: Typography.size.xl,
    color: Semantic.background.primary,
  },
  totalValueYellow: {
    fontFamily: Typography.fontFamily.interBold,
    fontSize: Typography.size.xl,
    color: Semantic.warning.main,
  },
  btnDanger: {
    flexDirection: "row",
    backgroundColor: Semantic.danger.main,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  modalCelebrationBg: {
    flex: 1,
    backgroundColor: Components.modal.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  celebrationCard: {
    backgroundColor: Semantic.background.primary,
    width: "80%",
    padding: Spacing.xxl,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    ...Shadows.glow(Semantic.success.main),
  },
  checkIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Semantic.success.main,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  celebrationTitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.xl,
    color: Semantic.text.primary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  celebrationSub: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.sm,
    color: Semantic.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
