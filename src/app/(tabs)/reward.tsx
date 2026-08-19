import React from "react";
import {
  Alert,
  Image,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePoints } from "../../PointContext";

export default function RewardScreen() {
  const { totalPoin } = usePoints();

  // Katalog Hadiah dengan Layout Gambar Banner
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
    if (totalPoin >= item.points) {
      Alert.alert(
        "Konfirmasi Penukaran",
        `Tukar ${item.points} poin dengan ${item.title}?`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Tukar",
            onPress: () =>
              Alert.alert("Berhasil! 🎉", "Hadiahmu sedang diproses."),
          },
        ],
      );
    } else {
      const kurang = item.points - totalPoin;
      Alert.alert(
        "Poin Belum Cukup 😅",
        `Kamu butuh ${kurang} poin lagi untuk menukarkan ${item.title}.`,
      );
    }
  };

  const renderRewardItem = ({ item }: { item: any }) => {
    const isPoinCukup = totalPoin >= item.points;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => handleRedeem(item)}
      >
        {/* Banner Gambar */}
        <Image source={{ uri: item.image }} style={styles.cardImage} />

        {/* Konten Teks Bawah */}
        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.pointsRow}>
              <View style={styles.coinIcon}>
                <Text style={styles.coinText}>P</Text>
              </View>
              <Text
                style={[
                  styles.pointText,
                  !isPoinCukup && { color: "#9CA3AF" }, // Warna abu-abu jika poin kurang
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
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLabel}>Total Poinmu</Text>
          <View style={styles.headerPointsRow}>
            <View style={[styles.coinIcon, { backgroundColor: "#F59E0B" }]}>
              <Text style={[styles.coinText, { color: "#FFFFFF" }]}>P</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  headerLabel: {
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    fontSize: 13,
    marginBottom: 4,
  },
  headerPointsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerValue: {
    fontFamily: "Poppins_700Bold",
    color: "#111827",
    fontSize: 24,
    marginLeft: 8,
  },
  sectionHeader: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: "#111827",
    marginTop: 25,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    overflow: "hidden", // Agar gambar di atas ikut melengkung sesuai border radius
  },
  cardImage: {
    width: "100%",
    height: 140, // Tinggi banner
    backgroundColor: "#E5E7EB",
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#111827",
    marginBottom: 16,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },
  coinText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: "#D97706",
  },
  pointText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#10B981", // <--- Sudah diubah jadi Hijau Tema Aplikasi (Emerald)
    marginLeft: 6,
  },
  stockBadge: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  stockText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#6B7280",
  },
});
