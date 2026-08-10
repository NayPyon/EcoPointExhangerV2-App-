import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function ExchangeScreen() {
  const [qrToken, setQrToken] = useState("ECO-SESSION-INITIAL");
  const [timeLeft, setTimeLeft] = useState(15); // Waktu hitung mundur (15 detik)

  // Fungsi untuk membuat token baru secara acak
  const generateNewToken = () => {
    const randomCode = "ECO-" + Math.floor(10000000 + Math.random() * 90000000);
    setQrToken(randomCode);
    setTimeLeft(15); // Reset waktu kembali ke 15 detik
  };

  // Efek untuk menjalankan timer otomatis saat halaman dibuka
  useEffect(() => {
    // Generate token pertama kali saat halaman dimuat
    generateNewToken();

    // Membuat interval yang berjalan setiap 1 detik (1000 ms)
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Jika waktu habis, buat token baru
          const randomCode =
            "ECO-" + Math.floor(10000000 + Math.random() * 90000000);
          setQrToken(randomCode);
          return 15; // Reset waktu
        }
        return prevTime - 1; // Kurangi 1 detik
      });
    }, 1000);

    // Membersihkan interval saat pengguna pindah dari halaman ini agar tidak membebani memori
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

        {/* Tombol manual (opsional, jika user tidak sabar menunggu) */}
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
