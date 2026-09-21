import { AnimatedCounter } from "@/components/ui/animated-counter";
import { AnimatedPress } from "@/components/ui/animated-press";
import {
  BorderRadius,
  Colors,
  Gradients,
  Semantic,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import * as Location from "expo-location";
import { useAuth } from "../../AuthContext";

import {
  Feather,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import {
  collection,
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Pressable,
  View,
  useColorScheme,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { db, generateChronologicalId } from "../../firebaseConfig";
import { usePoints } from "../../PointContext";

import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ExchangeScreen() {
  const { user, userData } = useAuth();
  const { totalEssence } = usePoints();
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

  // User location & distance
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [distanceKm, setDistanceKm] = useState<string>("Menghitung...");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (isMounted) setDistanceKm("Izin Ditolak");
          return;
        }

        // Coba pakai lokasi terakhir (biasanya instan)
        let location = await Location.getLastKnownPositionAsync({
          maxAge: 60000, // 1 menit
        });

        if (location && isMounted) {
          setUserLocation(location);
        }

        // Fetch lokasi akurat jika belum dapat atau ingin update
        let currentLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (isMounted) setUserLocation(currentLoc);
      } catch (e) {
        console.warn("Gagal ambil lokasi:", e);
        if (isMounted && distanceKm === "Menghitung...") {
          setDistanceKm("Gagal (Nyalakan GPS)");
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const [selectedRVMId, setSelectedRVMId] = useState<string | null>(null);
  const [showOtherRVMs, setShowOtherRVMs] = useState(false);

  useEffect(() => {
    if (userLocation && allRVMs.length > 0) {
      let activeToSet: any = null;
      let minActiveDist = Infinity;

      // Calculate distances for all RVMs
      const rvmsWithDist = allRVMs.map((rvm) => {
        let dist = Infinity;
        if (
          typeof rvm.latitude === "number" &&
          typeof rvm.longitude === "number"
        ) {
          dist = calculateDistance(
            userLocation.coords.latitude,
            userLocation.coords.longitude,
            rvm.latitude,
            rvm.longitude,
          );
        }
        return { ...rvm, calculatedDist: dist };
      });

      if (selectedRVMId) {
        const found = rvmsWithDist.find((r) => r.id === selectedRVMId);
        if (found) {
          activeToSet = found;
          minActiveDist = found.calculatedDist;
        }
      }

      if (!activeToSet) {
        // Auto-select closest
        activeToSet = rvmsWithDist.reduce(
          (prev, curr) =>
            prev.calculatedDist < curr.calculatedDist ? prev : curr,
          rvmsWithDist[0],
        );
        minActiveDist = activeToSet.calculatedDist;
      }

      setActiveRVM(activeToSet);
      if (minActiveDist !== Infinity) {
        setDistanceKm(minActiveDist.toFixed(1) + " km");
      } else {
        setDistanceKm("Lokasi RVM tidak valid");
      }
    } else if (!userLocation && allRVMs.length > 0) {
      const target = selectedRVMId
        ? allRVMs.find((r) => r.id === selectedRVMId) || allRVMs[0]
        : allRVMs[0];
      setActiveRVM(target);
      if (
        distanceKm !== "Izin Ditolak" &&
        distanceKm !== "Gagal" &&
        distanceKm !== "Gagal (Nyalakan GPS)"
      ) {
        setDistanceKm("Menghitung...");
      }
    } else if (allRVMs.length === 0) {
      setActiveRVM(null);
      setDistanceKm("Tidak Ada RVM Aktif");
    }
  }, [userLocation, allRVMs, selectedRVMId]);

  const getBgColor = () =>
    isDark ? Semantic.background.dark : Semantic.background.secondary;
  const getCardBg = () => (isDark ? Colors.obsidian[800] : "#FFFFFF");
  const getTextColor = () => (isDark ? "#FFFFFF" : Colors.obsidian[900]);
  const getMutedColor = () =>
    isDark ? Colors.obsidian[400] : Colors.obsidian[500];

  // Animation Values
  const pulseOpacity = useSharedValue(0.5);
  const pulseScale = useSharedValue(1);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.5, { duration: 1000 }),
      ),
      -1,
      true,
    );
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
      true,
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

  const [activeRVM, setActiveRVM] = useState<any>(null);
  const [allRVMs, setAllRVMs] = useState<any[]>([]);

  useEffect(() => {
    const unsubMesin = onSnapshot(collection(db, "RVM"), (snap) => {
      let activeList: any[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.status_mesin === "aktif") {
          activeList.push({ id: doc.id, ...data });
        }
      });
      setIsMesinAktif(activeList.length > 0);
      setAllRVMs(activeList);
    });
    return () => unsubMesin();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "Users", user!.uid, "Sesi_Mesin", "sekarang"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.status) setStatusSesi(data.status);
          if (data.botol_plastik !== undefined)
            setJumlahPlastik(data.botol_plastik);
          if (data.botol_logam !== undefined) setJumlahLogam(data.botol_logam);
          if (data.sampah_reject !== undefined)
            setJumlahReject(data.sampah_reject);
        }
      },
    );
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
        doc(db, "Users", user!.uid, "Sesi_Mesin", "sekarang"),
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
        doc(db, "Users", user!.uid, "Sesi_Mesin", "sekarang"),
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
      doc(db, "Users", user!.uid, "Sesi_Mesin", "sekarang"),
      { status: "idle" },
      { merge: true },
    );
  };

  // ─── DEV ONLY: Bypass hardware untuk testing ─────────────────────────────
  const bypassSesi = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newToken = generateNewToken();
    setShowQR(true);
    try {
      await setDoc(
        doc(db, "Users", user!.uid, "Sesi_Mesin", "sekarang"),
        {
          kode_sesi: newToken,
          waktu_dibuat: serverTimestamp(),
          status: "pintu_terbuka",
          botol_plastik: 0,
          botol_logam: 0,
          sampah_reject: 0,
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Gagal bypass sesi:", error);
    }
  };

  const tambahItem = async (
    tipe: "botol_plastik" | "botol_logam" | "sampah_reject",
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nilai =
      tipe === "botol_plastik"
        ? { botol_plastik: jumlahPlastik + 1 }
        : tipe === "botol_logam"
          ? { botol_logam: jumlahLogam + 1 }
          : { sampah_reject: jumlahReject + 1 };
    try {
      await setDoc(
        doc(db, "Users", user!.uid, "Sesi_Mesin", "sekarang"),
        nilai,
        { merge: true },
      );
    } catch (error) {
      console.error("Gagal tambah item:", error);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const akhiriSesi = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowCelebration(true);
    checkScale.value = 0;
    checkScale.value = withTiming(1, { duration: 300 });

    if (totalSemuaPoin > 0) {
      try {
        const riwayatId = generateChronologicalId();
        await setDoc(doc(db, "Users", user!.uid, "Riwayat", riwayatId), {
          user: user!.uid,
          tipe: "penyetoran",
          plastik: jumlahPlastik,
          logam: jumlahLogam,
          poin: totalSemuaPoin,
          essence: basePoin,
          tanggal: serverTimestamp(),
        });

        const notifId = generateChronologicalId();
        await setDoc(doc(db, "Users", user!.uid, "Notifications", notifId), {
          user: user!.uid,
          title: "Penyetoran Berhasil",
          desc: `Berhasil menyetor ${jumlahPlastik} plastik & ${jumlahLogam} logam. Kamu mendapatkan +${totalSemuaPoin} Gold & +${basePoin} Essence.`,
          type: "penyetoran",
          icon: "recycle",
          color_type: "primary",
          unread: true,
          time: serverTimestamp(),
        });

        // UPDATE data di Users collection
        await updateDoc(doc(db, "Users", user!.uid), {
          poin: increment(totalSemuaPoin),
          total_plastik: increment(jumlahPlastik),
          total_logam: increment(jumlahLogam),
        });
      } catch (e) {
        console.error(e);
      }
    }

    await setDoc(
      doc(db, "Users", user!.uid, "Sesi_Mesin", "sekarang"),
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
          const randomCode =
            "ECO-" + Math.floor(10000000 + Math.random() * 90000000);
          setQrToken(randomCode);
          setDoc(
            doc(db, "Users", user!.uid, "Sesi_Mesin", "sekarang"),
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

  const getBonusMultiplier = (pts: number) => {
    if (pts >= 50000) return 1.2;
    if (pts >= 25000) return 1.15;
    if (pts >= 10000) return 1.1;
    if (pts >= 2500) return 1.05;
    return 1.0;
  };

  const basePoin = poinPlastik + poinLogam;
  const multiplier = getBonusMultiplier(userData?.poin || 0);
  const totalSemuaPoin = Math.floor(basePoin * multiplier);
  const isBonusActive = multiplier > 1.0;

  const totalSemuaSampah = jumlahPlastik + jumlahLogam + jumlahReject;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getBgColor(),
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + 82,
        },
      ]}
    >
      {/* Background Blobs for ambiance */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View
          style={[
            styles.blob,
            {
              top: -100,
              right: -100,
              backgroundColor: isDark
                ? "rgba(16, 185, 129, 0.35)"
                : "rgba(16, 185, 129, 0.25)",
            },
          ]}
        />
        <View
          style={[
            styles.blob,
            {
              bottom: 100,
              left: -100,
              backgroundColor: isDark
                ? "rgba(245, 158, 11, 0.25)"
                : "rgba(245, 158, 11, 0.25)",
            },
          ]}
        />
      </View>

      <Modal visible={showCelebration} transparent={true} animationType="fade">
        {/* Celebration Modal Content (Keep it as is) */}
        <BlurView
          intensity={isDark ? 50 : 80}
          tint={isDark ? "dark" : "light"}
          style={styles.modalCelebrationBg}
        >
          <Animated.View
            entering={FadeInUp}
            style={[styles.celebrationCard, { backgroundColor: getCardBg() }]}
          >
            <Animated.View style={checkStyle}>
              <View style={styles.checkIconWrapper}>
                <FontAwesome name="check" size={50} color="#FFFFFF" />
              </View>
            </Animated.View>
            <Text style={[styles.celebrationTitle, { color: getTextColor() }]}>
              Transaksi Berhasil!
            </Text>

            <View style={{ marginVertical: Spacing.xl, alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: Typography.fontFamily.medium,
                  fontSize: Typography.size.sm,
                  color: getMutedColor(),
                }}
              >
                Poin Didapatkan
              </Text>
              <Text
                style={{
                  fontFamily: Typography.fontFamily.primary,
                  fontSize: 36,
                  color: Semantic.warning.main,
                  marginVertical: 4,
                }}
              >
                +{totalSemuaPoin}
              </Text>
              <Text
                style={{
                  fontFamily: Typography.fontFamily.medium,
                  fontSize: Typography.size.sm,
                  color: Semantic.success.main,
                }}
              >
                {totalSemuaSampah - jumlahReject} Item Berhasil Didaur Ulang
              </Text>
            </View>

            <Text style={[styles.celebrationSub, { color: getMutedColor() }]}>
              Mesin telah ditutup. Terima kasih sudah mengambil peran nyata
              untuk bumi hari ini!
            </Text>
          </Animated.View>
        </BlurView>
      </Modal>

      {/* MODAL PILIH CABANG RVM */}
      <Modal visible={showOtherRVMs} transparent={true} animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: getCardBg(),
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: Spacing.xl,
              maxHeight: "80%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: Spacing.lg,
              }}
            >
              <Text
                style={{
                  fontFamily: Typography.fontFamily.bold,
                  fontSize: 18,
                  color: getTextColor(),
                }}
              >
                Pilih Cabang RVM
              </Text>
              <TouchableOpacity
                onPress={() => setShowOtherRVMs(false)}
                style={{
                  padding: 8,
                  backgroundColor: isDark
                    ? Colors.obsidian[700]
                    : Colors.neutral[100],
                  borderRadius: 20,
                }}
              >
                <Feather name="x" size={20} color={getTextColor()} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {allRVMs
                .filter((r) => r.id !== activeRVM?.id)
                .map((rvm) => {
                  let distStr = "Menghitung...";
                  if (
                    userLocation &&
                    typeof rvm.latitude === "number" &&
                    typeof rvm.longitude === "number"
                  ) {
                    const dist = calculateDistance(
                      userLocation.coords.latitude,
                      userLocation.coords.longitude,
                      rvm.latitude,
                      rvm.longitude,
                    );
                    distStr = dist.toFixed(1) + " km";
                  }

                  return (
                    <TouchableOpacity
                      key={rvm.id}
                      style={{
                        flexDirection: "row",
                        padding: Spacing.md,
                        backgroundColor: isDark
                          ? Colors.obsidian[900]
                          : Colors.neutral[50],
                        borderRadius: 16,
                        marginBottom: Spacing.md,
                        borderWidth: 1,
                        borderColor: isDark
                          ? Colors.obsidian[700]
                          : Colors.neutral[200],
                      }}
                      onPress={() => {
                        setSelectedRVMId(rvm.id);
                        setShowOtherRVMs(false);
                      }}
                    >
                      <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <Image 
                          source={require('../../../assets/images/valo-logo-cropped.png')}
                          style={{ width: 40, height: 40 }}
                          resizeMode="contain"
                        />
                      </View>
                      <View
                        style={{
                          marginLeft: Spacing.md,
                          flex: 1,
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Typography.fontFamily.bold,
                            color: getTextColor(),
                            fontSize: 15,
                          }}
                        >
                          VALO - {rvm.lokasi}
                        </Text>
                        <Text
                          style={{
                            fontFamily: Typography.fontFamily.inter,
                            color: getMutedColor(),
                            fontSize: 12,
                            marginTop: 2,
                          }}
                        >
                          {rvm.alamat || `Lokasi: ${rvm.lokasi}`}
                        </Text>
                      </View>
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "flex-end",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Typography.fontFamily.medium,
                            color: Semantic.primary.main,
                            fontSize: 13,
                          }}
                        >
                          {distStr}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Text style={[styles.headerTitle, { color: getTextColor() }]}>
        Tukar Sampah
      </Text>

      {/* STAGE IDLE */}
      {!showQR && statusSesi !== "pintu_terbuka" && (
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.contentWrapper}
        >
          <View
            style={[
              styles.bentoCard,
              { backgroundColor: getCardBg(), marginBottom: Spacing.xl, padding: 0 },
            ]}
          >
            <AnimatedPress
              onPress={() => router.push("/map")}
              style={{ padding: Spacing.lg }}
            >
              <View style={styles.statusHeaderRow}>
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <View style={{ alignItems: "center", justifyContent: "center" }}>
                  <Image 
                    source={require('../../../assets/images/valo-logo-cropped.png')}
                    style={{ width: 44, height: 44 }}
                    resizeMode="contain"
                  />
                </View>
                <View style={{ marginLeft: Spacing.md, flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 2,
                    }}
                  >
                    <Text
                      style={[
                        styles.bentoLabel,
                        { color: getMutedColor(), marginBottom: 0 },
                      ]}
                    >
                      RVM Terdekat
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.statusTitle,
                      { color: getTextColor(), marginBottom: 4 },
                    ]}
                  >
                    {activeRVM
                      ? `VALO - ${activeRVM.lokasi}`
                      : "VALO - Tidak Tersedia"}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Typography.fontFamily.inter,
                      fontSize: 13,
                      color: getMutedColor(),
                      lineHeight: 18,
                    }}
                  >
                    {activeRVM
                      ? activeRVM.alamat ||
                        `Lokasi RVM aktif: ${activeRVM.lokasi}`
                      : "Tidak ada RVM yang sedang aktif"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.statusIndicatorRow}>
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <Animated.View
                  style={[
                    styles.dotIndicator,
                    isMesinAktif && pulseStyle,
                    {
                      backgroundColor: isMesinAktif
                        ? Semantic.success.main
                        : Semantic.danger.main,
                    },
                  ]}
                />
                <Text
                  style={{
                    fontFamily: Typography.fontFamily.medium,
                    fontSize: 13,
                    color: isMesinAktif
                      ? Semantic.success.main
                      : Semantic.danger.main,
                  }}
                >
                  {isMesinAktif ? "Status: Tersedia" : "Offline"}
                </Text>

                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: getMutedColor(),
                    marginHorizontal: 8,
                  }}
                />
                <FontAwesome
                  name="map-marker"
                  size={12}
                  color={getMutedColor()}
                />
                <Text
                  style={{
                    fontFamily: Typography.fontFamily.medium,
                    fontSize: 13,
                    color: getMutedColor(),
                    marginLeft: 4,
                  }}
                >
                  {distanceKm}
                </Text>
              </View>

              <AnimatedPress
                style={styles.routeButton}
                onPress={() => {
                  if (activeRVM?.latitude && activeRVM?.longitude) {
                    Linking.openURL(
                      `https://www.google.com/maps/dir/?api=1&destination=${activeRVM.latitude},${activeRVM.longitude}`,
                    );
                  } else {
                    Alert.alert(
                      "Lokasi Tidak Ditemukan",
                      "RVM saat ini belum memiliki koordinat yang valid.",
                    );
                  }
                }}
              >
                <FontAwesome
                  name="location-arrow"
                  size={12}
                  color="#FFFFFF"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.routeButtonText}>Rute</Text>
              </AnimatedPress>
            </View>
            </AnimatedPress>

            {allRVMs.length > 1 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setShowOtherRVMs(true);
                }}
                style={{
                  borderTopWidth: 1,
                  borderTopColor: isDark
                    ? Colors.obsidian[700]
                    : Colors.neutral[200],
                  padding: Spacing.md,
                  marginHorizontal: Spacing.md,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: Typography.fontFamily.medium,
                    fontSize: 13,
                    color: Semantic.primary.main,
                  }}
                >
                  Lihat {allRVMs.length - 1} Cabang RVM Lainnya
                </Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={16}
                  color={Semantic.primary.main}
                />
              </TouchableOpacity>
            )}
          </View>

          <AnimatedPress
            style={[styles.ctaWrapper, !isMesinAktif ? { opacity: 0.6 } : {}]}
            onPress={mulaiSesi}
            disabled={!isMesinAktif}
          >
            <LinearGradient
              colors={
                isMesinAktif
                  ? Gradients.success
                  : [
                      isDark ? Colors.obsidian[800] : Colors.neutral[200],
                      isDark ? Colors.obsidian[800] : Colors.neutral[200],
                    ]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.promoBanner}
            >
              <View style={styles.bannerTextContainer}>
                <Text
                  style={[
                    styles.bannerTitle,
                    !isMesinAktif && { color: getTextColor() },
                  ]}
                >
                  Mulai Scan QR
                </Text>
                <Text
                  style={[
                    styles.bannerSubtitle,
                    !isMesinAktif && { color: getMutedColor() },
                  ]}
                >
                  {isMesinAktif
                    ? "Tekan untuk memunculkan QR Code pemindaian."
                    : "Tidak dapat menukar saat mesin offline."}
                </Text>
              </View>
              <Animated.View style={isMesinAktif ? pulseIconStyle : undefined}>
                <View
                  style={[
                    styles.iconCircleLg,
                    {
                      backgroundColor: isMesinAktif
                        ? "rgba(255,255,255,0.2)"
                        : isDark
                          ? Colors.obsidian[700]
                          : Colors.neutral[300],
                    },
                  ]}
                >
                  <FontAwesome
                    name="qrcode"
                    size={40}
                    color={isMesinAktif ? "#FFFFFF" : getMutedColor()}
                  />
                </View>
              </Animated.View>
            </LinearGradient>
          </AnimatedPress>

          {/* ── DEV BYPASS BUTTON ─────────────────────────── */}
          {(userData?.role === "admin" || userData?.Role === "admin") && (
            <Animated.View
              entering={FadeInDown.duration(500).delay(200)}
              style={{ width: "100%", marginTop: Spacing.lg }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: Spacing.sm,
                  gap: 6,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: "rgba(245,158,11,0.3)",
                  }}
                />
                <Text
                  style={{
                    fontFamily: Typography.fontFamily.medium,
                    fontSize: 11,
                    color: Semantic.warning.main,
                    letterSpacing: 1,
                  }}
                >
                  🛠 DEV MODE
                </Text>
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: "rgba(245,158,11,0.3)",
                  }}
                />
              </View>
              <AnimatedPress
                style={{
                  width: "100%",
                  paddingVertical: Spacing.md,
                  borderRadius: BorderRadius.full,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  borderWidth: 1.5,
                  borderColor: Semantic.warning.main,
                  borderStyle: "dashed",
                  gap: 8,
                  backgroundColor: isDark
                    ? "rgba(245,158,11,0.1)"
                    : "rgba(245,158,11,0.06)",
                }}
                onPress={bypassSesi}
              >
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={18}
                  color={Semantic.warning.main}
                />
                <Text
                  style={{
                    fontFamily: Typography.fontFamily.secondary,
                    fontSize: Typography.size.base,
                    color: Semantic.warning.main,
                  }}
                >
                  Bypass Mesin (Dev)
                </Text>
              </AnimatedPress>
            </Animated.View>
          )}
          {/* ─────────────────────────────────────────────── */}
        </Animated.View>
      )}

      {/* STAGE QR (menunggu_mesin) */}
      {showQR && statusSesi === "menunggu_mesin" && (
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.contentWrapper}
        >
          <Text style={[styles.subtitle, { color: getMutedColor() }]}>
            Arahkan layar HP Anda ke pemindai di mesin RVM.
          </Text>
          <View
            style={[
              styles.bentoCard,
              {
                backgroundColor: getCardBg(),
                alignItems: "center",
                padding: Spacing.xxl,
              },
            ]}
          >
            <View
              style={[
                styles.qrInner,
                { backgroundColor: "#FFFFFF", borderColor: "#FFFFFF" },
              ]}
            >
              <QRCode
                value={`${user!.uid}|${qrToken}`}
                size={220}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            </View>

            <Text
              style={[
                styles.bentoLabel,
                { color: getMutedColor(), marginTop: Spacing.lg },
              ]}
            >
              Kode Sesi
            </Text>
            <Text style={[styles.tokenText, { color: getTextColor() }]}>
              {qrToken}
            </Text>

            <View
              style={[
                styles.timerPill,
                timeLeft <= 10 && styles.timerPillDanger,
              ]}
            >
              <FontAwesome
                name="clock-o"
                size={16}
                color={timeLeft <= 10 ? "#FFFFFF" : Semantic.warning.main}
              />
              <Text
                style={[
                  styles.timerText,
                  timeLeft <= 10 && { color: "#FFFFFF" },
                ]}
              >
                Perbarui dalam {timeLeft}s
              </Text>
            </View>

            <View style={styles.actionRow}>
              <AnimatedPress
                style={styles.btnPrimary}
                onPress={handleManualRefresh}
              >
                <FontAwesome
                  name="refresh"
                  size={16}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.btnPrimaryText}>Segarkan</Text>
              </AnimatedPress>
              <AnimatedPress
                style={[
                  styles.btnOutline,
                  {
                    borderColor: isDark
                      ? Colors.obsidian[700]
                      : Colors.neutral[200],
                  },
                ]}
                onPress={batalkanSesi}
              >
                <Text
                  style={[styles.btnOutlineText, { color: getTextColor() }]}
                >
                  Batal
                </Text>
              </AnimatedPress>
            </View>
          </View>
        </Animated.View>
      )}

      {/* STAGE PINTU TERBUKA */}
      {statusSesi === "pintu_terbuka" && (
        <Animated.View
          entering={FadeInUp.duration(500)}
          style={styles.contentWrapper}
        >
          <Text style={[styles.subtitle, { color: getMutedColor() }]}>
            Mesin terbuka. Masukkan sampah Anda perlahan.
          </Text>

          <View
            style={[
              styles.bentoCard,
              {
                backgroundColor: getCardBg(),
                padding: Spacing.xl,
                width: "100%",
                alignItems: "center",
              },
            ]}
          >
            <Animated.View style={pulseIconStyle}>
              <View
                style={[
                  styles.iconCircleLg,
                  {
                    backgroundColor: Colors.emerald[50],
                    marginBottom: Spacing.md,
                  },
                ]}
              >
                <FontAwesome
                  name="unlock-alt"
                  size={40}
                  color={Semantic.success.main}
                />
              </View>
            </Animated.View>
            <Text style={[styles.doorOpenText, { color: getTextColor() }]}>
              Memindai Item...
            </Text>

            {/* Grid for Items */}
            <View style={styles.statsRow}>
              <View
                style={[
                  styles.bentoBoxSmall,
                  {
                    backgroundColor: isDark
                      ? Colors.obsidian[950]
                      : Colors.neutral[50],
                  },
                ]}
              >
                <Text
                  style={[styles.bentoBoxLabel, { color: getMutedColor() }]}
                >
                  Plastik
                </Text>
                <AnimatedCounter
                  value={jumlahPlastik}
                  style={[
                    styles.bentoBoxValue,
                    { color: Semantic.primary.main },
                  ]}
                />
                <Text
                  style={{
                    fontFamily: Typography.fontFamily.medium,
                    fontSize: 12,
                    color: Semantic.primary.main,
                  }}
                >
                  +{poinPlastik} pts
                </Text>
              </View>

              <View
                style={[
                  styles.bentoBoxSmall,
                  {
                    backgroundColor: isDark
                      ? Colors.obsidian[950]
                      : Colors.neutral[50],
                  },
                ]}
              >
                <Text
                  style={[styles.bentoBoxLabel, { color: getMutedColor() }]}
                >
                  Logam
                </Text>
                <AnimatedCounter
                  value={jumlahLogam}
                  style={[
                    styles.bentoBoxValue,
                    { color: Semantic.warning.main },
                  ]}
                />
                <Text
                  style={{
                    fontFamily: Typography.fontFamily.medium,
                    fontSize: 12,
                    color: Semantic.warning.main,
                  }}
                >
                  +{poinLogam} pts
                </Text>
              </View>

              <View
                style={[
                  styles.bentoBoxSmall,
                  {
                    backgroundColor: isDark
                      ? Colors.obsidian[950]
                      : Colors.neutral[50],
                  },
                ]}
              >
                <Text
                  style={[styles.bentoBoxLabel, { color: getMutedColor() }]}
                >
                  Ditolak
                </Text>
                <AnimatedCounter
                  value={jumlahReject}
                  style={[
                    styles.bentoBoxValue,
                    { color: Semantic.danger.main },
                  ]}
                />
                <Text
                  style={{
                    fontFamily: Typography.fontFamily.medium,
                    fontSize: 12,
                    color: Semantic.danger.main,
                  }}
                >
                  0 pts
                </Text>
              </View>
            </View>

            <View style={{ height: Spacing.xl }} />

            <LinearGradient
              colors={
                isDark
                  ? [Colors.obsidian[800], Colors.obsidian[950]]
                  : Gradients.card
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.totalCard}
            >
              <View>
                <Text style={styles.totalLabelWhite}>Total Poin</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: 6,
                  }}
                >
                  <AnimatedCounter
                    value={totalSemuaPoin}
                    style={styles.totalValueYellow}
                  />
                  {isBonusActive && (
                    <Text
                      style={{
                        fontSize: 13,
                        color: Semantic.warning.main,
                        marginBottom: 8,
                        fontWeight: "bold",
                      }}
                    >
                      (+{Math.round((multiplier - 1) * 100)}% Bonus)
                    </Text>
                  )}
                </View>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.totalLabelWhite}>Item Diterima</Text>
                <AnimatedCounter
                  value={totalSemuaSampah - jumlahReject}
                  style={styles.totalValueWhite}
                />
              </View>
            </LinearGradient>

            <AnimatedPress style={styles.btnDanger} onPress={akhiriSesi}>
              <FontAwesome
                name="check-circle"
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.btnPrimaryText}>Tutup Pintu & Selesai</Text>
            </AnimatedPress>

            {/* ── DEV: Tambah Item Manual ────────────────────── */}
            {__DEV__ && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(150)}
                style={{ width: "100%", marginTop: Spacing.xl }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: Spacing.sm,
                    gap: 6,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: "rgba(245,158,11,0.3)",
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: Typography.fontFamily.medium,
                      fontSize: 11,
                      color: Semantic.warning.main,
                      letterSpacing: 1,
                    }}
                  >
                    🛠 SIMULASI ITEM
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: "rgba(245,158,11,0.3)",
                    }}
                  />
                </View>
                <View style={{ flexDirection: "row", gap: Spacing.sm }}>
                  <AnimatedPress
                    style={{
                      flex: 1,
                      paddingVertical: Spacing.md,
                      borderRadius: BorderRadius.lg,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1.5,
                      borderStyle: "dashed",
                      borderColor: Semantic.primary.main,
                      backgroundColor: isDark
                        ? "rgba(16,185,129,0.1)"
                        : "rgba(16,185,129,0.06)",
                      gap: 4,
                    }}
                    onPress={() => tambahItem("botol_plastik")}
                  >
                    <Text style={{ fontSize: 20 }}>🧴</Text>
                    <Text
                      style={{
                        fontFamily: Typography.fontFamily.secondary,
                        fontSize: 12,
                        color: Semantic.primary.main,
                      }}
                    >
                      +Plastik
                    </Text>
                  </AnimatedPress>
                  <AnimatedPress
                    style={{
                      flex: 1,
                      paddingVertical: Spacing.md,
                      borderRadius: BorderRadius.lg,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1.5,
                      borderStyle: "dashed",
                      borderColor: Semantic.warning.main,
                      backgroundColor: isDark
                        ? "rgba(245,158,11,0.1)"
                        : "rgba(245,158,11,0.06)",
                      gap: 4,
                    }}
                    onPress={() => tambahItem("botol_logam")}
                  >
                    <Text style={{ fontSize: 20 }}>🥫</Text>
                    <Text
                      style={{
                        fontFamily: Typography.fontFamily.secondary,
                        fontSize: 12,
                        color: Semantic.warning.main,
                      }}
                    >
                      +Logam
                    </Text>
                  </AnimatedPress>
                  <AnimatedPress
                    style={{
                      flex: 1,
                      paddingVertical: Spacing.md,
                      borderRadius: BorderRadius.lg,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1.5,
                      borderStyle: "dashed",
                      borderColor: Semantic.danger.main,
                      backgroundColor: isDark
                        ? "rgba(239,68,68,0.1)"
                        : "rgba(239,68,68,0.06)",
                      gap: 4,
                    }}
                    onPress={() => tambahItem("sampah_reject")}
                  >
                    <Text style={{ fontSize: 20 }}>🗑️</Text>
                    <Text
                      style={{
                        fontFamily: Typography.fontFamily.secondary,
                        fontSize: 12,
                        color: Semantic.danger.main,
                      }}
                    >
                      +Reject
                    </Text>
                  </AnimatedPress>
                </View>
              </Animated.View>
            )}
            {/* ─────────────────────────────────────────────── */}
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
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    filter: "blur(60px)",
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
    width: "100%",
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleLg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(150,150,150,0.1)",
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
    flexDirection: "row",
    alignItems: "center",
  },
  routeButtonText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: "#FFFFFF",
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
    backgroundColor: "transparent",
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
    flexDirection: "row",
    width: "100%",
    gap: Spacing.sm,
  },
  bentoBoxSmall: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
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
