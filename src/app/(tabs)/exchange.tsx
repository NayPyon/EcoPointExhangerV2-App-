import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

// 1. Import senjata Firebase kita
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
// Pastikan jumlah titik-titiknya sesuai dengan letak firebaseConfig.ts milikmu!
import { db } from "../../firebaseConfig";

export default function ExchangeScreen() {
  const [qrToken, setQrToken] = useState("ECO-SESSION-INITIAL");
  const [timeLeft, setTimeLeft] = useState(15);

  const generateNewToken = () => {
    const randomCode = "ECO-" + Math.floor(10000000 + Math.random() * 90000000);
    setQrToken(randomCode);
    setTimeLeft(15);
  };

  // 2. JEMBATAN AWAN: Mengirim token ke Firebase secara otomatis
  useEffect(() => {
    const simpanTokenKeCloud = async () => {
      // Jangan kirim token dummy awal ke database
      if (qrToken === "ECO-SESSION-INITIAL") return;

      try {
        // Menyimpan kode ke koleksi "Sesi_Aktif" khusus untuk akunmu
        await setDoc(doc(db, "Sesi_Aktif", "Nayaka"), {
          kode_sesi: qrToken,
          waktu_dibuat: serverTimestamp(),
          status: "menunggu_mesin", // Status awal menunggu ESP32 melakukan scan
        });
        console.log("Token berhasil diamankan ke awan:", qrToken);
      } catch (error) {
        console.error("Gagal mengirim token ke awan:", error);
      }
    };

    simpanTokenKeCloud();
  }, [qrToken]); // Efek ini akan otomatis "terpancing" setiap kali qrToken berubah

  // 3. Efek Timer Bawaanmu (Tidak ada yang diubah)
  useEffect(() => {
    generateNewToken();

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          const randomCode =
            "ECO-" + Math.floor(10000000 + Math.random() * 90000000);
          setQrToken(randomCode);
          return 15;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Sesi Tukar Sampah</Text>
      <Text style={styles.subtitle}>
        Tunjukkan QR Code ini ke scanner mesin. Token otomatis diperbarui demi
        keamanan.
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

        {/* Indikator Hitung Mundur */}
        <View style={styles.timerRow}>
          <FontAwesome
            name="clock-o"
            size={16}
            color={timeLeft <= 5 ? "#EF4444" : "#F59E0B"}
          />
          <Text
            style={[styles.timerText, timeLeft <= 5 && { color: "#EF4444" }]}
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
    </View>
  );
}

// Styling tetap sama persis dengan desain aslimu
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
