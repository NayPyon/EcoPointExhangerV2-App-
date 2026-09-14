import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, LayoutAnimation, Platform, UIManager, Linking } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors, Semantic, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { AnimatedPress } from '@/components/ui/animated-press';
import { useAuth } from '../AuthContext';

const FAQS = [
  {
    question: "Bagaimana cara menukarkan poin?",
    answer: "Kamu bisa menukarkan poin di halaman 'Reward'. Pilih voucher yang kamu inginkan, lalu klik 'Tukar Poin'. Pastikan saldo poinmu cukup ya!"
  },
  {
    question: "Di mana saya bisa menyetor sampah?",
    answer: "Kamu bisa menyetor botol plastik dan kaleng logam di mesin RVM (Reverse Vending Machine) EcoPoint yang tersebar di berbagai titik stasiun dan mall."
  },
  {
    question: "Berapa poin yang didapat per botol?",
    answer: "Saat ini, 1 botol plastik bernilai 100 poin, dan 1 kaleng logam bernilai 300 poin."
  },
  {
    question: "Mengapa akun saya ter-logout sendiri?",
    answer: "Untuk alasan keamanan, sesi akun akan berakhir jika tidak ada aktivitas selama 30 hari. Silakan login kembali menggunakan email kamu."
  }
];

export default function HelpCenterScreen() {
  const { userData } = useAuth();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const getBgColor = () => isDark ? Semantic.background.dark : Semantic.background.secondary;
  const getCardBg = () => isDark ? Colors.obsidian[800] : Semantic.background.primary;
  const getTextColor = () => isDark ? Semantic.text.light : Semantic.text.primary;
  const getMutedColor = () => isDark ? Colors.obsidian[400] : Semantic.text.secondary;
  const getBorderColor = () => isDark ? Colors.obsidian[700] : Semantic.border.light;

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={[styles.container, { backgroundColor: getBgColor() }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, backgroundColor: getBgColor(), borderBottomColor: getBorderColor() }]}>
        <AnimatedPress onPress={() => router.back()} style={[styles.backButton, { backgroundColor: isDark ? Colors.obsidian[800] : Semantic.background.primary }]}>
          <FontAwesome name="arrow-left" size={18} color={getTextColor()} />
        </AnimatedPress>
        <Text style={[styles.headerTitle, { color: getTextColor() }]}>Pusat Bantuan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.contactCard, { backgroundColor: isDark ? Colors.obsidian[950] : Semantic.background.tertiary, borderColor: getBorderColor(), borderWidth: isDark ? 1 : 0 }]}>
          <View style={[styles.iconBox, { backgroundColor: isDark ? Colors.obsidian[800] : Colors.emerald[50] }]}>
            <MaterialCommunityIcons name="headset" size={28} color={Semantic.success.main} />
          </View>
          <View style={styles.contactText}>
            <Text style={[styles.contactTitle, { color: getTextColor() }]}>Butuh Bantuan Langsung?</Text>
            <Text style={[styles.contactDesc, { color: getMutedColor() }]}>Tim kami siap membantu kendala kamu 24/7.</Text>
          </View>
          <AnimatedPress 
            style={styles.contactButton}
            onPress={() => {
              const waNumber = "6281337752077";
              const waMessage = `Halo Tim EcoPoint! 🌱\n\nKenalkan, saya ${userData?.displayName || 'Pengguna'}.\nSaya mau minta tolong/bertanya seputar aplikasi EcoPoint nih.`;
              Linking.openURL(`https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`);
            }}
          >
            <Text style={styles.contactButtonText}>Chat CS</Text>
          </AnimatedPress>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(150).duration(400)} style={[styles.sectionTitle, { color: getTextColor() }]}>
          Pertanyaan Populer
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          {FAQS.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <AnimatedPress 
                key={index} 
                style={[styles.faqCard, { backgroundColor: getCardBg(), borderColor: getBorderColor() }]} 
                onPress={() => toggleExpand(index)}
                haptic={false}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQuestion, { color: getTextColor() }]}>{faq.question}</Text>
                  <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={getMutedColor()} />
                </View>
                {isExpanded && (
                  <Text style={[styles.faqAnswer, { color: getMutedColor() }]}>{faq.answer}</Text>
                )}
              </AnimatedPress>
            );
          })}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: Spacing.lg, paddingHorizontal: Spacing.xl, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: Typography.fontFamily.primary, fontSize: 18 },
  scrollContent: { padding: Spacing.xl, paddingBottom: 100 },
  
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Semantic.background.tertiary, padding: Spacing.lg, borderRadius: BorderRadius.xl, marginBottom: Spacing.xxl },
  iconBox: { width: 48, height: 48, borderRadius: BorderRadius.lg, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  contactText: { flex: 1 },
  contactTitle: { fontFamily: Typography.fontFamily.secondary, fontSize: 14, marginBottom: 2 },
  contactDesc: { fontFamily: Typography.fontFamily.inter, fontSize: 12 },
  contactButton: { backgroundColor: Semantic.success.main, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  contactButtonText: { color: '#FFF', fontFamily: Typography.fontFamily.medium, fontSize: 12 },

  sectionTitle: { fontFamily: Typography.fontFamily.primary, fontSize: 16, marginBottom: Spacing.lg },
  faqCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.lg, marginBottom: Spacing.md },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontFamily: Typography.fontFamily.medium, fontSize: 14, flex: 1, paddingRight: Spacing.md },
  faqAnswer: { fontFamily: Typography.fontFamily.inter, fontSize: 13, marginTop: Spacing.md, lineHeight: 20 },
});
