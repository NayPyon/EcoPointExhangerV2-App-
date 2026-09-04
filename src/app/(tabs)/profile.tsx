import { BorderRadius, Components, Semantic, Spacing } from "@/constants/theme";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebaseConfig";
import { usePoints } from "../../PointContext"; // <--- Import PointContext agar poin bisa terbaca

export default function ProfileScreen() {
  const [userData, setUserData] = useState({
    total_plastik: 0,
    total_logam: 0,
  });

  const { totalPoin } = usePoints(); // <--- Tarik data total poin dari mesin

  // MATA-MATA FIREBASE: Mendengarkan Brankas Utama
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "Users", "Nayaka"), (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  // --- RUMUS SULAP ECO-IMPACT ---
  const p = userData.total_plastik || 0;
  const l = userData.total_logam || 0;

  // Emisi CO2 Terkurangi (kg)
  const co2Saved = (p * 0.08 + l * 0.2).toFixed(2);

  // Logika Gamifikasi: Cek Rank Saat Ini
  const getLevelName = () => {
    if (totalPoin >= 50000) return "Radiant Recycler ✨";
    if (totalPoin >= 25000) return "Elderwood Guardian 🛡️";
    if (totalPoin >= 10000) return "Sylvan Sapling 🌳";
    if (totalPoin >= 2500) return "Verdant Sprout 🌿";
    return "Pebble Seed 🌱";
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }} // <--- TAMBAHKAN INI JUGA
    >
      {/* HEADER PROFIL */}
      <View style={styles.headerContainer}>
        <View style={styles.avatarWrapper}>
          <FontAwesome name="leaf" size={40} color={Semantic.success.main} />
        </View>
        <Text style={styles.userName}>Nayaka Alkaesyah S.</Text>
        <Text style={styles.userSubtitle}>{getLevelName()}</Text>
      </View>

      {/* JUDUL BAGIAN DAMPAK */}
      <View style={styles.impactHeader}>
        <Text style={styles.sectionTitle}>Dampak Lingkunganmu</Text>
        <Text style={styles.sectionSubtitle}>
          Kontribusimu sangat berarti bagi bumi!
        </Text>
      </View>

      {/* KARTU DAMPAK LINGKUNGAN */}
      <View style={styles.impactContainer}>
        {/* Kartu 1: Karbon */}
        <View style={styles.impactCard}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: Components.iconWrapper.success.bg },
            ]}
          >
            <MaterialCommunityIcons
              name="molecule-co2"
              size={28}
              color={Semantic.success.main}
            />
          </View>
          <View style={styles.impactTextContainer}>
            <Text style={styles.impactValue}>
              {co2Saved} <Text style={styles.impactUnit}>kg</Text>
            </Text>
            <Text style={styles.impactLabel}>Emisi Karbon Dicegah</Text>
          </View>
        </View>
      </View>

      {/* TOMBOL PENGATURAN & BANTUAN */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <FontAwesome
            name="user-circle-o"
            size={20}
            color={Semantic.text.secondary}
            style={styles.menuIcon}
          />
          <Text style={styles.menuText}>Edit Profil</Text>
          <FontAwesome
            name="chevron-right"
            size={14}
            color={Components.card.border}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <FontAwesome
            name="history"
            size={20}
            color={Semantic.text.secondary}
            style={styles.menuIcon}
          />
          <Text style={styles.menuText}>Riwayat Penukaran</Text>
          <FontAwesome
            name="chevron-right"
            size={14}
            color={Components.card.border}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <FontAwesome
            name="question-circle-o"
            size={20}
            color={Semantic.text.secondary}
            style={styles.menuIcon}
          />
          <Text style={styles.menuText}>Pusat Bantuan</Text>
          <FontAwesome
            name="chevron-right"
            size={14}
            color={Components.card.border}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.versionText}>EcoPoint App v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Semantic.background.secondary,
  },
  headerContainer: {
    backgroundColor: Components.header.bg, // Putih
    borderBottomWidth: 1,
    borderBottomColor: Components.header.border, // Border tipis
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.full,
    backgroundColor: Components.iconWrapper.primary.bg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Components.iconWrapper.primary.color,
  },
  userName: {
    fontFamily: "Poppins_700Bold",
    fontSize: 22,
    color: Semantic.text.primary,
    marginBottom: 4,
  },
  userSubtitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: Semantic.success.main,
  },
  impactHeader: {
    marginTop: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: Semantic.text.primary,
  },
  sectionSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Semantic.text.secondary,
    marginTop: 2,
  },
  impactContainer: {
    paddingHorizontal: 20,
  },
  impactCard: {
    flexDirection: "row",
    backgroundColor: Semantic.background.primary,
    borderRadius: BorderRadius.lg,
    padding: 20,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: Semantic.text.primary,
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: Components.card.border,
  },
  iconBox: {
    width: 55,
    height: 55,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  impactTextContainer: {
    flex: 1,
  },
  impactValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Semantic.text.primary,
  },
  impactUnit: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: Semantic.text.secondary,
  },
  impactLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Semantic.text.secondary,
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: Semantic.background.primary,
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Components.card.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: Semantic.background.secondary,
  },
  menuIcon: {
    width: 30,
  },
  menuText: {
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    fontSize: 16,
    color: Semantic.text.primary,
  },
  versionText: {
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    color: Semantic.text.muted,
    fontSize: 12,
    marginTop: 30,
    marginBottom: 40,
  },
});
