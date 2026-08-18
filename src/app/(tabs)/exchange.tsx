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
import { db } from "../../firebaseConfig";

export default function ExchangeScreen() {
  const isFocused = useIsFocused();
  const [qrToken, setQrToken] = useState("ECO-SESSION-INITIAL");
  const [timeLeft, setTimeLeft] = useState(60);

  // STATE BARU: Pantau Status dan Rincian Sampah
  const [statusSesi, setStatusSesi] = useState("menunggu_mesin");
  const [jumlahPlastik, setJumlahPlastik] = useState(0);
  const [jumlahLogam, setJumlahLogam] = useState(0);
  const [jumlahReject, setJumlahReject] = useState(0);

  const generateNewToken = () => {
    const randomCode = "ECO-" + Math.floor(10000000 + Math.random() * 90000000);
    setQrToken(randomCode);
    setTimeLeft(60);
  };

  // 1. Mengirim Token Awal ke Firebase (Ditambah field kategori)
  useEffect(() => {
    const simpanTokenKeCloud = async () => {
      if (qrToken === "ECO-SESSION-INITIAL") return;
      try {
        await setDoc(doc(db, "Sesi_Aktif", "Nayaka"), {
          kode_sesi: qrToken,
          waktu_dibuat: serverTimestamp(),
          status: "menunggu_mesin",
          botol_plastik: 0,
          botol_logam: 0,
          sampah_reject: 0,
        });
      } catch (error) {
        console.error("Gagal mengirim token:", error);
      }
    };
    simpanTokenKeCloud();
  }, [qrToken]);

  // 2. MATA-MATA FIREBASE: Mendengarkan Perubahan Data Kategori
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

  // 3. TIMER & SENSOR TAB
  useEffect(() => {
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
  }, [statusSesi, isFocused]);

  useEffect(() => {
    if (!isFocused && statusSesi === "menunggu_mesin") {
      setDoc(
        doc(db, "Sesi_Aktif", "Nayaka"),
        { status: "tidak_aktif" },
        { merge: true },
      );
    } else if (
      isFocused &&
      (statusSesi === "tidak_aktif" || statusSesi === "selesai")
    ) {
      setStatusSesi("menunggu_mesin");
      generateNewToken();
    }
  }, [isFocused, statusSesi]);

  // --- KALKULASI OTOMATIS ---
  const poinPlastik = jumlahPlastik * 100;
  const poinLogam = jumlahLogam * 300;
  const totalSemuaPoin = poinPlastik + poinLogam;
  const totalSemuaSampah = jumlahPlastik + jumlahLogam + jumlahReject;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Sesi Tukar Sampah</Text>

      {/* UI KONDISI 1: MENUNGGU MESIN */}
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

      {/* UI KONDISI 2: PINTU TERBUKA (DASBOR RINCIAN) */}
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

            {/* KOTAK RINCIAN SAMPAH */}
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsHeader}>Rincian Sampah Masuk</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>🧋 Plastik (100 pts)</Text>
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

// Tambahkan/Timpa styling ini di bagian styles
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
    fontFamily: "Poppins_700Bold", // Sesuaikan dengan font-mu
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
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
  },
  tokenText: {
    fontSize: 18,
    color: "#10B981",
    letterSpacing: 1,
    marginBottom: 15,
    fontWeight: "bold",
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
    fontWeight: "bold",
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
    fontWeight: "bold",
  },

  // STYLING KHUSUS DASBOR RINCIAN (PENGGANTI KOTAK LAMA)
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
    fontSize: 14,
    color: "#374151",
    fontWeight: "bold",
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
    flex: 2,
    fontSize: 13,
    color: "#4B5563",
  },
  detailCount: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  detailSubtotal: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    color: "#10B981",
    textAlign: "right",
  },
  dividerThick: {
    height: 2,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
});
