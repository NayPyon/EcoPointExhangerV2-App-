import { FontAwesome } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { db } from "../../firebaseConfig"; // Sesuaikan lokasi file-mu

export default function ExchangeScreen() {
  const [qrToken, setQrToken] = useState("ECO-SESSION-INITIAL");
  const [timeLeft, setTimeLeft] = useState(60);

  const isFocused = useIsFocused(); // Akan bernilai true jika dilihat, false jika pindah tab

  // STATE BARU: Pantau Status, Botol, dan Poin
  const [statusSesi, setStatusSesi] = useState("menunggu_mesin");
  const [jumlahBotol, setJumlahBotol] = useState(0);
  const [totalPoin, setTotalPoin] = useState(0);

  const generateNewToken = () => {
    const randomCode = "ECO-" + Math.floor(10000000 + Math.random() * 90000000);
    setQrToken(randomCode);
    setTimeLeft(60);
  };

  // 1. Mengirim Token Awal ke Firebase
  useEffect(() => {
    const simpanTokenKeCloud = async () => {
      if (qrToken === "ECO-SESSION-INITIAL") return;
      try {
        await setDoc(doc(db, "Sesi_Aktif", "Nayaka"), {
          kode_sesi: qrToken,
          waktu_dibuat: serverTimestamp(),
          status: "menunggu_mesin",
          botol: 0,
          poin: 0,
        });
      } catch (error) {
        console.error("Gagal mengirim token:", error);
      }
    };
    simpanTokenKeCloud();
  }, [qrToken]);

  // 2. MATA-MATA FIREBASE: Mendengarkan Perubahan Data secara Real-Time
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "Sesi_Aktif", "Nayaka"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status) setStatusSesi(data.status);
        if (data.botol !== undefined) setJumlahBotol(data.botol);
        if (data.poin !== undefined) setTotalPoin(data.poin);
      }
    });
    return () => unsub();
  }, []);

  // 3. TIMER: Otomatis berhenti jika status bukan "menunggu_mesin" ATAU layar tidak dilihat
  useEffect(() => {
    // Kuncinya di sini: Kalau layar tidak dilihat (!isFocused), timer jangan dijalankan!
    if (statusSesi !== "menunggu_mesin" || !isFocused) return;

    generateNewToken();
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          const randomCode =
            "ECO-" + Math.floor(10000000 + Math.random() * 90000000);
          setQrToken(randomCode);
          return 60;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [statusSesi, isFocused]); // isFocused dimasukkan ke sini agar bereaksi saat pindah tab

  // ---> TAMBAHAN BARU: Membatalkan sesi di awan saat user pindah tab
  // ---> TAMBAHAN BARU YANG DIPERBAIKI: Mengatur sesi saat masuk & keluar tab
  useEffect(() => {
    if (isFocused) {
      // SAAT KEMBALI KE TAB INI:
      // Kalau sebelumnya mati atau baru saja ditekan tombol "Selesai",
      // bangunkan lagi aplikasinya dan buat token baru!
      if (statusSesi === "tidak_aktif" || statusSesi === "selesai") {
        setStatusSesi("menunggu_mesin");
        generateNewToken(); // Ini akan otomatis mengirim token baru ke Firebase
      }
    } else {
      // SAAT PINDAH TAB:
      // Matikan sesi di awan hanya jika sedang dalam fase menunggu (QR tampil)
      if (statusSesi === "menunggu_mesin") {
        setDoc(
          doc(db, "Sesi_Aktif", "Nayaka"),
          {
            status: "tidak_aktif",
          },
          { merge: true },
        );
      }
    }
  }, [isFocused, statusSesi]); // Pastikan statusSesi dimasukkan ke dalam kurung siku ini

  // 4. UI / UX DINAMIS
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Sesi Tukar Sampah</Text>

      {/* --- UI KONDISI 1: TAMPILAN QR CODE (Menunggu Mesin) --- */}
      {statusSesi === "menunggu_mesin" && (
        <>
          <Text style={styles.subtitle}>
            Tunjukkan QR Code ini ke scanner mesin. Token otomatis diperbarui
            demi keamanan.
          </Text>
          <View style={styles.card}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={qrToken}
                size={200}
                color="#111827"
                backgroundColor="#FFFFFF"
              />
            </View>
            <Text style={styles.tokenLabel}>Kode Sesi Aktif:</Text>
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
                Diperbarui dalam {timeLeft} detik
              </Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={generateNewToken}>
              <FontAwesome
                name="refresh"
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.buttonText}>Perbarui Sekarang</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* --- UI KONDISI 2: TAMPILAN DASHBOARD POIN (Pintu Terbuka) --- */}
      {statusSesi === "pintu_terbuka" && (
        <>
          <Text style={styles.subtitle}>
            Mesin telah mengenali Anda. Silakan masukkan sampah satu per satu.
          </Text>
          <View style={styles.card}>
            <FontAwesome
              name="unlock-alt"
              size={50}
              color="#10B981"
              style={{ marginBottom: 10 }}
            />
            <Text style={[styles.tokenText, { fontSize: 24, marginBottom: 5 }]}>
              Pintu Terbuka
            </Text>

            <ActivityIndicator
              size="small"
              color="#10B981"
              style={{ marginBottom: 20 }}
            />

            {/* KOTAK INDIKATOR REAL-TIME */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Sampah Masuk</Text>
                <Text style={styles.statValue}>{jumlahBotol}</Text>
                <Text style={styles.statUnit}>Item</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Poin</Text>
                <Text style={[styles.statValue, { color: "#F59E0B" }]}>
                  {totalPoin}
                </Text>
                <Text style={styles.statUnit}>EcoPoints</Text>
              </View>
            </View>

            {/* TOMBOL SELESAI */}
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: "#EF4444", marginTop: 10 },
              ]}
              onPress={() =>
                setDoc(
                  doc(db, "Sesi_Aktif", "Nayaka"),
                  { status: "selesai" },
                  { merge: true },
                )
              }
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

// Tambahan Styling Baru di Bawah
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  headerTitle: {
    fontSize: 22,
    color: "#111827",
    marginBottom: 5,
    fontFamily: "Poppins_700Bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
    fontFamily: "Poppins_400Regular",
  },
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
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
    fontFamily: "Poppins_400Regular",
  },
  tokenText: {
    fontSize: 18,
    color: "#10B981",
    letterSpacing: 1,
    marginBottom: 15,
    fontFamily: "Poppins_700Bold",
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
    fontSize: 13,
    color: "#F59E0B",
    marginLeft: 6,
    fontFamily: "Poppins_600SemiBold",
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
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },

  // STYLING KHUSUS UNTUK KOTAK STATISTIK DASHBOARD
  statsContainer: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 15,
    paddingVertical: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "#E5E7EB",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 32,
    color: "#111827",
    fontFamily: "Poppins_700Bold",
  },
  statUnit: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
  },
});
