import {
  BorderRadius,
  Colors,
  Semantic,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import {
  collection,
  doc,
  getAggregateFromServer,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  sum,
  updateDoc,
  where
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import Animated, {
  Extrapolate,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOutUp,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../AuthContext";
import { db } from "../../firebaseConfig";

// Context
import { usePoints } from "../../PointContext";

// UI Components
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { AnimatedPress } from "@/components/ui/animated-press";
import { SkeletonCard, SkeletonListItem } from "@/components/ui/skeleton";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";

const GAMIFICATION_TIERS = [
  { name: "✨ Radiant Recycler", req: "50.000+ pts", benefit: "+20% Poin" },
  { name: "🛡️ Elderwood Guardian", req: "25.000 pts", benefit: "+15% Poin" },
  { name: "🌳 Sylvan Sapling", req: "10.000 pts", benefit: "+10% Poin" },
  { name: "🌿 Verdant Sprout", req: "2.500 pts", benefit: "+5% Poin" },
  { name: "🌱 Pebble Seed", req: "0 pts", benefit: "Normal (1x)" },
];

export default function HomeScreen() {
  const { user, userData } = useAuth();
  const { ts } = useLocalSearchParams();
  const animationKey = ts ? String(ts) : "default";

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const {
    totalPoin,
    totalPlastik,
    totalLogam,
    hariKonsisten,
    misiMingguanProgress,
    loading,
  } = usePoints();
  const [isExpanded, setIsExpanded] = useState(false);

  const getStartOfWeekMonday7AM = () => {
    const current = new Date();
    const day = current.getDay();
    const hours = current.getHours();
    let daysToSubtract =
      day === 0 ? 6 : day === 1 ? (hours < 7 ? 7 : 0) : day - 1;
    const monday = new Date(current);
    monday.setDate(monday.getDate() - daysToSubtract);
    monday.setHours(7, 0, 0, 0);
    return monday.getTime();
  };

  const startOfWeek = getStartOfWeekMonday7AM();
  const lastClaimed = userData?.last_misi_claimed
    ? userData.last_misi_claimed.toMillis
      ? userData.last_misi_claimed.toMillis()
      : userData.last_misi_claimed
    : 0;
  const isMissionClaimed = lastClaimed >= startOfWeek;

  const [cooldownText, setCooldownText] = useState("");

  // --- WEEKLY MISSION COOLDOWN TIMER ---
  useEffect(() => {
    if (!isMissionClaimed) return;

    const targetTime = startOfWeek + 7 * 24 * 60 * 60 * 1000;

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setCooldownText("00:00:00");
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      if (d > 0) {
        setCooldownText(`${d}h ${h}j ${m}m`);
      } else {
        setCooldownText(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isMissionClaimed, startOfWeek]);

  // --- WEEKLY MISSION CLAIM ---
  useEffect(() => {
    const claimMission = async () => {
      if (!user || !userData) return;
      if (misiMingguanProgress >= 20 && !isMissionClaimed) {
        try {
          const { generateChronologicalId } = require("../../firebaseConfig");
          const { setDoc, Timestamp } = require("firebase/firestore");

          // 1. Update user document
          await updateDoc(doc(db, "Users", user.uid), {
            poin: (userData.poin || 0) + 500,
            last_misi_claimed: Timestamp.now(),
          });

          // 2. Add to Riwayat
          const riwayatId = generateChronologicalId(Date.now());
          await setDoc(doc(db, "Users", user.uid, "Riwayat", riwayatId), {
            judul: "Hadiah Misi Mingguan",
            tipe: "misi_mingguan",
            poin: 500,
            plastik: 0,
            logam: 0,
            tanggal: Timestamp.now(),
          });

          // 3. Add to Notifications
          const notifId = generateChronologicalId(Date.now() + 1);
          await setDoc(doc(db, "Users", user.uid, "Notifications", notifId), {
            title: "Misi Mingguan Selesai! 🎉",
            message:
              "Selamat! Kamu telah menyelesaikan misi kumpulkan 20 Botol Plastik minggu ini dan mendapatkan +500 Poin.",
            desc: "Selamat! Kamu telah menyelesaikan misi kumpulkan 20 Botol Plastik minggu ini dan mendapatkan +500 Poin.",
            time: Timestamp.now(),
            icon: "bullseye",
            color_type: "success",
            isRead: false,
            type: "mission",
          });
        } catch (e) {
          console.error("Failed to claim mission", e);
        }
      }
    };
    claimMission();
  }, [misiMingguanProgress, isMissionClaimed, user, userData]);

  // --- LEADERBOARD & GLOBAL STATS STATE ---
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [globalPlastik, setGlobalPlastik] = useState(1); // default 1 to avoid div by zero
  const [globalLogam, setGlobalLogam] = useState(1);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersRef = collection(db, "Users");

        // 1. Fetch Top Users (Ambil 5, filter admin agar tidak masuk leaderboard, lalu ambil 3)
        const topQ = query(usersRef, orderBy("poin", "desc"), limit(5));
        const topSnap = await getDocs(topQ);
        const topData = topSnap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          // Sembunyikan jika role adalah admin
          .filter(
            (u: any) =>
              u.role !== "admin" && u.Role !== "Admin" && u.Role !== "admin",
          )
          .slice(0, 3); // Ambil persis 3 teratas

        setTopUsers(topData);

        // 2. Fetch User Rank (Count users who have more points)
        if (userData?.poin !== undefined) {
          const rankQ = query(usersRef, where("poin", ">", userData.poin));
          const rankSnap = await getCountFromServer(rankQ);
          setUserRank(rankSnap.data().count + 1);
        }

        // 3. Fetch Global Aggregates (Dipisah agar tidak error butuh Composite Index di Firebase)
        const sumPlastikSnap = await getAggregateFromServer(usersRef, {
          total: sum("total_plastik"),
        });
        const sumLogamSnap = await getAggregateFromServer(usersRef, {
          total: sum("total_logam"),
        });

        setGlobalPlastik(sumPlastikSnap.data().total || 1);
        setGlobalLogam(sumLogamSnap.data().total || 1);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    if (userData) {
      fetchStats();
    }
  }, [userData]);

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

  const firstName = (userData?.displayName || "Pengguna").split(" ")[0];

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

  const progressWidth = useSharedValue(0);
  useEffect(() => {
    progressWidth.value = withTiming(progressPercentage, { duration: 500 });
  }, [progressPercentage]);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // Sticky Header Scroll Animation
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 50],
      [0, 1],
      Extrapolate.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [0, 50],
      [-20, 0],
      Extrapolate.CLAMP,
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const headerOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 50],
      [1, 0],
      Extrapolate.CLAMP,
    );
    return { opacity };
  });

  const getBgColor = () =>
    isDark ? Semantic.background.dark : Semantic.background.secondary;
  const getCardBg = () =>
    isDark ? Colors.obsidian[800] : Semantic.background.primary;
  const getTextColor = () =>
    isDark ? Semantic.text.light : Semantic.text.primary;
  const getMutedColor = () =>
    isDark ? Colors.obsidian[400] : Semantic.text.secondary;

  const hour = new Date().getHours();
  let timeGreeting = "Halo";
  if (hour < 11) timeGreeting = "Selamat Pagi";
  else if (hour < 15) timeGreeting = "Selamat Siang";
  else if (hour < 18) timeGreeting = "Selamat Sore";
  else timeGreeting = "Selamat Malam";

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: getBgColor() }]}>
        <View style={{ height: insets.top + 20 }} />
        <View style={{ paddingHorizontal: Spacing.xl }}>
          <SkeletonCard />
          <View style={{ height: Spacing.xl }} />
          <View style={styles.statsRow}>
            <SkeletonListItem style={{ flex: 1 }} />
            <View style={{ width: Spacing.md }} />
            <SkeletonListItem style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    );
  }

  // Menghitung dampak ekologis (Asumsi: 1 Botol = 0.05kg CO2 hemat, 1 Kaleng = 0.1kg CO2 hemat)
  const co2Saved = (totalPlastik * 0.05 + totalLogam * 0.1).toFixed(2);

  return (
    <View style={[styles.container, { backgroundColor: getBgColor() }]}>
      {/* BACKGROUND DECORATIVE BLOBS */}
      <View style={styles.bgBlobRight}>
        <LinearGradient
          colors={[
            isDark ? "rgba(16, 185, 129, 0.35)" : "rgba(16, 185, 129, 0.45)",
            "transparent",
          ]}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={styles.bgBlobLeft}>
        <LinearGradient
          colors={[
            isDark ? "rgba(52, 211, 153, 0.25)" : "rgba(16, 185, 129, 0.3)",
            "transparent",
          ]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* STICKY HEADER (Appears on scroll) */}
      <Animated.View
        style={[
          styles.stickyHeader,
          {
            paddingTop: insets.top,
            backgroundColor: isDark
              ? "rgba(11, 17, 24, 0.85)"
              : "rgba(248, 250, 252, 0.85)",
          },
          headerStyle,
        ]}
      >
        <BlurView
          intensity={isDark ? 50 : 80}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.stickyHeaderContent}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.avatarMini}>
              <FontAwesome name="user" size={16} color={Semantic.text.light} />
            </View>
            <View style={{ marginLeft: Spacing.sm }}>
              <Text style={[styles.stickyGreeting, { color: getTextColor() }]}>
                {timeGreeting}, {firstName}!
              </Text>
              <Text style={styles.stickyRank}>{getLevelName()}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}
        bounces={true}
      >
        <View style={{ height: insets.top + Spacing.xl }} />

        {/* NORMAL HEADER (Fades out on scroll) */}
        <Animated.View
          style={[
            styles.normalHeader,
            headerOpacityStyle,
            { paddingHorizontal: Spacing.xl },
          ]}
        >
          <View>
            <Text style={[styles.greetingText, { color: getTextColor() }]}>
              {timeGreeting}, {firstName}
            </Text>
            <View style={styles.badgeRankRow}>
              <Text style={styles.badgeRankText}>{getLevelName()}</Text>
            </View>
          </View>
          <AnimatedPress
            onPress={handleBellPress}
            style={[styles.notificationIcon, { backgroundColor: getCardBg() }]}
          >
            <FontAwesome name="bell-o" size={20} color={getTextColor()} />
            <Animated.View style={[styles.badge, badgeAnimatedStyle]} />
          </AnimatedPress>
        </Animated.View>

        <Animated.View
          key={`main-${animationKey}`}
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.mainContent}
        >
          {/* 1. KARTU POIN (Bento Full Width) */}
          <AnimatedPress onPress={toggleExpand} scaleDown={0.98}>
            <View style={[styles.bentoCard, { backgroundColor: getCardBg() }]}>
              {/* Saldo Poin & Tombol Tukar */}
              <View style={styles.pointHeaderBento}>
                <View>
                  <Text style={[styles.bentoLabel, { color: getMutedColor() }]}>
                    Total Poin Tersedia
                  </Text>
                  <View
                    style={{ flexDirection: "row", alignItems: "baseline" }}
                  >
                    <AnimatedCounter
                      value={totalPoin}
                      style={[
                        styles.bentoPointValue,
                        { color: getTextColor(), fontSize: 44, lineHeight: 52 },
                      ]}
                    />
                    <Text
                      style={[
                        styles.bentoPointSuffix,
                        { color: Semantic.primary.main, fontSize: 16 },
                      ]}
                    >
                      {" "}
                      Pts
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={styles.bentoTukarBtn}
                  onPress={() => router.push("/reward")}
                >
                  <Text style={styles.bentoTukarText}>Tukar</Text>
                </Pressable>
              </View>

              <View style={styles.progressContainerBento}>
                <View style={styles.bentoProgressBg}>
                  <Animated.View
                    style={[styles.bentoProgressFill, progressAnimatedStyle]}
                  >
                    <LinearGradient
                      colors={[Semantic.primary.light, Semantic.primary.main]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </Animated.View>
                </View>
                <Text
                  style={[styles.bentoProgressText, { color: getMutedColor() }]}
                >
                  {totalPoin >= 50000
                    ? "Rank Maksimal Tercapai!"
                    : `${targetPoints - totalPoin} Pts lagi ke rank berikutnya`}
                </Text>
              </View>

              {isExpanded && (
                <Animated.View
                  entering={FadeInDown.duration(400)}
                  exiting={FadeOutUp}
                  style={styles.expandedContent}
                >
                  <View
                    style={[
                      styles.divider,
                      {
                        backgroundColor: isDark
                          ? Colors.obsidian[800]
                          : Colors.obsidian[100],
                      },
                    ]}
                  />
                  <Text
                    style={[styles.expandedTitle, { color: getTextColor() }]}
                  >
                    Keuntungan Tiap Rank
                  </Text>
                  {GAMIFICATION_TIERS.map((tier, index) => (
                    <Animated.View
                      key={index}
                      entering={FadeIn.delay(index * 50)}
                      style={styles.rankRow}
                    >
                      <View>
                        <Text
                          style={[styles.rankName, { color: getTextColor() }]}
                        >
                          {tier.name}
                        </Text>
                        <Text
                          style={[styles.rankReq, { color: getMutedColor() }]}
                        >
                          Butuh {tier.req}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.benefitBadge,
                          {
                            backgroundColor: isDark
                              ? Colors.obsidian[800]
                              : Colors.emerald[50],
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.benefitText,
                            { color: Semantic.primary.main },
                          ]}
                        >
                          {tier.benefit}
                        </Text>
                      </View>
                    </Animated.View>
                  ))}
                </Animated.View>
              )}
            </View>
          </AnimatedPress>

          <View style={{ height: Spacing.md }} />

          {/* 2. BENTO GRID SPLIT (Plastik & Logam) */}
          <View style={styles.statsRow}>
            <Animated.View
              entering={FadeInUp.delay(200).duration(400)}
              style={{ flex: 1 }}
            >
              <AnimatedPress
                style={[styles.bentoBoxSmall, { backgroundColor: getCardBg() }]}
              >
                <View style={styles.bentoIconRow}>
                  <View
                    style={[
                      styles.bentoIconCircle,
                      { backgroundColor: Colors.emerald[50] },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="bottle-soda-classic-outline"
                      size={24}
                      color={Semantic.primary.main}
                    />
                  </View>
                  <Text
                    style={[styles.bentoBoxLabel, { color: getMutedColor() }]}
                  >
                    Plastik
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "baseline",
                    marginTop: Spacing.sm,
                  }}
                >
                  <AnimatedCounter
                    value={totalPlastik}
                    style={[
                      styles.bentoBoxValue,
                      { color: getTextColor(), fontSize: 28 },
                    ]}
                  />
                  <Text
                    style={[styles.bentoBoxSuffix, { color: getMutedColor() }]}
                  >
                    {" "}
                    item
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: Typography.fontFamily.body,
                    fontSize: 11,
                    color: Semantic.primary.main,
                    marginTop: 4,
                  }}
                >
                  {totalPlastik > 0
                    ? (
                        (totalPlastik / Math.max(globalPlastik, 1)) *
                        100
                      ).toFixed(2)
                    : 0}
                  % kontribusi global
                </Text>
              </AnimatedPress>
            </Animated.View>

            <View style={{ width: Spacing.md }} />

            <Animated.View
              entering={FadeInUp.delay(300).duration(400)}
              style={{ flex: 1 }}
            >
              <AnimatedPress
                style={[styles.bentoBoxSmall, { backgroundColor: getCardBg() }]}
              >
                <View style={styles.bentoIconRow}>
                  <View
                    style={[
                      styles.bentoIconCircle,
                      { backgroundColor: Colors.amber[50] },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="cylinder"
                      size={24}
                      color={Semantic.warning.main}
                    />
                  </View>
                  <Text
                    style={[styles.bentoBoxLabel, { color: getMutedColor() }]}
                  >
                    Logam
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "baseline",
                    marginTop: Spacing.sm,
                  }}
                >
                  <AnimatedCounter
                    value={totalLogam}
                    style={[
                      styles.bentoBoxValue,
                      { color: getTextColor(), fontSize: 28 },
                    ]}
                  />
                  <Text
                    style={[styles.bentoBoxSuffix, { color: getMutedColor() }]}
                  >
                    {" "}
                    item
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: Typography.fontFamily.body,
                    fontSize: 11,
                    color: Semantic.warning.main,
                    marginTop: 4,
                  }}
                >
                  {totalLogam > 0
                    ? ((totalLogam / Math.max(globalLogam, 1)) * 100).toFixed(2)
                    : 0}
                  % kontribusi global
                </Text>
              </AnimatedPress>
            </Animated.View>
          </View>

          <View style={{ height: Spacing.md }} />

          {/* 1.5 MISI MINGGUAN (Menggantikan RVM) */}
          <Animated.View entering={FadeInUp.delay(150).duration(400)}>
            <AnimatedPress
              style={[
                styles.bentoCard,
                { backgroundColor: getCardBg(), paddingVertical: Spacing.md },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={[
                    styles.bentoIconCircle,
                    { backgroundColor: Colors.teal[50] },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="target"
                    size={24}
                    color={Colors.teal[500]}
                  />
                </View>
                <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
                  <Text style={[styles.bentoLabel, { color: getMutedColor() }]}>
                    Misi Mingguan
                  </Text>
                  <Text style={[styles.rankName, { color: getTextColor() }]}>
                    Kumpulkan 20 Botol
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      fontFamily: Typography.fontFamily.primary,
                      fontSize: 16,
                      color: isMissionClaimed
                        ? getMutedColor()
                        : Semantic.primary.main,
                    }}
                  >
                    {Math.min(misiMingguanProgress, 20)}/20
                  </Text>
                  <Text
                    style={{
                      fontFamily: Typography.fontFamily.medium,
                      fontSize: 11,
                      color: isMissionClaimed
                        ? getMutedColor()
                        : Semantic.primary.main,
                    }}
                  >
                    {isMissionClaimed ? `Reset: ${cooldownText}` : "+500 Pts"}
                  </Text>
                </View>
              </View>
            </AnimatedPress>
          </Animated.View>

          <View style={{ height: Spacing.md }} />

          {/* 3. STREAK KONSISTENSI (Bento Style) */}
          <Animated.View entering={FadeInUp.delay(400).duration(400)}>
            <View style={[styles.bentoCard, { backgroundColor: getCardBg() }]}>
              <View style={styles.bentoStreakHeader}>
                <View>
                  <Text style={[styles.bentoLabel, { color: getMutedColor() }]}>
                    Konsistensi (Streak)
                  </Text>
                  <View
                    style={{ flexDirection: "row", alignItems: "baseline" }}
                  >
                    <AnimatedCounter
                      value={hariKonsisten}
                      style={[
                        styles.bentoPointValue,
                        { color: getTextColor() },
                      ]}
                    />
                    <Text
                      style={[
                        styles.bentoBoxSuffix,
                        {
                          color: getMutedColor(),
                          fontSize: Typography.size.md,
                        },
                      ]}
                    >
                      {" "}
                      / 7 Hari
                    </Text>
                  </View>
                </View>
                <View style={styles.bentoStreakBadge}>
                  <MaterialCommunityIcons
                    name="fire"
                    size={16}
                    color={Semantic.danger.main}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.bentoStreakBadgeText}>Aktif</Text>
                </View>
              </View>

              {/* 7 Days UI representation */}
              <View style={styles.sevenDaysContainer}>
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const isActive = day <= hariKonsisten;
                  const isToday = day === hariKonsisten;
                  return (
                    <View
                      key={day}
                      style={[
                        styles.dayCircle,
                        isActive
                          ? styles.dayCircleActive
                          : {
                              backgroundColor: isDark
                                ? Colors.obsidian[800]
                                : Colors.obsidian[100],
                            },
                      ]}
                    >
                      {isActive ? (
                        <FontAwesome
                          name="check"
                          size={12}
                          color={Semantic.text.light}
                        />
                      ) : (
                        <Text
                          style={[
                            styles.dayCircleText,
                            { color: getMutedColor() },
                          ]}
                        >
                          {day}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </Animated.View>

          <View style={{ height: Spacing.md }} />

          {/* 4. LEADERBOARD (Top Recyclers) */}
          <Animated.View entering={FadeInUp.delay(500).duration(400)}>
            <View style={[styles.bentoCard, { backgroundColor: getCardBg() }]}>
              <View style={[styles.bentoIconRow, { marginBottom: Spacing.md }]}>
                <View
                  style={[
                    styles.bentoIconCircle,
                    { backgroundColor: Colors.amber[50] },
                  ]}
                >
                  <FontAwesome
                    name="trophy"
                    size={20}
                    color={Colors.amber[500]}
                  />
                </View>
                <View style={{ marginLeft: Spacing.sm }}>
                  <Text
                    style={[
                      styles.bentoBoxValue,
                      { color: getTextColor(), fontSize: Typography.size.lg },
                    ]}
                  >
                    Top Recyclers
                  </Text>
                </View>
              </View>

              {statsLoading ? (
                <Text style={{ color: getMutedColor(), textAlign: "center" }}>
                  Memuat peringkat...
                </Text>
              ) : (
                <View>
                  {topUsers.map((u, i) => (
                    <View
                      key={u.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: Spacing.sm,
                        paddingVertical: Spacing.xs,
                        borderBottomWidth: 1,
                        borderBottomColor: isDark
                          ? Colors.obsidian[800]
                          : Colors.obsidian[50],
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: Typography.fontFamily.primary,
                          fontSize: 16,
                          width: 30,
                          color:
                            i === 0
                              ? Colors.amber[500]
                              : i === 1
                                ? Colors.obsidian[400]
                                : i === 2
                                  ? "#cd7f32"
                                  : getMutedColor(),
                        }}
                      >
                        #{i + 1}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: Typography.fontFamily.medium,
                            fontSize: 14,
                            color: getTextColor(),
                          }}
                          numberOfLines={1}
                        >
                          {u.displayName || "Pengguna"}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontFamily: Typography.fontFamily.primary,
                          fontSize: 14,
                          color: Semantic.primary.main,
                        }}
                      >
                        {u.poin || 0} Pts
                      </Text>
                    </View>
                  ))}

                  {/* Current User Rank Position */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: Spacing.sm,
                      paddingTop: Spacing.xs,
                      backgroundColor: isDark
                        ? Colors.obsidian[900]
                        : Colors.emerald[50],
                      padding: Spacing.sm,
                      borderRadius: BorderRadius.md,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Typography.fontFamily.primary,
                        fontSize: 16,
                        width: 30,
                        color: getTextColor(),
                      }}
                    >
                      #{userRank > 0 ? userRank : "..."}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: Typography.fontFamily.medium,
                          fontSize: 14,
                          color: getTextColor(),
                        }}
                        numberOfLines={1}
                      >
                        Anda ({firstName})
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: Typography.fontFamily.primary,
                        fontSize: 14,
                        color: Semantic.primary.main,
                      }}
                    >
                      {totalPoin} Pts
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgBlobRight: {
    position: "absolute",
    top: -50,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.8,
  },
  bgBlobLeft: {
    position: "absolute",
    top: 200,
    left: -150,
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.6,
  },
  ecoTipBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  ecoTipText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  stickyHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Semantic.primary.main,
    alignItems: "center",
    justifyContent: "center",
  },
  stickyGreeting: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.size.sm,
  },
  stickyRank: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: Semantic.primary.main,
  },
  normalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  greetingText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.size.xl,
  },
  badgeRankRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  badgeRankText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Semantic.warning.main,
    marginLeft: 4,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: Semantic.danger.main,
    borderRadius: BorderRadius.full,
  },
  mainContent: {
    paddingHorizontal: Spacing.xl,
  },
  bentoCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  pointHeaderBento: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bentoLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    marginBottom: 4,
  },
  bentoPointValue: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: 32,
    lineHeight: 38,
  },
  bentoPointSuffix: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.size.md,
    alignSelf: "flex-end",
    marginBottom: 6,
    marginLeft: 4,
  },
  bentoTukarBtn: {
    backgroundColor: Semantic.primary.main,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  bentoTukarText: {
    color: Semantic.text.light,
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.size.sm,
  },
  progressContainerBento: {
    marginTop: Spacing.md,
  },
  bentoProgressBg: {
    height: 6,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  bentoProgressFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  bentoProgressText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    marginTop: Spacing.sm,
  },
  expandedContent: {
    marginTop: Spacing.md,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.md,
  },
  expandedTitle: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.size.sm,
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
    fontSize: Typography.size.sm,
  },
  rankReq: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    marginTop: 2,
  },
  benefitBadge: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  benefitText: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: 11,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bentoBoxSmall: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  bentoIconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bentoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  bentoBoxLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    marginLeft: Spacing.sm,
  },
  bentoBoxValue: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: 24,
  },
  bentoBoxSuffix: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    marginLeft: 4,
  },
  bentoStreakHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bentoStreakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.red[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  bentoStreakBadgeText: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: 11,
    color: Semantic.danger.main,
  },
  sevenDaysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.lg,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleActive: {
    backgroundColor: Semantic.primary.main,
    ...Shadows.glow(Semantic.primary.main),
  },
  dayCircleText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
  },
});
