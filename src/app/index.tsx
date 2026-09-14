import { AnimatedPress } from "@/components/ui/animated-press";
import {
  BorderRadius,
  Colors,
  Semantic,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from "react-native";
import Animated, {
  FadeInDown,
  LinearTransition
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../AuthContext";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Ubah Sampah\nJadi Cuan",
    desc: "Setorkan botol plastik dan logammu ke mesin EcoPoint dan kumpulkan poin setiap hari.",
    icon: "recycle",
    color: Colors.emerald[500],
  },
  {
    id: "2",
    title: "Selamatkan\nBumi Kita",
    desc: "Bantu kurangi jejak karbon dan dukung lingkungan yang lebih bersih untuk generasi masa depan.",
    icon: "earth",
    color: Colors.emerald[600],
  },
  {
    id: "3",
    title: "Nikmati\nHadiahnya",
    desc: "Tukarkan poin yang kamu kumpulkan dengan voucher belanja, pulsa, dan banyak lagi!",
    icon: "gift-outline",
    color: Colors.amber[500],
  },
];

export default function OnboardingScreen() {
  const { user, loading: authLoading } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const value = await AsyncStorage.getItem("@has_completed_onboarding");
        if (value === "true") {
          setIsFirstLaunch(false);
        } else {
          setIsFirstLaunch(true);
        }
      } catch (err) {
        setIsFirstLaunch(true);
      }
    }
    checkOnboarding();
  }, []);

  if (authLoading || isFirstLaunch === null) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDark
            ? Semantic.background.dark
            : Semantic.background.primary,
        }}
      />
    );
  }

  // If already logged in, go to tabs
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // If completed onboarding but not logged in, go to login
  if (!isFirstLaunch) {
    return <Redirect href="/(auth)/login" />;
  }

  const completeOnboarding = async () => {
    await AsyncStorage.setItem("@has_completed_onboarding", "true");
    router.replace("/(auth)/login");
  };

  const nextSlide = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  const getTextColor = () =>
    isDark ? Semantic.text.light : Semantic.text.primary;
  const getMutedColor = () =>
    isDark ? Colors.obsidian[400] : Semantic.text.secondary;

  const renderItem = ({
    item,
    index,
  }: {
    item: (typeof SLIDES)[0];
    index: number;
  }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={[styles.iconContainer, { backgroundColor: item.color + "20" }]}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={100}
            color={item.color}
          />
        </Animated.View>
        <Animated.Text
          entering={FadeInDown.delay(200).duration(500)}
          style={[styles.title, { color: getTextColor() }]}
        >
          {item.title}
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(300).duration(500)}
          style={[styles.desc, { color: getMutedColor() }]}
        >
          {item.desc}
        </Animated.Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? Semantic.background.dark
            : Semantic.background.primary,
        },
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={(ev) => {
          const idx = Math.round(ev.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
      />

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom + Spacing.lg, Spacing.xxl) },
        ]}
      >
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => (
            <Animated.View
              key={i}
              layout={LinearTransition.duration(300)}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    currentIndex === i
                      ? Semantic.primary.main
                      : isDark
                        ? Colors.obsidian[700]
                        : Colors.neutral[200],
                },
                currentIndex === i && { width: 24 },
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <AnimatedPress style={styles.skipBtn} onPress={completeOnboarding}>
            <Text style={[styles.skipText, { color: getMutedColor() }]}>
              Lewati
            </Text>
          </AnimatedPress>

          <AnimatedPress
            style={[styles.nextBtn, { backgroundColor: Semantic.primary.main }]}
            onPress={nextSlide}
          >
            <Text style={styles.nextText}>
              {currentIndex === SLIDES.length - 1 ? "Mulai" : "Lanjut"}
            </Text>
            <Feather
              name="arrow-right"
              size={20}
              color="#FFF"
              style={{ marginLeft: 8 }}
            />
          </AnimatedPress>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xxxl,
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xxxl,
  },
  title: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: 32,
    textAlign: "center",
    lineHeight: 40,
    marginBottom: Spacing.lg,
  },
  desc: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skipBtn: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
  skipText: { fontFamily: Typography.fontFamily.medium, fontSize: 16 },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.full,
    ...Shadows.sm,
  },
  nextText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: 16,
    color: "#FFF",
  },
});
