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
import { useAuth } from "../../AuthContext";
import { AnimatedPress } from "@/components/ui/animated-press";
import { AnimatedCounter } from "@/components/ui/animated-counter";

import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { doc, onSnapshot, serverTimestamp, setDoc, addDoc, collection } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  Linking,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { db } from "../../firebaseConfig";
import { BlurView } from "expo-blur";

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
} from "react-native-reanimated";

export default function ExchangeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
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

  const getBgColor = () => isDark ? Semantic.background.dark : Semantic.background.secondary;
  const getCardBg = () => isDark ? Colors.obsidian[800] : "#FFFFFF";
  const getTextColor = () => isDark ? "#FFFFFF" : Colors.obsidian[900];
  const getMutedColor = () => isDark ? Colors.obsidian[400] : Colors.obsidian[500];

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
        withTiming(1.05, { duration: 1500 }),
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
    const unsub = onSnapshot(doc(db, "Sesi_Aktif", user!.uid), (docSnap) => {
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
        doc(db, "Sesi_Aktif", user!.uid),
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
        doc(db, "Sesi_Aktif", user!.uid),
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
      doc(db, "Sesi_Aktif", user!.uid),
      { status: "idle" },
      { merge: true },
    );
  };

  const akhiriSesi = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowCelebration(true);
    checkScale.value = 0;
    checkScale.value = withTiming(1, { duration: 300 });

    if (totalSemuaPoin > 0) {
      try {
        await addDoc(collection(db, "Riwayat"), {
          user: user!.uid,
          tipe: "penyetoran",
          plastik: jumlahPlastik,
          logam: jumlahLogam,
          poin: totalSemuaPoin,
          tanggal: serverTimestamp(),
        });

        await addDoc(collection(db, "Notifications"), {
          user: user!.uid,
          title: "Penyetoran Berhasil",
          desc: `Berhasil menyetor ${jumlahPlastik} plastik & ${jumlahLogam} logam. Kamu mendapatkan +${totalSemuaPoin} Poin.`,
          type: "penyetoran",
          icon: "recycle",
          color_type: "primary",
          unread: true,
          time: serverTimestamp(),
        });
      } catch (e) {
        console.error(e);
      }
    }

    await setDoc(
      doc(db, "Sesi_Aktif", user!.uid),
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
            doc(db, "Sesi_Aktif", user!.uid),
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
    <View style={[styles.container, { backgroundColor: getBgColor(), paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + 82 }]}>
      
      {/* Background Blobs for ambiance */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
         <View style={[styles.blob, { top: -100, right: -100, backgroundColor: isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)' }]} />
         <View style={[styles.blob, { bottom: 100, left: -100, backgroundColor: isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.25)' }]} />
      </View>

      <Modal visible={showCelebration} transparent={true} animationType="fade">
        <BlurView intensity={isDark ? 50 : 80} tint={isDark ? "dark" : "light"} style={styles.modalCelebrationBg}>
          <Animated.View entering={FadeInUp} style={[styles.celebrationCard, { backgroundColor: getCardBg() }]}>
            <Animated.View style={checkStyle}>
              <View style={styles.checkIconWrapper}>
                <FontAwesome name="check" size={50} color="#FFFFFF" />
              </View>
            </Animated.View>
            <Text style={[styles.celebrationTitle, { color: getTextColor() }]}>Transaksi Berhasil!</Text>
            
            <View style={{ marginVertical: Spacing.xl, alignItems: 'center' }}>
               <Text style={{ fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: getMutedColor() }}>Poin Didapatkan</Text>
               <Text style={{ fontFamily: Typography.fontFamily.primary, fontSize: 36, color: Semantic.warning.main, marginVertical: 4 }}>
                 +{totalSemuaPoin}
               </Text>
               <Text style={{ fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: Semantic.success.main }}>
                 {totalSemuaSampah - jumlahReject} Item Berhasil Didaur Ulang
               </Text>
            </View>

            <Text style={[styles.celebrationSub, { color: getMutedColor() }]}>
              Mesin telah ditutup. Terima kasih sudah mengambil peran nyata untuk bumi hari ini!
            </Text>
          </Animated.View>
        </BlurView>
      </Modal>

      <Text style={[styles.headerTitle, { color: getTextColor() }]}>Tukar Sampah</Text>

      {/* STAGE IDLE */}
      {!showQR && statusSesi !== "pintu_terbuka" && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.contentWrapper}>
          
          <View style={[styles.bentoCard, { backgroundColor: getCardBg(), marginBottom: Spacing.xl }]}>
            <View style={styles.statusHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                 <View style={[styles.iconCircle, { backgroundColor: isMesinAktif ? Colors.emerald[50] : Colors.red[50] }]}>
                   <MaterialCommunityIcons name="recycle-variant" size={24} color={isMesinAktif ? Semantic.success.main : Semantic.danger.main} />
                 </View>
                 <View style={{ marginLeft: Spacing.md, flex: 1 }}>
                    <Text style={[styles.bentoLabel, { color: getMutedColor() }]}>RVM Terdekat</Text>
                    <Text style={[styles.statusTitle, { color: getTextColor(), marginBottom: 4 }]}>
                      EcoRVM - Margonda
                    </Text>
                    <Text style={{ fontFamily: Typography.fontFamily.inter, fontSize: 13, color: getMutedColor(), lineHeight: 18 }}>
                      Jl. Margonda Raya No.1, Depok
                    </Text>
                 </View>
              </View>
            </View>
            
            <View style={styles.statusIndicatorRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Animated.View style={[styles.dotIndicator, isMesinAktif && pulseStyle, { backgroundColor: isMesinAktif ? Semantic.success.main : Semantic.danger.main }]} />
                  <Text style={{ fontFamily: Typography.fontFamily.medium, fontSize: 13, color: isMesinAktif ? Semantic.success.main : Semantic.danger.main }}>
                    {isMesinAktif ? "Status: Tersedia" : "Offline"}
                  </Text>
                  
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: getMutedColor(), marginHorizontal: 8 }} />
                  <FontAwesome name="map-marker" size={12} color={getMutedColor()} />
                  <Text style={{ fontFamily: Typography.fontFamily.medium, fontSize: 13, color: getMutedColor(), marginLeft: 4 }}>1.2 km</Text>
                </View>
                
                <AnimatedPress 
                  style={styles.routeButton} 
                  onPress={() => {
                     // Coordinate placeholder for RVM Margonda
                     const lat = -6.373111; 
                     const lng = 106.834460;
                     Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
                  }}
                >
                   <FontAwesome name="location-arrow" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                   <Text style={styles.routeButtonText}>Rute</Text>
                </AnimatedPress>
            </View>
          </View>

          <AnimatedPress
            style={[styles.ctaWrapper, !isMesinAktif ? { opacity: 0.6 } : {}]}
            onPress={mulaiSesi}
            disabled={!isMesinAktif}
          >
            <LinearGradient
              colors={isMesinAktif ? Gradients.success : [isDark ? Colors.obsidian[800] : Colors.neutral[200], isDark ? Colors.obsidian[800] : Colors.neutral[200]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.promoBanner}
            >
              <View style={styles.bannerTextContainer}>
                <Text style={[styles.bannerTitle, !isMesinAktif && { color: getTextColor() }]}>
                  Buka Pintu RVM
                </Text>
                <Text style={[styles.bannerSubtitle, !isMesinAktif && { color: getMutedColor() }]}>
                  {isMesinAktif
                    ? "Tekan untuk memunculkan QR Code pemindaian."
                    : "Tidak dapat menukar saat mesin offline."}
                </Text>
              </View>
              <Animated.View style={isMesinAktif ? pulseIconStyle : undefined}>
                <View style={[styles.iconCircleLg, { backgroundColor: isMesinAktif ? "rgba(255,255,255,0.2)" : (isDark ? Colors.obsidian[700] : Colors.neutral[300]) }]}>
                  <FontAwesome
                    name="qrcode"
                    size={40}
                    color={isMesinAktif ? "#FFFFFF" : getMutedColor()}
                  />
                </View>
              </Animated.View>
            </LinearGradient>
          </AnimatedPress>
        </Animated.View>
      )}

      {/* STAGE QR (menunggu_mesin) */}
      {showQR && statusSesi === "menunggu_mesin" && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.contentWrapper}>
          <Text style={[styles.subtitle, { color: getMutedColor() }]}>
            Arahkan layar HP Anda ke pemindai di mesin RVM.
          </Text>
          <View style={[styles.bentoCard, { backgroundColor: getCardBg(), alignItems: 'center', padding: Spacing.xxl }]}>
            <View style={[styles.qrInner, { backgroundColor: "#FFFFFF", borderColor: "#FFFFFF" }]}>
              <QRCode
                value={qrToken}
                size={220}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            </View>
            
            <Text style={[styles.bentoLabel, { color: getMutedColor(), marginTop: Spacing.lg }]}>Kode Sesi</Text>
            <Text style={[styles.tokenText, { color: getTextColor() }]}>{qrToken}</Text>
            
            <View style={[styles.timerPill, timeLeft <= 10 && styles.timerPillDanger]}>
              <FontAwesome
                name="clock-o"
                size={16}
                color={timeLeft <= 10 ? "#FFFFFF" : Semantic.warning.main}
              />
              <Text style={[styles.timerText, timeLeft <= 10 && { color: "#FFFFFF" }]}>
                Perbarui dalam {timeLeft}s
              </Text>
            </View>

            <View style={styles.actionRow}>
              <AnimatedPress style={styles.btnPrimary} onPress={handleManualRefresh}>
                <FontAwesome name="refresh" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.btnPrimaryText}>Segarkan</Text>
              </AnimatedPress>
              <AnimatedPress style={[styles.btnOutline, { borderColor: isDark ? Colors.obsidian[700] : Colors.neutral[200] }]} onPress={batalkanSesi}>
                <Text style={[styles.btnOutlineText, { color: getTextColor() }]}>Batal</Text>
              </AnimatedPress>
            </View>
          </View>
        </Animated.View>
      )}

      {/* STAGE PINTU TERBUKA */}
      {statusSesi === "pintu_terbuka" && (
        <Animated.View entering={FadeInUp.duration(500)} style={styles.contentWrapper}>
          <Text style={[styles.subtitle, { color: getMutedColor() }]}>
            Mesin terbuka. Masukkan sampah Anda perlahan.
          </Text>
          
          <View style={[styles.bentoCard, { backgroundColor: getCardBg(), padding: Spacing.xl, width: '100%', alignItems: 'center' }]}>
            <Animated.View style={pulseIconStyle}>
               <View style={[styles.iconCircleLg, { backgroundColor: Colors.emerald[50], marginBottom: Spacing.md }]}>
                  <FontAwesome name="unlock-alt" size={40} color={Semantic.success.main} />
               </View>
            </Animated.View>
            <Text style={[styles.doorOpenText, { color: getTextColor() }]}>Memindai Item...</Text>

            {/* Grid for Items */}
            <View style={styles.statsRow}>
              <View style={[styles.bentoBoxSmall, { backgroundColor: isDark ? Colors.obsidian[950] : Colors.neutral[50] }]}>
                <Text style={[styles.bentoBoxLabel, { color: getMutedColor() }]}>Plastik</Text>
                <AnimatedCounter value={jumlahPlastik} style={[styles.bentoBoxValue, { color: Semantic.primary.main }]} />
                <Text style={{ fontFamily: Typography.fontFamily.medium, fontSize: 12, color: Semantic.primary.main }}>+{poinPlastik} pts</Text>
              </View>

              <View style={[styles.bentoBoxSmall, { backgroundColor: isDark ? Colors.obsidian[950] : Colors.neutral[50] }]}>
                <Text style={[styles.bentoBoxLabel, { color: getMutedColor() }]}>Logam</Text>
                <AnimatedCounter value={jumlahLogam} style={[styles.bentoBoxValue, { color: Semantic.warning.main }]} />
                <Text style={{ fontFamily: Typography.fontFamily.medium, fontSize: 12, color: Semantic.warning.main }}>+{poinLogam} pts</Text>
              </View>

              <View style={[styles.bentoBoxSmall, { backgroundColor: isDark ? Colors.obsidian[950] : Colors.neutral[50] }]}>
                <Text style={[styles.bentoBoxLabel, { color: getMutedColor() }]}>Ditolak</Text>
                <AnimatedCounter value={jumlahReject} style={[styles.bentoBoxValue, { color: Semantic.danger.main }]} />
                <Text style={{ fontFamily: Typography.fontFamily.medium, fontSize: 12, color: Semantic.danger.main }}>0 pts</Text>
              </View>
            </View>

            <View style={{ height: Spacing.xl }} />

            <LinearGradient
              colors={isDark ? [Colors.obsidian[800], Colors.obsidian[950]] : Gradients.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.totalCard}
            >
              <View>
                <Text style={styles.totalLabelWhite}>Total Poin</Text>
                <AnimatedCounter value={totalSemuaPoin} style={styles.totalValueYellow} />
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.totalLabelWhite}>Item Diterima</Text>
                <AnimatedCounter value={totalSemuaSampah - jumlahReject} style={styles.totalValueWhite} />
              </View>
            </LinearGradient>

            <AnimatedPress style={styles.btnDanger} onPress={akhiriSesi}>
              <FontAwesome name="check-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.btnPrimaryText}>Tutup Pintu & Selesai</Text>
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  blob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    filter: 'blur(60px)',
  },
  contentWrapper: {
    width: "100%",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.xxl,
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.base,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  bentoCard: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleLg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    marginBottom: 4,
  },
  statusHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.1)'
  },
  statusTitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.lg,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  routeButton: {
    backgroundColor: Semantic.primary.main,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeButtonText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: '#FFFFFF',
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
  bannerTextContainer: { flex: 1, paddingRight: Spacing.md },
  bannerTitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.xl,
    color: "#FFFFFF",
    marginBottom: Spacing.xs,
  },
  bannerSubtitle: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.sm,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
  },
  qrInner: {
    padding: Spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  tokenText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.xxl,
    letterSpacing: 2,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
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
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    fontFamily: Typography.fontFamily.secondary,
    color: "#FFFFFF",
    fontSize: Typography.size.base,
  },
  btnOutline: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  btnOutlineText: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.size.base,
  },
  doorOpenText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.xl,
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.sm,
  },
  bentoBoxSmall: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoBoxLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    marginBottom: Spacing.xs,
  },
  bentoBoxValue: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: 24,
    marginBottom: 2,
  },
  totalCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  totalLabelWhite: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.sm,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },
  totalValueWhite: {
    fontFamily: Typography.fontFamily.interBold,
    fontSize: 28,
    color: "#FFFFFF",
  },
  totalValueYellow: {
    fontFamily: Typography.fontFamily.interBold,
    fontSize: 28,
    color: Semantic.warning.main,
  },
  btnDanger: {
    flexDirection: "row",
    backgroundColor: Semantic.danger.main,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  modalCelebrationBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  celebrationCard: {
    width: "80%",
    padding: Spacing.xxl,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    ...Shadows.glow(Semantic.success.main),
  },
  checkIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Semantic.success.main,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  celebrationTitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.xl,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  celebrationSub: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.sm,
    textAlign: "center",
    lineHeight: 20,
  },
});
