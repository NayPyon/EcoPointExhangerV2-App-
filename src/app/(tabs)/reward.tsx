import { Components, Semantic } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  Modal,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePoints } from "../../PointContext";

export default function RewardScreen() {
  const { totalPoin } = usePoints();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"konfirmasi" | "sukses" | "gagal">(
    "konfirmasi",
  );
  const [selectedReward, setSelectedReward] = useState<any>(null);

  const REWARD_CATEGORIES = [
    {
      title: "Makanan & Minuman",
      data: [
        {
          id: "1",
          title: "Diskon Rp 20.000 Momoyo Ice Cream",
          points: 15000,
          stock: 45,
          image:
            "https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?w=600&q=80",
        },
        {
          id: "2",
          title: "Voucher Burger King Rp 50.000",
          points: 35000,
          stock: 12,
          image:
            "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80",
        },
        {
          id: "3",
          title: "Potongan Rp 30.000 Wingstop",
          points: 25000,
          stock: 8,
          image:
            "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80",
        },
      ],
    },
    {
      title: "E-Wallet & Hiburan",
      data: [
        {
          id: "4",
          title: "Saldo GoPay Rp 25.000",
          points: 25000,
          stock: 100,
          image:
            "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600&q=80",
        },
        {
          id: "5",
          title: "Valorant Points (VP) 1125",
          points: 55000,
          stock: 3,
          image:
            "https://images.unsplash.com/photo-1662514101150-f865f128c946?w=600&q=80",
        },
      ],
    },
  ];

  const handleRedeem = (item: any) => {
    setSelectedReward(item);
    if (totalPoin >= item.points) {
      setModalType("konfirmasi");
    } else {
      setModalType("gagal");
    }
    setModalVisible(true);
  };

  const prosesTukar = () => {
    setModalType("sukses");
  };

  const renderRewardItem = ({ item }: { item: any }) => {
    const isPoinCukup = totalPoin >= item.points;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => handleRedeem(item)}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.cardFooter}>
            <View style={styles.pointsRow}>
              {/* LOGO KOIN DI SINI SUDAH SAMA DENGAN HEADER */}
              <View style={styles.coinIcon}>
                <Text style={styles.coinText}>P</Text>
              </View>

              <Text
                style={[
                  styles.pointText,
                  !isPoinCukup && { color: Semantic.text.muted },
                ]}
              >
                {item.points.toLocaleString("id-ID")} Poin
              </Text>
            </View>
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>Sisa Stok &lt; {item.stock}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title } }: any) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {modalType === "konfirmasi" && (
              <>
                <MaterialCommunityIcons
                  name="gift"
                  size={42}
                  color={Semantic.success.main}
                  style={styles.modalIcon}
                />
                <Text style={styles.modalTitle}>Konfirmasi Penukaran</Text>
                <Text style={styles.modalMessage}>
                  Tukar{" "}
                  <Text
                    style={{
                      fontFamily: "Poppins_700Bold",
                      color: Semantic.success.main,
                    }}
                  >
                    {selectedReward?.points.toLocaleString("id-ID")} Poin
                  </Text>{" "}
                  dengan {selectedReward?.title}?
                </Text>
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.buttonOutline, { flex: 1 }]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.buttonOutlineText}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.buttonPrimary, { flex: 1 }]}
                    onPress={prosesTukar}
                  >
                    <Text style={styles.buttonPrimaryText}>Tukar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {modalType === "sukses" && (
              <>
                <MaterialCommunityIcons
                  name="party-popper"
                  size={42}
                  color={Semantic.success.main}
                  style={styles.modalIcon}
                />
                <Text style={styles.modalTitle}>Berhasil!</Text>
                <Text style={styles.modalMessage}>
                  Hadiahmu sedang diproses. Cek riwayat atau emailmu secara
                  berkala ya!
                </Text>
                <TouchableOpacity
                  style={[
                    styles.buttonPrimary,
                    { width: "100%", marginTop: 5 },
                  ]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonPrimaryText}>OK, Mengerti</Text>
                </TouchableOpacity>
              </>
            )}

            {modalType === "gagal" && (
              <>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={42}
                  color={Semantic.warning.main}
                  style={styles.modalIcon}
                />
                <Text style={styles.modalTitle}>Poin Belum Cukup</Text>
                <Text style={styles.modalMessage}>
                  Kamu butuh{" "}
                  <Text
                    style={{
                      fontFamily: "Poppins_700Bold",
                      color: Semantic.danger.main,
                    }}
                  >
                    {selectedReward
                      ? (selectedReward.points - totalPoin).toLocaleString(
                          "id-ID",
                        )
                      : 0}{" "}
                    poin lagi
                  </Text>{" "}
                  untuk menukarkan {selectedReward?.title}.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.buttonOutline,
                    { width: "100%", marginTop: 5 },
                  ]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonOutlineText}>Oke, Mengerti</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLabel}>Total Poinmu</Text>
          <View style={styles.headerPointsRow}>
            <View
              style={[
                styles.coinIcon,
                { backgroundColor: Semantic.warning.main },
              ]}
            >
              <Text
                style={[
                  styles.coinText,
                  { color: Semantic.background.primary },
                ]}
              >
                P
              </Text>
            </View>
            <Text style={styles.headerValue}>
              {totalPoin.toLocaleString("id-ID")}
            </Text>
          </View>
        </View>
      </View>

      <SectionList
        sections={REWARD_CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={renderRewardItem}
        renderSectionHeader={renderSectionHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Semantic.background.tertiary },
  headerContainer: {
    backgroundColor: Semantic.background.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: Components.card.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flex: 1 },
  headerLabel: {
    fontFamily: "Inter_400Regular",
    color: Semantic.text.secondary,
    fontSize: 13,
    marginBottom: 4,
  },
  headerPointsRow: { flexDirection: "row", alignItems: "center" },
  headerValue: {
    fontFamily: "Poppins_700Bold",
    color: Semantic.text.primary,
    fontSize: 24,
    marginLeft: 8,
  },
  sectionHeader: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: Semantic.text.primary,
    marginTop: 25,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  listContainer: { paddingBottom: 120 },
  card: {
    backgroundColor: Semantic.background.primary,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: Semantic.text.primary,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 140,
    backgroundColor: Components.card.border,
  },
  cardContent: { padding: 16 },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: Semantic.text.primary,
    marginBottom: 16,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointsRow: { flexDirection: "row", alignItems: "center" },
  // WARNA COIN DIUPDATE MENJADI ORANYE SOLID AGAR SAMA PERSIS
  coinIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Semantic.warning.main,
    justifyContent: "center",
    alignItems: "center",
  },
  coinText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: Semantic.background.primary,
  },
  pointText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Semantic.success.main,
    marginLeft: 6,
  },
  stockBadge: {
    backgroundColor: Semantic.background.tertiary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  stockText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Semantic.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Components.modal.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: Semantic.background.primary,
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: Semantic.text.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  modalIcon: { marginBottom: 12 },
  modalTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: Semantic.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Semantic.text.secondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtonRow: { flexDirection: "row", gap: 10, width: "100%" },
  buttonPrimary: {
    backgroundColor: Semantic.success.main,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimaryText: {
    fontFamily: "Poppins_700Bold",
    color: Semantic.background.primary,
    fontSize: 14,
  },
  buttonOutline: {
    backgroundColor: Semantic.background.tertiary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonOutlineText: {
    fontFamily: "Poppins_700Bold",
    color: Semantic.text.primary,
    fontSize: 14,
  },
});
