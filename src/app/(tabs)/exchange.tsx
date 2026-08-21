import { FontAwesome } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { db } from "../../firebaseConfig";

// TAMBAHAN IMPORT UNTUK ANIMASI DAN NAVIGASI
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import LottieView from "lottie-react-native";

export default function ExchangeScreen() {
  const isFocused = useIsFocused();
  const [qrToken, setQrToken] = useState("ECO-SESSION-INITIAL");
  const [timeLeft, setTimeLeft] = useState(60);

  const [showQR, setShowQR] = useState(false);
  const [statusSesi, setStatusSesi] = useState("idle");

  const [jumlahPlastik, setJumlahPlastik] = useState(0);
  const [jumlahLogam, setJumlahLogam] = useState(0);
  const [jumlahReject, setJumlahReject] = useState(0);

  // STATE UNTUK MENGONTROL MUNCULNYA ANIMASI APRESIASI
  const [showCelebration, setShowCelebration] = useState(false);

  // STATE BARU: MENGONTROL STATUS AKTIF/TIDAKNYA MESIN (DEFAULT AKTIF)
  const [isMesinAktif, setIsMesinAktif] = useState(true);

  // 1. MATA-MATA FIREBASE UNTUK STATUS MESIN (RVM) SECARA REAL-TIME
  useEffect(() => {
    // Kita buat listener ke koleksi "RVM" dokumen "status_mesin"
    const unsubMesin = onSnapshot(doc(db, "RVM", "status_mesin"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Cek apakah field 'status' bernilai 'aktif'
        setIsMesinAktif(data.status === "aktif");
      }
    });
    return () => unsubMesin();
  }, []);

  // 2. MATA-MATA FIREBASE UNTUK SESI PENGGUNA
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "Sesi_Aktif", "Nayaka"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status) setStatusSesi(data.status);
        if (data.botol_plastik !== undefined)
          setJumlahPlastik(data.botol_plastik);
        if (data.botol_logam !== undefined) setJumlahLogam(data.botol_logam);
        if (data.sampah_reject !== undefined)
          setJumlahReject(data.sampah_reject);
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
        doc(db, "Sesi_Aktif", "Nayaka"),
        { kode_sesi: newToken },
        { merge: true },
      );
    } catch (error) {
      console.error("Gagal refresh token:", error);
    }
  };

  const mulaiSesi = async () => {
    const newToken = generateNewToken();
    setShowQR(true);
    try {
      await setDoc(
        doc(db, "Sesi_Aktif", "Nayaka"),
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
      doc(db, "Sesi_Aktif", "Nayaka"),
      { status: "idle" },
      { merge: true },
    );
  };

  // --- LOGIKA BARU UNTUK TOMBOL SELESAI ---
  const akhiriSesi = async () => {
    // 1. Getar & Munculkan Animasi Fullscreen
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowCelebration(true);

    // 2. Ubah status Firebase ke "selesai" (Mesin akan baca ini dan menutup pintu)
    await setDoc(
      doc(db, "Sesi_Aktif", "Nayaka"),
      { status: "selesai" },
      { merge: true },
    );

    // 3. Tunggu 3.5 detik biar user bisa lihat animasi koin
    setTimeout(() => {
      setShowCelebration(false);
      setShowQR(false); // Reset layar QR
      router.push("/"); // Lempar otomatis ke halaman Beranda!
    }, 3500);
  };

  useEffect(() => {
    if (!showQR || statusSesi !== "menunggu_mesin" || !isFocused) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          const randomCode =
            "ECO-" + Math.floor(10000000 + Math.random() * 90000000);
          setQrToken(randomCode);
          setDoc(
            doc(db, "Sesi_Aktif", "Nayaka"),
            { kode_sesi: randomCode },
            { merge: true },
          );
          return 60;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showQR, statusSesi, isFocused]);

  useEffect(() => {
    if (!isFocused && showQR && statusSesi === "menunggu_mesin") {
      batalkanSesi();
    }
  }, [isFocused]);

  const poinPlastik = jumlahPlastik * 100;
  const poinLogam = jumlahLogam * 300;
  const totalSemuaPoin = poinPlastik + poinLogam;
  const totalSemuaSampah = jumlahPlastik + jumlahLogam + jumlahReject;

  return (
    <View style={styles.container}>
      {/* --- MODAL ANIMASI APRESIASI SAAT SELESAI TRANSAKSI --- */}
      <Modal visible={showCelebration} transparent={true} animationType="fade">
        <View style={styles.modalCelebrationBg}>
          <View style={styles.celebrationCard}>
            <LottieView
              autoPlay
              loop={false}
              style={{ width: 150, height: 150 }}
              source={{
                uri: "https://lottie.host/809f8d95-8869-42b3-a15f-53748cd3c5c9/K0L266dO0g.json",
              }}
            />
            <Text style={styles.celebrationTitle}>Sesi Selesai! 🎉</Text>
            <Text style={styles.celebrationSub}>
              Pintu ditutup. Terima kasih telah mendaur ulang hari ini!
            </Text>
          </View>
        </View>
      </Modal>

      <Text style={styles.headerTitle}>Tukar Sampah</Text>

      {/* TAHAP 1: LAYAR AWAL (IDLE) */}
      {!showQR && statusSesi !== "pintu_terbuka" && (
        <View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
          {/* KARTU STATUS RVM DINAMIS */}
          <View style={styles.statusRvmCard}>
            <View style={styles.statusHeaderRow}>
              <Text style={styles.statusTitle}>Status RVM Saat Ini</Text>

              {/* Badge berubah abu-abu jika offline */}
              <View
                style={[
                  styles.badgeOnline,
                  !isMesinAktif && styles.badgeOffline,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    !isMesinAktif && styles.badgeTextOffline,
                  ]}
                >
                  • {isMesinAktif ? "AKTIF" : "NONAKTIF"}
                </Text>
              </View>
            </View>
            <Text style={styles.statusSub}>
              {isMesinAktif
                ? "Mesin siap digunakan"
                : "Mesin sedang offline / tidak terhubung"}
            </Text>
          </View>

          {/* TOMBOL QR DINAMIS (MATI BILA OFFLINE) */}
          <TouchableOpacity
            style={[
              styles.promoBanner,
              !isMesinAktif && styles.promoBannerOffline,
            ]}
            onPress={mulaiSesi}
            disabled={!isMesinAktif} // Mengunci tombol saat offline
            activeOpacity={0.7}
          >
            <View style={styles.bannerTextContainer}>
              <Text
                style={[
                  styles.bannerTitle,
                  !isMesinAktif && styles.bannerTitleOffline,
                ]}
              >
                Ayo Mulai Menukar!
              </Text>
              <Text
                style={[
                  styles.bannerSubtitle,
                  !isMesinAktif && styles.bannerSubtitleOffline,
                ]}
              >
                {isMesinAktif
                  ? "Tekan di sini untuk memunculkan QR Code dan membuka pintu mesin."
                  : "Harap tunggu hingga mesin kembali online untuk menukar."}
              </Text>
            </View>
            <FontAwesome
              name="qrcode"
              size={60}
              color={isMesinAktif ? "#10B981" : "#9CA3AF"} // Ikon jadi abu-abu
              style={styles.bannerIcon}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* TAHAP 2: MENUNGGU MESIN (QR TAMPIL) */}
      {showQR && statusSesi === "menunggu_mesin" && (
        <>
          <Text style={styles.subtitle}>
            Arahkan layar HP Anda ke pemindai di mesin RVM.
          </Text>
          <View style={styles.card}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={qrToken}
                size={220}
                color="#111827"
                backgroundColor="#FFFFFF"
              />
            </View>
            <Text style={styles.tokenLabel}>Kode Sesi Sementara:</Text>
            <Text style={styles.tokenText}>{qrToken}</Text>
            <View style={styles.timerRow}>
              <FontAwesome
                name="clock-o"
                size={16}
                color={timeLeft <= 5 ? "#EF4444" : "#F59E0B"}
              />
              <Text
                style={[
                  styles.timerText,
                  timeLeft <= 5 && { color: "#EF4444" },
                ]}
              >
                Akan diperbarui dalam {timeLeft} detik
              </Text>
            </View>
            <View style={{ width: "100%", gap: 10 }}>
              <TouchableOpacity
                style={styles.buttonRefresh}
                onPress={handleManualRefresh}
              >
                <FontAwesome
                  name="refresh"
                  size={16}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.buttonRefreshText}>Perbarui Sekarang</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonOutline}
                onPress={batalkanSesi}
              >
                <Text style={styles.buttonOutlineText}>Batalkan Sesi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* TAHAP 3: PINTU TERBUKA (DASBOR SAMPAH) */}
      {statusSesi === "pintu_terbuka" && (
        <>
          <Text style={styles.subtitle}>
            Mesin telah mengenali Anda. Silakan masukkan sampah satu per satu.
          </Text>
          <View style={styles.card}>
            <FontAwesome
              name="unlock-alt"
              size={40}
              color="#10B981"
              style={{ marginBottom: 5 }}
            />
            <Text style={[styles.tokenText, { fontSize: 20, marginBottom: 5 }]}>
              Pintu Terbuka
            </Text>
            <ActivityIndicator
              size="small"
              color="#10B981"
              style={{ marginBottom: 15 }}
            />

            <View style={styles.detailsContainer}>
              <Text style={styles.detailsHeader}>Rincian Sampah Masuk</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>🍾 Plastik (100 pts)</Text>
                <Text style={styles.detailCount}>{jumlahPlastik}x</Text>
                <Text style={styles.detailSubtotal}>+{poinPlastik}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>🥫 Logam (300 pts)</Text>
                <Text style={styles.detailCount}>{jumlahLogam}x</Text>
                <Text style={styles.detailSubtotal}>+{poinLogam}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>❌ Ditolak (0 pts)</Text>
                <Text style={[styles.detailCount, { color: "#EF4444" }]}>
                  {jumlahReject}x
                </Text>
                <Text style={[styles.detailSubtotal, { color: "#EF4444" }]}>
                  0
                </Text>
              </View>
              <View style={styles.dividerThick} />
              <View style={styles.totalRow}>
                <View>
                  <Text style={styles.totalLabel}>Total Item</Text>
                  <Text style={styles.totalValue}>{totalSemuaSampah}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.totalLabel}>Grand Total Poin</Text>
                  <Text style={[styles.totalValue, { color: "#F59E0B" }]}>
                    {totalSemuaPoin}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: "#EF4444", marginTop: 10 },
              ]}
              onPress={akhiriSesi}
            >
              <FontAwesome
                name="check-circle"
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.buttonText}>Akhiri Sesi & Tutup Pintu</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  headerTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: "#111827",
    marginBottom: 5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  statusRvmCard: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statusHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#111827",
  },
  badgeOnline: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: "#10B981",
  },

  // -- TAMBAHAN STYLING SAAT OFFLINE --
  badgeOffline: {
    backgroundColor: "#F3F4F6",
  },
  badgeTextOffline: {
    color: "#9CA3AF",
  },
  promoBannerOffline: {
    backgroundColor: "#F3F4F6", // Warna banner jadi abu-abu kusam
  },
  bannerTitleOffline: {
    color: "#4B5563",
  },
  bannerSubtitleOffline: {
    color: "#6B7280",
  },
  // ------------------------------------

  statusSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#6B7280",
  },
  promoBanner: {
    backgroundColor: "#E6F4EA",
    width: "100%",
    borderRadius: 16,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  bannerTextContainer: { flex: 1, paddingRight: 15 },
  bannerTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: "#137333",
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#137333",
    lineHeight: 18,
  },
  bannerIcon: { opacity: 0.9 },
  card: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  qrWrapper: {
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },
  tokenLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  tokenText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: "#10B981",
    letterSpacing: 2,
    marginBottom: 15,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  timerText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#F59E0B",
    marginLeft: 6,
  },
  buttonRefresh: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonRefreshText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 15,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 15,
  },
  buttonOutline: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderWidth: 2,
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
    marginTop: 10,
  },
  buttonOutlineText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#EF4444",
    fontSize: 15,
  },
  detailsContainer: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailsHeader: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontFamily: "Inter_400Regular",
    flex: 2,
    fontSize: 13,
    color: "#4B5563",
  },
  detailCount: {
    fontFamily: "Inter_700Bold",
    flex: 1,
    fontSize: 14,
    color: "#111827",
    textAlign: "center",
  },
  detailSubtotal: {
    fontFamily: "Inter_700Bold",
    flex: 1,
    fontSize: 14,
    color: "#10B981",
    textAlign: "right",
  },
  dividerThick: { height: 2, backgroundColor: "#E5E7EB", marginVertical: 12 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  totalValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#111827",
  },
  modalCelebrationBg: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  celebrationCard: {
    backgroundColor: "#FFFFFF",
    width: "80%",
    padding: 30,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  celebrationTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 22,
    color: "#111827",
    marginTop: -10,
    marginBottom: 8,
    textAlign: "center",
  },
  celebrationSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
