import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { CURRENT_USER } from "@/constants/user-config";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInUp,
  FadeInDown,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AnimConfig,
  BorderRadius,
  Colors,
  Components,
  Gradients,
  Semantic,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import { AnimatedPress } from "@/components/ui/animated-press";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { usePoints } from "../../PointContext";

export interface RewardItem {
  id: string;
  title: string;
  points: number;
  stock: number;
  image: string;
}

export default function RewardScreen() {
  const insets = useSafeAreaInsets();
  const { totalPoin } = usePoints();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"konfirmasi" | "sukses" | "gagal">("konfirmasi");
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);

  // Modal Animation Values
  const modalY = useSharedValue(300);
  const checkScale = useSharedValue(0.5);

  const REWARD_CATEGORIES = [
    {
      title: "Makanan & Minuman",
      data: [
        {
          id: "1",
          title: "Diskon Rp 20.000 Momoyo Ice Cream",
          points: 15000,
          stock: 45,
          image: "https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?w=600&q=80",
        },
        {
          id: "2",
          title: "Voucher Burger King Rp 50.000",
          points: 35000,
          stock: 12,
          image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80",
        },
        {
          id: "3",
          title: "Potongan Rp 30.000 Wingstop",
          points: 25000,
          stock: 8,
          image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80",
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
          image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600&q=80",
        },
        {
          id: "5",
          title: "Valorant Points (VP) 1125",
          points: 55000,
          stock: 3,
          image: "https://images.unsplash.com/photo-1662514101150-f865f128c946?w=600&q=80",
        },
      ],
    },
  ];

  const handleRedeem = (item: RewardItem) => {
    setSelectedReward(item);
    if (totalPoin >= item.points) {
      setModalType("konfirmasi");
    } else {
      setModalType("gagal");
    }
    setModalVisible(true);
    modalY.value = withSpring(0, AnimConfig.spring.snappy);
    if (totalPoin >= item.points) {
      checkScale.value = withSpring(1, AnimConfig.spring.bouncy);
    }
  };

  const prosesTukar = async () => {
    if (!selectedReward) return;

    try {
      await addDoc(collection(db, "Riwayat"), {
        user: CURRENT_USER.id,
        tipe: "tukar_voucher",
        nama_hadiah: selectedReward.title,
        poin: selectedReward.points,
        tanggal: serverTimestamp(),
      });

      setModalType("sukses");
      checkScale.value = 0.5;
      setTimeout(() => {
        checkScale.value = withSpring(1, AnimConfig.spring.bouncy);
      }, 100);
    } catch (error) {
      console.error("Gagal menukar voucher:", error);
    }
  };

  const closeModal = () => {
    modalY.value = withSpring(300, AnimConfig.spring.snappy);
    setTimeout(() => {
      setModalVisible(false);
    }, 300);
  };

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalY.value }],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const renderRewardItem = ({ item, index }: { item: RewardItem; index: number }) => {
    const isPoinCukup = totalPoin >= item.points;

    return (
      <Animated.View entering={FadeInUp.delay(index * 100).springify()}>
        <AnimatedPress
          style={[styles.card, Shadows.md]}
          onPress={() => handleRedeem(item)}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.floatingStock}>
              <GlassCard intensity={80} borderRadius={12} style={styles.stockBadgeContainer}>
                <Text style={styles.floatingStockText}>Sisa {item.stock}</Text>
              </GlassCard>
            </View>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.cardFooter}>
              <View style={styles.pointsRow}>
                <LinearGradient
                  colors={[Semantic.warning.light, Semantic.warning.main]}
                  style={styles.coinIconLarge}
                >
                  <Text style={styles.coinTextLarge}>P</Text>
                </LinearGradient>
                <Text
                  style={[
                    styles.pointText,
                    !isPoinCukup && { color: Semantic.text.muted },
                  ]}
                >
                  {item.points.toLocaleString("id-ID")}
                </Text>
              </View>
              {isPoinCukup ? (
                <View style={[styles.statusBadge, { backgroundColor: Semantic.success.light }]}>
                  <Text style={[styles.statusBadgeText, { color: Semantic.success.dark }]}>
                    Tukar
                  </Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: Semantic.background.tertiary }]}>
                  <Text style={[styles.statusBadgeText, { color: Semantic.text.muted }]}>
                    Poin Kurang
                  </Text>
                </View>
              )}
            </View>
          </View>
        </AnimatedPress>
      </Animated.View>
    );
  };

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <Animated.View entering={FadeInDown.springify()} style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeader}>{title}</Text>
      <View style={styles.sectionLine} />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <BlurView intensity={30} tint="dark" style={styles.modalOverlay}>
          <Animated.View style={[styles.modalCard, modalAnimatedStyle]}>
            {modalType === "konfirmasi" && (
              <>
                <View style={styles.modalIconWrapperInfo}>
                  <MaterialCommunityIcons name="gift" size={36} color={Semantic.secondary.main} />
                </View>
                <Text style={styles.modalTitle}>Konfirmasi Penukaran</Text>
                <Text style={styles.modalMessage}>
                  Tukar{" "}
                  <Text style={styles.modalHighlightInfo}>
                    {selectedReward?.points.toLocaleString("id-ID")} Poin
                  </Text>{" "}
                  dengan {selectedReward?.title}?
                </Text>
                <View style={styles.modalButtonRow}>
                  <AnimatedPress
                    style={[styles.buttonOutline, { flex: 1 }]}
                    onPress={closeModal}
                  >
                    <Text style={styles.buttonOutlineText}>Batal</Text>
                  </AnimatedPress>
                  <AnimatedPress
                    style={[styles.buttonPrimary, { flex: 1 }]}
                    onPress={prosesTukar}
                  >
                    <Text style={styles.buttonPrimaryText}>Tukar</Text>
                  </AnimatedPress>
                </View>
              </>
            )}

            {modalType === "sukses" && (
              <>
                <Animated.View style={[styles.modalIconWrapperSuccess, checkAnimatedStyle]}>
                  <MaterialCommunityIcons name="check-decagram" size={48} color={Semantic.success.main} />
                </Animated.View>
                <Text style={styles.modalTitle}>Berhasil!</Text>
                <Text style={styles.modalMessage}>
                  Hadiahmu sedang diproses. Cek riwayat atau emailmu secara berkala ya!
                </Text>
                <AnimatedPress
                  style={[styles.buttonPrimary, { width: "100%", marginTop: 10 }]}
                  onPress={closeModal}
                >
                  <Text style={styles.buttonPrimaryText}>OK, Mengerti</Text>
                </AnimatedPress>
              </>
            )}

            {modalType === "gagal" && (
              <>
                <View style={styles.modalIconWrapperDanger}>
                  <MaterialCommunityIcons name="alert-circle" size={42} color={Semantic.danger.main} />
                </View>
                <Text style={styles.modalTitle}>Poin Belum Cukup</Text>
                <Text style={styles.modalMessage}>
                  Kamu butuh{" "}
                  <Text style={styles.modalHighlightDanger}>
                    {selectedReward
                      ? (selectedReward.points - totalPoin).toLocaleString("id-ID")
                      : 0}{" "}
                    poin lagi
                  </Text>{" "}
                  untuk menukarkan {selectedReward?.title}.
                </Text>
                <AnimatedPress
                  style={[styles.buttonOutline, { width: "100%", marginTop: 10 }]}
                  onPress={closeModal}
                >
                  <Text style={styles.buttonOutlineText}>Oke, Mengerti</Text>
                </AnimatedPress>
              </>
            )}
          </Animated.View>
        </BlurView>
      </Modal>

      <View style={[styles.headerContainer, { paddingTop: insets.top + Spacing.four }]}>
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradientCard, Shadows.lg]}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.headerLabel}>Total Poinmu</Text>
            <View style={styles.headerPointsRow}>
              <View style={styles.coinIcon}>
                <Text style={styles.coinText}>P</Text>
              </View>
              <AnimatedCounter
                value={totalPoin}
                style={styles.headerValue}
                locale="id-ID"
              />
            </View>
          </View>
          <MaterialCommunityIcons name="star-four-points" size={42} color="rgba(255,255,255,0.2)" style={styles.headerDecoIcon} />
        </LinearGradient>
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
    backgroundColor: Semantic.background.secondary,
  },
  headerContainer: {
    backgroundColor: Semantic.background.primary,
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.five,
    borderBottomWidth: 1,
    borderColor: Semantic.border.light,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    ...Shadows.sm,
    zIndex: 10,
  },
  headerGradientCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },
  headerLeft: {
    flex: 1,
    zIndex: 2,
  },
  headerLabel: {
    fontFamily: Typography.fontFamily.inter,
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: Typography.size.sm,
    marginBottom: Spacing.xs,
  },
  headerPointsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Semantic.warning.main,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  coinText: {
    fontFamily: Typography.fontFamily.interBold,
    fontSize: 12,
    color: Semantic.background.primary,
  },
  headerValue: {
    fontFamily: Typography.fontFamily.primary,
    color: Semantic.text.light,
    fontSize: Typography.size.xxl,
  },
  headerDecoIcon: {
    position: "absolute",
    right: -10,
    bottom: -10,
    zIndex: 1,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.five,
  },
  sectionHeader: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.lg,
    color: Semantic.text.primary,
    marginRight: Spacing.md,
  },
  sectionLine: {
    flex: 1,
    height: 2,
    backgroundColor: Semantic.border.light,
    borderRadius: BorderRadius.full,
  },
  listContainer: {
    paddingBottom: 120,
    paddingTop: Spacing.md,
  },
  card: {
    backgroundColor: Semantic.background.primary,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.five,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 160,
    backgroundColor: Semantic.border.light,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  floatingStock: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
  },
  stockBadgeContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  floatingStockText: {
    fontFamily: Typography.fontFamily.interMedium,
    fontSize: Typography.size.xs,
    color: Semantic.text.light,
  },
  cardContent: {
    padding: Spacing.four,
  },
  title: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.size.md,
    color: Semantic.text.primary,
    marginBottom: Spacing.md,
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
  coinIconLarge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  coinTextLarge: {
    fontFamily: Typography.fontFamily.interBold,
    fontSize: 12,
    color: Semantic.background.primary,
  },
  pointText: {
    fontFamily: Typography.fontFamily.interBold,
    fontSize: Typography.size.md,
    color: Semantic.success.main,
    marginLeft: Spacing.sm,
  },
  statusBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  statusBadgeText: {
    fontFamily: Typography.fontFamily.interMedium,
    fontSize: Typography.size.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.five,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalCard: {
    backgroundColor: Semantic.background.primary,
    width: "100%",
    maxWidth: 340,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    alignItems: "center",
    ...Shadows.lg,
  },
  modalIconWrapperInfo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Semantic.secondary.light,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalIconWrapperSuccess: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Semantic.success.light,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalIconWrapperDanger: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Semantic.danger.light,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.xl,
    color: Semantic.text.primary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  modalMessage: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.base,
    color: Semantic.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  modalHighlightInfo: {
    fontFamily: Typography.fontFamily.primary,
    color: Semantic.secondary.main,
  },
  modalHighlightDanger: {
    fontFamily: Typography.fontFamily.primary,
    color: Semantic.danger.main,
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
  },
  buttonPrimary: {
    backgroundColor: Semantic.success.main,
    paddingVertical: Spacing.four,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimaryText: {
    fontFamily: Typography.fontFamily.primary,
    color: Semantic.text.light,
    fontSize: Typography.size.base,
  },
  buttonOutline: {
    backgroundColor: Semantic.background.tertiary,
    paddingVertical: Spacing.four,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonOutlineText: {
    fontFamily: Typography.fontFamily.primary,
    color: Semantic.text.primary,
    fontSize: Typography.size.base,
  },
});
