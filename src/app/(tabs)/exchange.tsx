import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

// 1. Tambahkan onSnapshot untuk mendengarkan perubahan dari awan
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function ExchangeScreen() {
  const [qrToken, setQrToken] = useState("ECO-SESSION-INITIAL");
  const [timeLeft, setTimeLeft] = useState(60);

  // STATE BARU: Untuk memantau status pintu saat ini
  const [statusSesi, setStatusSesi] = useState("menunggu_mesin");

  const generateNewToken = () => {
    const randomCode = "ECO-" + Math.floor(10000000 + Math.random() * 90000000);
    setQrToken(randomCode);
    setTimeLeft(60);
  };

  // 2. JEMBATAN AWAN: Mengirim token ke Firebase
  useEffect(() => {
    const simpanTokenKeCloud = async () => {
      if (qrToken === "ECO-SESSION-INITIAL") return;
      try {
        await setDoc(doc(db, "Sesi_Aktif", "Nayaka"), {
          kode_sesi: qrToken,
          waktu_dibuat: serverTimestamp(),
          status: "menunggu_mesin",
        });
      } catch (error) {
        console.error("Gagal mengirim token:", error);
      }
    };
    simpanTokenKeCloud();
  }, [qrToken]);

  // 3. MATA-MATA FIREBASE: Mendengarkan balasan dari Node.js / Mesin
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "Sesi_Aktif", "Nayaka"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Kalau status berubah di Firebase, aplikasimu akan tahu!
        if (data.status) {
          setStatusSesi(data.status);
        }
      }
    });
    return () => unsub();
  }, []);

  // 4. TIMER PINTAR: Akan berhenti otomatis kalau pintu terbuka
  useEffect(() => {
    // Kalau statusnya bukan "menunggu_mesin", hentikan timer!
    if (statusSesi !== "menunggu_mesin") {
      return;
    }

    // Kalau status "menunggu_mesin", jalankan timer normal
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
  }, [statusSesi]); // Timer ini akan bereaksi setiap kali statusSesi berubah

  // 5. TAMPILAN UI/UX DINAMIS
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Sesi Tukar Sampah</Text>

      {/* Jika masih menunggu scan */}
      {statusSesi === "menunggu_mesin" && (
        <>
          <Text style={styles.subtitle}>
            Tunjukkan QR Code ini ke scanner mesin.
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

      {/* Jika pintu sudah terbuka (QR Code Hilang, Timer Berhenti) */}
      {statusSesi === "pintu_terbuka" && (
        <View style={styles.card}>
          <FontAwesome
            name="unlock-alt"
            size={60}
            color="#10B981"
            style={{ marginBottom: 15 }}
          />
          <Text style={[styles.tokenText, { fontSize: 22 }]}>
            Pintu Terbuka!
          </Text>
          <Text style={styles.subtitle}>
            Silakan masukkan botol plastik atau kaleng logam Anda ke dalam
            mesin.
          </Text>

          <ActivityIndicator
            size="large"
            color="#10B981"
            style={{ marginVertical: 20 }}
          />
          <Text style={styles.tokenLabel}>Menghitung sampah yang masuk...</Text>

          {/* Tombol Simulasi Selesai */}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: "#EF4444", marginTop: 20 },
            ]}
            onPress={() =>
              setDoc(
                doc(db, "Sesi_Aktif", "Nayaka"),
                { status: "selesai" },
                { merge: true },
              )
            }
          >
            <Text style={styles.buttonText}>Akhiri Sesi & Tutup Pintu</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Styling biarkan sama seperti sebelumnya...
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
});
