import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, useColorScheme, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { Colors, Semantic, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { AnimatedPress } from '@/components/ui/animated-press';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, LinearTransition, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleReset = async () => {
    if (!email) {
      setErrorMsg('Alamat email wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg('Tautan untuk mengatur ulang kata sandi telah dikirim ke email kamu.');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/user-not-found') {
        setErrorMsg('Email tidak terdaftar.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMsg('Format email tidak valid.');
      } else {
        setErrorMsg('Gagal mengirim email reset. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getBgColor = () => isDark ? "#0B1118" : "#F1F5F9";
  const getCardBg = () => isDark ? "rgba(30, 41, 59, 0.85)" : "rgba(255, 255, 255, 0.85)";
  const getTextColor = () => isDark ? Semantic.text.light : Semantic.text.primary;
  const getMutedColor = () => isDark ? Colors.obsidian[400] : Semantic.text.secondary;
  const getBorderColor = () => isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.8)";
  const getInputBg = () => isDark ? Colors.obsidian[900] : Colors.neutral[50];

  const blob1X = useSharedValue(0);
  const blob2X = useSharedValue(0);

  useEffect(() => {
    blob1X.value = withRepeat(withTiming(80, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true);
    blob2X.value = withRepeat(withTiming(-80, { duration: 5000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [blob1X, blob2X]);

  const animatedBlob1 = useAnimatedStyle(() => ({
    transform: [{ translateX: blob1X.value }, { scale: 1.5 }],
  }));
  const animatedBlob2 = useAnimatedStyle(() => ({
    transform: [{ translateX: blob2X.value }, { scale: 1.5 }],
  }));

  const blurTint = isDark ? "dark" : "light";

  return (
    <View style={[styles.container, { backgroundColor: getBgColor() }]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: 0.9 }, animatedBlob1]}>
          <LinearGradient colors={[isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.25)', 'transparent']} style={{ position: 'absolute', width: 400, height: 400, top: -50, left: -100, borderRadius: 200 }} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: 0.9 }, animatedBlob2]}>
          <LinearGradient colors={[isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)', 'transparent']} style={{ position: 'absolute', width: 350, height: 350, bottom: -50, right: -100, borderRadius: 175 }} />
        </Animated.View>
        {Platform.OS !== "android" && <BlurView intensity={isDark ? 50 : 80} tint={blurTint} style={StyleSheet.absoluteFill} />}
      </View>
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top + Spacing.xl, Spacing.xxxl * 2) }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.duration(600)} layout={LinearTransition.duration(300)}>
            <View style={styles.iconContainer}>
              <View style={[styles.iconBox, { backgroundColor: Colors.emerald[100] }]}>
                <Feather name="lock" size={32} color={Semantic.primary.main} />
              </View>
            </View>
            <Text style={[styles.title, { color: getTextColor() }]}>Lupa Sandi?</Text>
            <Text style={[styles.subtitle, { color: getMutedColor() }]}>
              Masukkan email yang terdaftar, kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(600)} layout={LinearTransition.duration(300)} style={[styles.formCard, { backgroundColor: getCardBg(), borderColor: getBorderColor(), borderWidth: isDark ? 1 : 0 }]}>
            
            {errorMsg && (
              <View style={[styles.alertBox, { backgroundColor: Colors.red[50], borderColor: Colors.red[200] }]}>
                <Feather name="alert-circle" size={16} color={Semantic.danger.main} />
                <Text style={[styles.alertText, { color: Semantic.danger.main }]}>{errorMsg}</Text>
              </View>
            )}

            {successMsg && (
              <View style={[styles.alertBox, { backgroundColor: Colors.emerald[50], borderColor: Colors.emerald[200] }]}>
                <Feather name="check-circle" size={16} color={Semantic.primary.main} />
                <Text style={[styles.alertText, { color: Semantic.primary.main }]}>{successMsg}</Text>
              </View>
            )}

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: getTextColor() }]}>Alamat Email</Text>
              <View style={[styles.inputWrapper, { backgroundColor: getInputBg(), borderColor: getBorderColor() }]}>
                <Feather name="mail" size={20} color={getMutedColor()} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: getTextColor() }]}
                  placeholder="contoh@email.com"
                  placeholderTextColor={getMutedColor()}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Submit Button */}
            <AnimatedPress 
              style={[styles.btnPrimary, { backgroundColor: Semantic.primary.main }]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.btnPrimaryText}>Kirim Tautan</Text>
              )}
            </AnimatedPress>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.footer}>
            <AnimatedPress onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={16} color={getMutedColor()} />
              <Text style={[styles.backText, { color: getMutedColor() }]}>Kembali ke Login</Text>
            </AnimatedPress>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerDecor: { position: 'absolute', top: 0, left: 0, right: 0, height: 250, borderBottomLeftRadius: 60, borderBottomRightRadius: 60 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
  iconContainer: { alignItems: 'center', marginBottom: Spacing.xl },
  iconBox: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFFFFF', ...Shadows.sm },
  title: { fontFamily: Typography.fontFamily.primary, fontSize: 28, textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { fontFamily: Typography.fontFamily.inter, fontSize: 14, textAlign: 'center', marginBottom: Spacing.xxl, paddingHorizontal: Spacing.xl, lineHeight: 22 },
  formCard: { borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.md },
  alertBox: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.lg },
  alertText: { fontFamily: Typography.fontFamily.medium, fontSize: 12, marginLeft: 8, flex: 1 },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontFamily: Typography.fontFamily.medium, fontSize: 14, marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, height: 52 },
  inputIcon: { marginRight: Spacing.md },
  input: { flex: 1, fontFamily: Typography.fontFamily.inter, fontSize: 14, height: '100%' },
  btnPrimary: { height: 52, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.md, ...Shadows.sm },
  btnPrimaryText: { fontFamily: Typography.fontFamily.primary, color: '#FFFFFF', fontSize: 16 },
  footer: { marginTop: Spacing.xl, alignItems: 'center' },
  backBtn: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  backText: { fontFamily: Typography.fontFamily.medium, fontSize: 14, marginLeft: Spacing.sm },
});
