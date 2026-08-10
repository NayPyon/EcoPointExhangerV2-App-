import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function ExchangeScreen() {
  const [qrToken, setQrToken] = useState("ECO-SESSION-2026-NAYAKA");

  const generateNewToken = () => {
    const randomCode =
      "ECO-SESSION-" + Math.floor(100000 + Math.random() * 900000);
    setQrToken(randomCode);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Sesi Tukar Sampah</Text>
      <Text style={styles.subtitle}>
        Tunjukkan QR Code ini ke scanner mesin untuk memulai penimbangan botol.
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

        <TouchableOpacity style={styles.button} onPress={generateNewToken}>
          <FontAwesome
            name="refresh"
            size={18}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.buttonText}>Refresh Token Sesi</Text>
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
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 5,
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
    letterSpacing: 1,
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
