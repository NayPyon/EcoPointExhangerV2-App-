import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView, useColorScheme, Alert, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile, deleteUser } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig';

import { Colors, Semantic, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { AnimatedPress } from '@/components/ui/animated-press';
import { useAuth } from "../AuthContext";

export default function EditProfileScreen() {
  const { user, userData } = useAuth();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const [name, setName] = useState<string>(userData?.fullName || '');
  const [displayName, setDisplayName] = useState<string>(userData?.displayName || '');
  const [phone, setPhone] = useState<string>(userData?.phone || '+62 812 3456 7890');
  
  const [imageUri, setImageUri] = useState<string | null>(user?.photoURL || null);
  const [isUploading, setIsUploading] = useState(false);

  const getBgColor = () => isDark ? Semantic.background.dark : Semantic.background.secondary;
  const getCardBg = () => isDark ? Colors.obsidian[800] : Semantic.background.primary;
  const getTextColor = () => isDark ? Semantic.text.light : Semantic.text.primary;
  const getMutedColor = () => isDark ? Colors.obsidian[400] : Semantic.text.secondary;
  const getBorderColor = () => isDark ? Colors.obsidian[700] : Semantic.border.light;

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsUploading(true);
    try {
      let downloadURL = user.photoURL;
      
      // Upload image to Firebase Storage if changed
      if (imageUri && imageUri !== user.photoURL && !imageUri.startsWith('http')) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const storageRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(storageRef, blob);
        downloadURL = await getDownloadURL(storageRef);
        await updateProfile(user, { photoURL: downloadURL });
      }

      // Update Firestore user data
      await updateDoc(doc(db, "Users", user.uid), {
        fullName: name,
        displayName: displayName,
        phone: phone
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsUploading(false);
      router.back();
    } catch (e: any) {
      setIsUploading(false);
      Alert.alert("Gagal Menyimpan", e.message);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Hapus Akun Permanen",
      "Perhatian! Semua poin, voucher, dan riwayat penukaran akan hilang dan tidak bisa dikembalikan. Yakin ingin menghapus akun?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          style: "destructive",
          onPress: async () => {
            if (!user) return;
            setIsUploading(true);
            try {
              await deleteDoc(doc(db, "Users", user.uid));
              await deleteUser(user);
              setIsUploading(false);
              router.replace('/(auth)/login');
            } catch (e: any) {
              setIsUploading(false);
              if (e.code === 'auth/requires-recent-login') {
                Alert.alert("Akses Ditolak", "Demi keamanan, silakan keluar dari akun lalu masuk kembali sebelum menghapus akun.");
              } else {
                Alert.alert("Gagal", e.message);
              }
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: getBgColor() }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, backgroundColor: getBgColor(), borderBottomColor: getBorderColor() }]}>
        <AnimatedPress onPress={() => router.back()} style={[styles.backButton, { backgroundColor: isDark ? Colors.obsidian[800] : Semantic.background.primary }]}>
          <FontAwesome name="arrow-left" size={18} color={getTextColor()} />
        </AnimatedPress>
        <Text style={[styles.headerTitle, { color: getTextColor() }]}>Edit Profil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.avatarSection}>
          <AnimatedPress onPress={pickImage} style={styles.avatarContainer}>
            <View style={[styles.avatarInner, { backgroundColor: isDark ? Colors.obsidian[700] : Colors.emerald[50], overflow: 'hidden' }]}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <FontAwesome name="user" size={40} color={Semantic.primary.main} />
              )}
            </View>
            <View style={[styles.editAvatarButton, { borderColor: getBgColor() }]}>
              <Feather name="camera" size={14} color="#FFF" />
            </View>
          </AnimatedPress>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={[styles.formCard, { backgroundColor: getCardBg() }]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: getMutedColor() }]}>Nama Lengkap</Text>
            <TextInput
              style={[styles.input, { color: getTextColor(), backgroundColor: isDark ? Colors.obsidian[950] : Semantic.background.tertiary, borderColor: getBorderColor() }]}
              value={name}
              onChangeText={setName}
              placeholder="Nama Lengkap"
              placeholderTextColor={getMutedColor()}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: getMutedColor() }]}>Nama Panggilan (Maks 8 Karakter)</Text>
            <TextInput
              style={[styles.input, { color: getTextColor(), backgroundColor: isDark ? Colors.obsidian[950] : Semantic.background.tertiary, borderColor: getBorderColor() }]}
              value={displayName}
              onChangeText={setDisplayName}
              maxLength={8}
              placeholder="Nama Panggilan"
              placeholderTextColor={getMutedColor()}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: getMutedColor() }]}>Nomor Telepon</Text>
            <TextInput
              style={[styles.input, { color: getTextColor(), backgroundColor: isDark ? Colors.obsidian[950] : Semantic.background.tertiary, borderColor: getBorderColor() }]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Nomor Telepon"
              placeholderTextColor={getMutedColor()}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <AnimatedPress 
            style={[styles.deleteBtn, { borderColor: Semantic.danger.main, borderWidth: 1 }]} 
            onPress={handleDeleteAccount}
          >
            <Feather name="trash-2" size={18} color={Semantic.danger.main} />
            <Text style={[styles.deleteBtnText, { color: Semantic.danger.main }]}>Hapus Akun Permanen</Text>
          </AnimatedPress>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg, backgroundColor: getBgColor(), borderTopColor: getBorderColor() }]}>
        <AnimatedPress style={[styles.saveButton, isUploading ? { opacity: 0.7 } : {}]} onPress={handleSave} disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
          )}
        </AnimatedPress>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: Spacing.lg, paddingHorizontal: Spacing.xl, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: Typography.fontFamily.primary, fontSize: 18 },
  scrollContent: { padding: Spacing.xl, paddingBottom: 100 },
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xxl },
  avatarContainer: { position: 'relative' },
  avatarInner: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  editAvatarButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Semantic.primary.main, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3 },
  formCard: { borderRadius: BorderRadius.xl, padding: Spacing.lg },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontFamily: Typography.fontFamily.interMedium, fontSize: 13, marginBottom: Spacing.sm },
  input: { fontFamily: Typography.fontFamily.inter, fontSize: 15, borderRadius: BorderRadius.md, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  footer: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, borderTopWidth: 1 },
  saveButton: { backgroundColor: Semantic.success.main, paddingVertical: 16, borderRadius: BorderRadius.md, alignItems: 'center', height: 56, justifyContent: 'center' },
  saveButtonText: { fontFamily: Typography.fontFamily.primary, color: '#FFF', fontSize: 16 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Spacing.lg, marginTop: Spacing.xl, borderRadius: BorderRadius.md },
  deleteBtnText: { fontFamily: Typography.fontFamily.medium, fontSize: 14, marginLeft: Spacing.sm },
});
