import { AnimatedPress } from "@/components/ui/animated-press";
import {
  BorderRadius,
  Colors,
  Semantic,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "../../firebaseConfig";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const getBgColor = () => (isDark ? "#0B1118" : "#F1F5F9");
  const getCardBg = () =>
    isDark ? "rgba(30, 41, 59, 0.85)" : "rgba(255, 255, 255, 0.85)";
  const getTextColor = () =>
    isDark ? Semantic.text.light : Semantic.text.primary;
  const getMutedColor = () =>
    isDark ? Colors.obsidian[400] : Semantic.text.secondary;
  const getBorderColor = () =>
    isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.8)";
  const getInputBg = () => (isDark ? Colors.obsidian[950] : Colors.neutral[50]);

  const blob1X = useSharedValue(0);
  const blob2X = useSharedValue(0);

  useEffect(() => {
    blob1X.value = withRepeat(
      withTiming(80, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    blob2X.value = withRepeat(
      withTiming(-80, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [blob1X, blob2X]);

  const animatedBlob1 = useAnimatedStyle(() => ({
    transform: [{ translateX: blob1X.value }, { scale: 1.5 }],
  }));
  const animatedBlob2 = useAnimatedStyle(() => ({
    transform: [{ translateX: blob2X.value }, { scale: 1.5 }],
  }));

  const blurTint = isDark ? "dark" : "light";

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email dan password harus diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Email atau password salah");
      } else {
        setError("Terjadi kesalahan: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1, backgroundColor: getBgColor() }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: 0.9 }, animatedBlob1]}
        >
          <LinearGradient
            colors={[
              isDark ? "rgba(16, 185, 129, 0.4)" : "rgba(16, 185, 129, 0.25)",
              "transparent",
            ]}
            style={{
              position: "absolute",
              width: 400,
              height: 400,
              top: -50,
              left: -100,
              borderRadius: 200,
            }}
          />
        </Animated.View>
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: 0.9 }, animatedBlob2]}
        >
          <LinearGradient
            colors={[
              isDark ? "rgba(245, 158, 11, 0.3)" : "rgba(245, 158, 11, 0.2)",
              "transparent",
            ]}
            style={{
              position: "absolute",
              width: 350,
              height: 350,
              bottom: -50,
              right: -100,
              borderRadius: 175,
            }}
          />
        </Animated.View>
        {Platform.OS !== "android" && (
          <BlurView
            intensity={isDark ? 50 : 80}
            tint={blurTint}
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: Spacing.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={{ alignItems: "center", marginBottom: 40 }}
        >
          <Image 
            source={require('../../../assets/images/valo-logo-text.png')} 
            style={{ width: 160, height: 60, marginBottom: Spacing.md }} 
            resizeMode="contain" 
          />
          <Text style={[styles.title, { color: getTextColor() }]}>
            Masuk ke VALO
          </Text>
          <Text style={[styles.subtitle, { color: getMutedColor() }]}>
            Tukar sampah jadikan berkah
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(200).duration(500)}
          style={[
            styles.card,
            { backgroundColor: getCardBg(), borderColor: getBorderColor() },
          ]}
        >
          {error ? (
            <View
              style={[styles.errorBox, { backgroundColor: Colors.red[50] }]}
            >
              <Feather
                name="alert-circle"
                size={16}
                color={Semantic.danger.main}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: getTextColor() }]}>Email</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: getInputBg(),
                  borderColor: getBorderColor(),
                },
              ]}
            >
              <Feather
                name="mail"
                size={20}
                color={getMutedColor()}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: getTextColor() }]}
                placeholder="Masukkan email"
                placeholderTextColor={getMutedColor()}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: getTextColor() }]}>
              Password
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: getInputBg(),
                  borderColor: getBorderColor(),
                },
              ]}
            >
              <Feather
                name="lock"
                size={20}
                color={getMutedColor()}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: getTextColor() }]}
                placeholder="Masukkan password"
                placeholderTextColor={getMutedColor()}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <AnimatedPress
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color={getMutedColor()}
                />
              </AnimatedPress>
            </View>
          </View>

          <AnimatedPress
            style={styles.forgotBtn}
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            <Text style={[styles.forgotText, { color: Semantic.primary.main }]}>
              Lupa Sandi?
            </Text>
          </AnimatedPress>

          <AnimatedPress
            style={[
              styles.loginBtn,
              { backgroundColor: Semantic.primary.main },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginBtnText}>Masuk</Text>
            )}
          </AnimatedPress>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.footer}
        >
          <Text style={[styles.footerText, { color: getMutedColor() }]}>
            Belum punya akun?{" "}
          </Text>
          <AnimatedPress onPress={() => router.push("/(auth)/register")}>
            <Text style={[styles.footerLink, { color: Semantic.primary.main }]}>
              Daftar Sekarang
            </Text>
          </AnimatedPress>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
    shadowColor: Colors.emerald[500],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: 16,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    ...Shadows.md,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  errorText: {
    color: Semantic.danger.main,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: Typography.fontFamily.inter,
    fontSize: 14,
    height: "100%",
  },
  eyeBtn: {
    padding: Spacing.xs,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: Spacing.lg,
  },
  forgotText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
  },
  loginBtn: {
    height: 52,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.sm,
    shadowColor: Colors.emerald[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    color: "#FFF",
    fontFamily: Typography.fontFamily.primary,
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.xxl,
  },
  footerText: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: 14,
  },
  footerLink: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
  },
});
