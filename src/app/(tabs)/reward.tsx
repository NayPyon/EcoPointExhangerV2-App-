import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "../../AuthContext";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  SectionList,
  StyleSheet,
  Text,
  View,
  useColorScheme
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Extrapolate,
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
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { totalPoin } = usePoints();

  const getBgColor = () => isDark ? Semantic.background.dark : Semantic.background.secondary;
  const getCardBg = () => isDark ? Colors.obsidian[800] : Semantic.background.primary;
  const getTextColor = () => isDark ? Semantic.text.light : Semantic.text.primary;
  const getMutedColor = () => isDark ? Colors.obsidian[400] : Semantic.text.secondary;
  const getBorderColor = () => isDark ? Colors.obsidian[800] : Semantic.border.light;

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

  const backdropOpacity = useSharedValue(0);

  const handleRedeem = (item: RewardItem) => {
    setSelectedReward(item);
    if (totalPoin >= item.points) {
      setModalType("konfirmasi");
    } else {
      setModalType("gagal");
    }
    
    // Set initial positions
    modalY.value = 300;
    backdropOpacity.value = 0;
    
    // Mount modal
    setModalVisible(true);
    
    // Trigger entrance animations
    backdropOpacity.value = withTiming(1, { duration: 250 });
    modalY.value = withTiming(0, { duration: 250 });
    
    if (totalPoin >= item.points) {
      checkScale.value = withTiming(1, { duration: 250 });
    }
  };

  const prosesTukar = async () => {
    if (!selectedReward) return;

    try {
      await addDoc(collection(db, "Riwayat"), {
        user: user!.uid,
        tipe: "tukar_voucher",
        nama_hadiah: selectedReward.title,
        poin: selectedReward.points,
        tanggal: serverTimestamp(),
      });

      await addDoc(collection(db, "Notifications"), {
        user: user!.uid,
        title: "Klaim Hadiah Sukses",
        desc: `Voucher ${selectedReward.title} senilai ${selectedReward.points} poin sudah ditambahkan ke dompetmu.`,
        type: "klaim",
        icon: "gift",
        color_type: "success",
        unread: true,
        time: serverTimestamp(),
      });

      setModalType("sukses");
      checkScale.value = 0.5;
      setTimeout(() => {
        checkScale.value = withTiming(1, { duration: 300 });
      }, 100);
    } catch (error) {
      console.error("Gagal menukar voucher:", error);
    }
  };

  const closeModal = () => {
    // Trigger exit animations
    backdropOpacity.value = withTiming(0, { duration: 250 });
    modalY.value = withTiming(300, { duration: 250 });
    
    // Unmount modal exactly when animation finishes
    setTimeout(() => {
      setModalVisible(false);
    }, 250);
  };

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const renderRewardItem = ({ item, index }: { item: RewardItem; index: number }) => {
    const isPoinCukup = totalPoin >= item.points;

    return (
      <Animated.View entering={FadeInUp.delay(index * 100).duration(400)}>
        <AnimatedPress
          style={[styles.card, { backgroundColor: getCardBg() }, Shadows.sm]}
          onPress={() => handleRedeem(item)}
        >
          <View style={[styles.imageContainer, { backgroundColor: isDark ? Colors.obsidian[950] : Semantic.border.light }]}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.floatingStock}>
              <View style={[styles.stockBadgeContainer, { backgroundColor: 'rgba(0, 0, 0, 0.7)', borderRadius: 12 }]}>
                <Text style={styles.floatingStockText}>Sisa {item.stock}</Text>
              </View>
            </View>
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.title, { color: getTextColor() }]} numberOfLines={2}>
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
                    !isPoinCukup && { color: getMutedColor() },
                  ]}
                >
                  {item.points.toLocaleString("id-ID")}
                </Text>
              </View>
              {isPoinCukup ? (
                <View style={[styles.statusBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : Semantic.success.light }]}>
                  <Text style={[styles.statusBadgeText, { color: isDark ? Semantic.success.main : Semantic.success.dark }]}>
                    Tukar
                  </Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: isDark ? Colors.obsidian[950] : Semantic.background.tertiary }]}>
                  <Text style={[styles.statusBadgeText, { color: getMutedColor() }]}>
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
    <Animated.View entering={FadeInDown.duration(400)} style={styles.sectionHeaderContainer}>
      <Text style={[styles.sectionHeader, { color: getTextColor() }]}>{title}</Text>
      <View style={[styles.sectionLine, { backgroundColor: getBorderColor() }]} />
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: getBgColor() }]}>
      
      {/* Background Blobs for Ambiance */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
         <View style={[styles.blob, { top: -100, right: -150, backgroundColor: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.25)' }]} />
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="none">
        <Animated.View style={[StyleSheet.absoluteFill, backdropAnimatedStyle]}>
          <BlurView intensity={isDark ? 40 : 30} tint={isDark ? "dark" : "dark"} style={styles.modalOverlay}>
            <Animated.View style={[styles.modalCard, { backgroundColor: getCardBg() }, modalAnimatedStyle]}>
              {modalType === "konfirmasi" && (
              <>
                <View style={[styles.modalIconWrapperInfo, { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.2)' : Semantic.secondary.light }]}>
                  <MaterialCommunityIcons name="gift" size={36} color={Semantic.secondary.main} />
                </View>
                <Text style={[styles.modalTitle, { color: getTextColor() }]}>Konfirmasi Penukaran</Text>
                <Text style={[styles.modalMessage, { color: getMutedColor() }]}>
                  Tukar{" "}
                  <Text style={[styles.modalHighlightInfo, { color: Semantic.secondary.main }]}>
                    {selectedReward?.points.toLocaleString("id-ID")} Poin
                  </Text>{" "}
                  dengan {selectedReward?.title}?
                </Text>
                <View style={styles.modalButtonRow}>
                  <AnimatedPress
                    style={[styles.buttonOutline, { flex: 1, backgroundColor: isDark ? Colors.obsidian[950] : Semantic.background.tertiary }]}
                    onPress={closeModal}
                  >
                    <Text style={[styles.buttonOutlineText, { color: getTextColor() }]}>Batal</Text>
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
                <Animated.View style={[styles.modalIconWrapperSuccess, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : Semantic.success.light }, checkAnimatedStyle]}>
                  <MaterialCommunityIcons name="check-decagram" size={48} color={Semantic.success.main} />
                </Animated.View>
                <Text style={[styles.modalTitle, { color: getTextColor() }]}>Berhasil!</Text>
                <Text style={[styles.modalMessage, { color: getMutedColor() }]}>
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
                <View style={[styles.modalIconWrapperDanger, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : Semantic.danger.light }]}>
                  <MaterialCommunityIcons name="alert-circle" size={42} color={Semantic.danger.main} />
                </View>
                <Text style={[styles.modalTitle, { color: getTextColor() }]}>Poin Belum Cukup</Text>
                <Text style={[styles.modalMessage, { color: getMutedColor() }]}>
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
                  style={[styles.buttonOutline, { width: "100%", marginTop: 10, backgroundColor: isDark ? Colors.obsidian[950] : Semantic.background.tertiary }]}
                  onPress={closeModal}
                >
                  <Text style={[styles.buttonOutlineText, { color: getTextColor() }]}>Oke, Mengerti</Text>
                </AnimatedPress>
              </>
            )}
          </Animated.View>
        </BlurView>
      </Animated.View>
    </Modal>

      {/* STICKY TOP HEADER */}
      <View style={[styles.headerContainer, { backgroundColor: isDark ? 'rgba(11, 17, 24, 0.85)' : 'rgba(255, 255, 255, 0.85)', paddingTop: insets.top + Spacing.lg }]}>
        <BlurView intensity={isDark ? 50 : 80} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={Gradients.card}
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
  },
  blob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    filter: 'blur(70px)',
  },
  headerContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderColor: 'rgba(150,150,150,0.1)',
    zIndex: 10,
  },
  headerGradientCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
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
    color: '#FFFFFF',
  },
  headerValue: {
    fontFamily: Typography.fontFamily.primary,
    color: '#FFFFFF',
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
    paddingHorizontal: Spacing.xl,
  },
  sectionHeader: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.lg,
    marginRight: Spacing.md,
  },
  sectionLine: {
    flex: 1,
    height: 2,
    borderRadius: BorderRadius.full,
  },
  listContainer: {
    paddingBottom: 120,
    paddingTop: Spacing.sm,
  },
  card: {
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 160,
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
    color: '#FFFFFF',
  },
  cardContent: {
    padding: Spacing.lg,
  },
  title: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.size.md,
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
    color: '#FFFFFF',
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
    padding: Spacing.xl,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalCard: {
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalIconWrapperSuccess: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalIconWrapperDanger: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.xl,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  modalMessage: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.base,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  modalHighlightInfo: {
    fontFamily: Typography.fontFamily.primary,
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
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimaryText: {
    fontFamily: Typography.fontFamily.primary,
    color: '#FFFFFF',
    fontSize: Typography.size.base,
  },
  buttonOutline: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonOutlineText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.base,
  },
});
