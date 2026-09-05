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
import { CURRENT_USER } from "@/constants/user-config";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Context
import { usePoints } from "../../PointContext";

// UI Components
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { AnimatedPress } from "@/components/ui/animated-press";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientHeader } from "@/components/ui/gradient-header";
import { SkeletonCard, SkeletonListItem } from "@/components/ui/skeleton";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";

const GAMIFICATION_TIERS = [
  { name: "Radiant Recycler ✨", req: "50.000+ pts", benefit: "+20% Poin" },
  { name: "Elderwood Guardian 🛡️", req: "25.000 pts", benefit: "+15% Poin" },
  { name: "Sylvan Sapling 🌳", req: "10.000 pts", benefit: "+10% Poin" },
  { name: "Verdant Sprout 🌿", req: "2.500 pts", benefit: "+5% Poin" },
  { name: "Pebble Seed 🌱", req: "0 pts", benefit: "Normal (1x)" },
];

export default function HomeScreen() {
  const { ts } = useLocalSearchParams();
  const animationKey = ts ? String(ts) : "default";
  
  const insets = useSafeAreaInsets();
  const { totalPoin, totalPlastik, totalLogam, hariKonsisten, loading } =
    usePoints();
  const [isExpanded, setIsExpanded] = useState(false);

  const getLevelName = () => {
    if (totalPoin >= 50000) return "Radiant Recycler ✨";
    if (totalPoin >= 25000) return "Elderwood Guardian 🛡️";
    if (totalPoin >= 10000) return "Sylvan Sapling 🌳";
    if (totalPoin >= 2500) return "Verdant Sprout 🌿";
    return "Pebble Seed 🌱";
  };

  const getTargetPoints = () => {
    if (totalPoin >= 50000) return totalPoin;
    if (totalPoin >= 25000) return 50000;
    if (totalPoin >= 10000) return 25000;
    if (totalPoin >= 2500) return 10000;
    return 2500;
  };

  const targetPoints = getTargetPoints();
  const progressPercentage =
    totalPoin >= 50000 ? 100 : Math.min((totalPoin / targetPoints) * 100, 100);

  const handleBellPress = () => {
    router.push("/notifications");
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const firstName = CURRENT_USER.displayName.split(" ")[0];

  // Animated badge pulse
  const badgeScale = useSharedValue(1);
  useEffect(() => {
    badgeScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 600 }),
        withTiming(1, { duration: 600 }),
      ),
      -1,
      true,
    );
  }, []);

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  // Fire pulse
  const fireScale = useSharedValue(1);
  useEffect(() => {
    fireScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, []);

  const fireAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fireScale.value }],
  }));

  // Animated progress bar
  const progressWidth = useSharedValue(0);
  useEffect(() => {
    progressWidth.value = withSpring(
      progressPercentage,
      AnimConfig.spring.gentle,
    );
  }, [progressPercentage]);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // Streak progress
  const streakWidth = useSharedValue(0);
  useEffect(() => {
    streakWidth.value = withSpring(
      Math.min((hariKonsisten / 7) * 100, 100),
      AnimConfig.spring.gentle,
    );
  }, [hariKonsisten]);

  const streakAnimatedStyle = useAnimatedStyle(() => ({
    width: `${streakWidth.value}%`,
  }));

  if (loading) {
    return (
      <View style={styles.container}>
        <GradientHeader extraPaddingBottom={60}>
          <View style={styles.headerContent}>
            <Text style={styles.greetingText}>Halo, {firstName}! 👋</Text>
          </View>
        </GradientHeader>
        <View style={{ marginTop: -40, paddingHorizontal: Spacing.xl }}>
          <SkeletonCard />
          <View style={{ height: Spacing.xl }} />
          <View style={styles.statsRow}>
            <SkeletonListItem style={{ flex: 1 }} />
            <View style={{ width: Spacing.md }} />
            <SkeletonListItem style={{ flex: 1 }} />
          </View>
          <View style={{ height: Spacing.xl }} />
          <SkeletonCard />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}
        bounces={false}
      >
        <GradientHeader extraPaddingBottom={60}>
          <Animated.View
            key={`header-${animationKey}`}
            entering={FadeInDown.duration(400).springify()}
            style={styles.headerContent}
          >
            <Text style={styles.greetingText}>Halo, {firstName}! 👋</Text>
            <AnimatedPress
              onPress={handleBellPress}
              style={styles.notificationIcon}
            >
              <FontAwesome
                name="bell-o"
                size={22}
                color={Semantic.text.primary}
              />
              <Animated.View style={[styles.badge, badgeAnimatedStyle]} />
            </AnimatedPress>
          </Animated.View>
        </GradientHeader>

        <Animated.View
          key={`main-${animationKey}`}
          entering={FadeInUp.delay(100).springify()}
          style={styles.mainContent}
        >
          {/* Point Card */}
          <AnimatedPress onPress={toggleExpand} scaleDown={0.98}>
            <GlassCard dark style={styles.pointCard}>
              <View style={styles.pointHeader}>
                {Platform.OS === "ios" ? (
                  <BlurView
                    intensity={20}
                    tint="light"
                    style={styles.glassBadge}
                  >
                    <Text style={styles.levelText}>{getLevelName()}</Text>
                  </BlurView>
                ) : (
                  <View
                    style={[
                      styles.glassBadge,
                      { backgroundColor: Components.glass.bgStrong },
                    ]}
                  >
                    <Text style={styles.levelText}>{getLevelName()}</Text>
                  </View>
                )}
                <FontAwesome
                  name="leaf"
                  size={24}
                  color={Components.iconWrapper.success.bg}
                />
              </View>

              <View style={styles.pointContent}>
                <View style={styles.pointLabelRow}>
                  <View style={styles.smallCoinIcon}>
                    <Text style={styles.smallCoinText}>P</Text>
                  </View>
                  <Text style={styles.pointLabel}>Total Poin Saat Ini</Text>
                </View>

                <AnimatedCounter value={totalPoin} style={styles.pointValue} />
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                  <Animated.View
                    style={[styles.progressBarFill, progressAnimatedStyle]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {totalPoin >= 50000
                    ? "Rank Maksimal Tercapai! Sultan RVM 🎉"
                    : `${totalPoin} / ${targetPoints} Poin menuju level berikutnya`}
                </Text>
              </View>

              {isExpanded && (
                <Animated.View
                  entering={FadeInDown.springify()}
                  exiting={FadeOutUp}
                  style={styles.expandedContent}
                >
                  <View style={styles.divider} />
                  <Text style={styles.expandedTitle}>Keuntungan Tiap Rank</Text>
                  {GAMIFICATION_TIERS.map((tier, index) => (
                    <Animated.View
                      key={index}
                      entering={FadeIn.delay(index * 50)}
                      style={styles.rankRow}
                    >
                      <View>
                        <Text style={styles.rankName}>{tier.name}</Text>
                        <Text style={styles.rankReq}>Butuh {tier.req}</Text>
                      </View>
                      <View style={styles.benefitBadge}>
                        <Text style={styles.benefitText}>{tier.benefit}</Text>
                      </View>
                    </Animated.View>
                  ))}
                </Animated.View>
              )}

              <View style={styles.expandHintRow}>
                <Text style={styles.expandHintText}>
                  {isExpanded
                    ? "Tutup Info Rank"
                    : "Lihat Info Rank & Keuntungan"}
                </Text>
                <FontAwesome
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={10}
                  color={Semantic.text.light}
                  style={{ opacity: 0.7 }}
                />
              </View>
            </GlassCard>
          </AnimatedPress>

          <View style={{ height: Spacing.xl }} />

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <Animated.View
              entering={FadeInUp.delay(200).springify()}
              style={{ flex: 1 }}
            >
              <AnimatedPress style={styles.statBoxSmall}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: Components.iconWrapper.info.bg },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="bottle-soda-classic-outline"
                    size={28}
                    color={Components.iconWrapper.info.color}
                  />
                </View>
                <AnimatedCounter
                  value={totalPlastik}
                  style={styles.statNumber}
                />
                <Text style={styles.statLabel}>Plastik Disetor</Text>
              </AnimatedPress>
            </Animated.View>

            <View style={{ width: Spacing.md }} />

            <Animated.View
              entering={FadeInUp.delay(300).springify()}
              style={{ flex: 1 }}
            >
              <AnimatedPress style={styles.statBoxSmall}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: Components.iconWrapper.info.bg },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="cylinder"
                    size={28}
                    color={Components.iconWrapper.info.color}
                  />
                </View>
                <AnimatedCounter value={totalLogam} style={styles.statNumber} />
                <Text style={styles.statLabel}>Logam Disetor</Text>
              </AnimatedPress>
            </Animated.View>
          </View>

          <View style={{ height: Spacing.xl }} />

          {/* Consistency Card */}
          <Animated.View entering={FadeInUp.delay(400).springify()}>
            <GlassCard
              style={styles.consistencyCard}
              intensity={100}
              dark={false}
            >
              <View style={styles.consistencyHeader}>
                <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                  <AnimatedCounter
                    value={hariKonsisten}
                    style={styles.consistencyValue}
                  />
                  {hariKonsisten <= 7 && (
                    <Text style={styles.consistencyMax}>/7</Text>
                  )}
                  <Text style={styles.consistencyUnit}>Hari</Text>
                </View>

                <View style={styles.streakBadge}>
                  <MaterialCommunityIcons
                    name="fire"
                    size={20}
                    color={Semantic.danger.main}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.streakText}>Streak</Text>
                </View>
              </View>

              <View style={styles.progressBarWrapper}>
                <View style={styles.consistencyBarBg}>
                  <Animated.View
                    style={[
                      styles.consistencyBarFillContainer,
                      streakAnimatedStyle,
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        Colors.warning[100],
                        Semantic.warning.main,
                        Semantic.danger.main,
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </Animated.View>
                </View>

                <Animated.View
                  style={[
                    styles.fireIconContainer,
                    { left: `${Math.min((hariKonsisten / 7) * 100, 92)}%` },
                    fireAnimatedStyle,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="fire"
                    size={48}
                    color={Semantic.danger.main}
                    style={styles.giantFire}
                  />
                </Animated.View>
              </View>

              <Text style={styles.consistencyTitle}>
                {hariKonsisten >= 7
                  ? "Pencapaian Luar Biasa! Terus Pertahankan 🔥"
                  : "Target Konsistensi 7 Hari"}
              </Text>
            </GlassCard>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Semantic.background.secondary,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.xxl,
    color: Semantic.text.light,
  },
  notificationIcon: {
    padding: Spacing.sm,
    backgroundColor: Semantic.background.primary,
    borderRadius: BorderRadius.full,
    ...Shadows.md,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 8,
    width: 10,
    height: 10,
    backgroundColor: Semantic.danger.main,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Semantic.background.primary,
  },
  mainContent: {
    marginTop: -40,
    paddingHorizontal: Spacing.xl,
  },
  pointCard: {
    padding: Spacing.xl,
    backgroundColor: Gradients.primary[1], // fallback
  },
  pointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  glassBadge: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Components.glass.border,
  },
  levelText: {
    fontFamily: Typography.fontFamily.secondary,
    color: Semantic.text.light,
    fontSize: Typography.size.sm,
  },
  pointContent: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: Spacing.md,
  },
  pointLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: -5,
  },
  smallCoinIcon: {
    width: 16,
    height: 16,
    borderRadius: BorderRadius.sm,
    backgroundColor: Semantic.warning.main,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.xs,
  },
  smallCoinText: {
    fontFamily: Typography.fontFamily.interBold,
    fontSize: Typography.size.xs,
    color: Semantic.text.light,
  },
  pointLabel: {
    fontFamily: Typography.fontFamily.inter,
    color: Components.iconWrapper.success.bg,
    fontSize: Typography.size.sm,
  },
  pointValue: {
    fontFamily: Typography.fontFamily.interBold,
    color: Semantic.text.light,
    fontSize: Typography.size.hero,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  progressContainer: {
    marginTop: Spacing.md,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Semantic.background.primary,
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontFamily: Typography.fontFamily.interMedium,
    color: Components.card.border,
    fontSize: 11,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  expandedContent: {
    marginTop: Spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: Spacing.md,
  },
  expandedTitle: {
    fontFamily: Typography.fontFamily.secondary,
    color: Semantic.text.light,
    fontSize: Typography.size.base,
    marginBottom: Spacing.md,
  },
  rankRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  rankName: {
    fontFamily: Typography.fontFamily.secondary,
    color: Semantic.text.light,
    fontSize: Typography.size.sm,
  },
  rankReq: {
    fontFamily: Typography.fontFamily.inter,
    color: Components.iconWrapper.success.bg,
    fontSize: 11,
    marginTop: 2,
  },
  benefitBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  benefitText: {
    fontFamily: Typography.fontFamily.interBold,
    color: Semantic.text.light,
    fontSize: 11,
  },
  expandHintRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  expandHintText: {
    fontFamily: Typography.fontFamily.interMedium,
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 11,
    marginRight: 6,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statBoxSmall: {
    backgroundColor: Semantic.background.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    ...Shadows.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statNumber: {
    fontFamily: Typography.fontFamily.interBold,
    fontSize: Typography.size.xl,
    color: Semantic.text.primary,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: Typography.size.sm,
    color: Semantic.text.secondary,
    marginTop: 2,
  },
  consistencyCard: {
    backgroundColor: Semantic.background.primary,
    padding: Spacing.lg,
  },
  consistencyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: Spacing.md,
  },
  consistencyValue: {
    fontFamily: Typography.fontFamily.interBold,
    fontSize: Typography.size.display,
    color: Semantic.text.primary,
  },
  consistencyMax: {
    fontSize: Typography.size.md,
    color: Semantic.text.muted,
    marginBottom: 4,
  },
  consistencyUnit: {
    fontFamily: Typography.fontFamily.interMedium,
    fontSize: Typography.size.base,
    color: Semantic.warning.main,
    marginBottom: 6,
    marginLeft: Spacing.xs,
  },
  progressBarWrapper: {
    position: "relative",
    justifyContent: "center",
    height: 50,
    marginBottom: Spacing.sm,
  },
  consistencyBarBg: {
    width: "100%",
    height: 12,
    backgroundColor: Colors.warning[100],
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  consistencyBarFillContainer: {
    height: "100%",
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  fireIconContainer: {
    position: "absolute",
    transform: [{ translateX: -24 }],
    alignItems: "center",
    justifyContent: "center",
  },
  giantFire: {
    textShadowColor: "rgba(239, 68, 68, 0.4)",
    textShadowRadius: 12,
  },
  consistencyTitle: {
    fontFamily: Typography.fontFamily.interMedium,
    fontSize: Typography.size.sm,
    color: Semantic.text.secondary,
    textAlign: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.red[50],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    marginBottom: 6,
  },
  streakText: {
    fontFamily: Typography.fontFamily.interBold,
    fontSize: Typography.size.sm,
    color: Semantic.danger.main,
  },
});
