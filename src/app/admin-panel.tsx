import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, ActivityIndicator, useColorScheme } from "react-native";
import { Typography, Colors, Spacing, Semantic } from "@/constants/theme";
import { useAuth } from "../AuthContext";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, addDoc, getDocs, writeBatch, Timestamp } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchableOpacity as GHTouchableOpacity } from "react-native-gesture-handler";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";

// ==========================================
// HELPER: GLOBAL NOTIFICATION
// ==========================================
export const sendGlobalNotification = async (title: string, message: string, type: string, icon: string, color_type: string) => {
  try {
    const { generateChronologicalId } = require("../firebaseConfig");
    const usersSnap = await getDocs(collection(db, "Users"));
    
    // Batch writes (max 500 per batch)
    const batches: any[] = [];
    let currentBatch = writeBatch(db);
    let count = 0;

    usersSnap.forEach((userDoc) => {
      const notifId = generateChronologicalId(Date.now() + count);
      const notifRef = doc(db, "Users", userDoc.id, "Notifications", notifId);
      currentBatch.set(notifRef, {
        title: title,
        message: message, // Support legacy
        desc: message, // Support new
        type: type,
        icon: icon,
        color_type: color_type,
        unread: true,
        time: Timestamp.now()
      });

      count++;
      if (count % 490 === 0) {
        batches.push(currentBatch);
        currentBatch = writeBatch(db);
      }
    });

    if (count % 490 !== 0) {
      batches.push(currentBatch);
    }

    for (const batch of batches) {
      await batch.commit();
    }
  } catch (error) {
    console.error("Failed to send global notification:", error);
  }
};

// ==========================================
// VOUCHER TAB COMPONENT
// ==========================================
const VoucherTab = () => {
  const isDark = useColorScheme() === 'dark';
  const cardBg = isDark ? Colors.obsidian[900] : "white";
  const textColor = isDark ? Semantic.text.light : Colors.obsidian[900];
  const subColor = isDark ? Colors.obsidian[400] : Colors.obsidian[500];
  const inputBorder = isDark ? Colors.obsidian[700] : Colors.obsidian[200];
  const inputBg = isDark ? Colors.obsidian[800] : "white";

  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newVoucher, setNewVoucher] = useState({ id: "", nama: "", poin: "", stok: "", kategori: "Makanan & Minuman", gambar_url: "", urutan: "" });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "Vouchers"), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by urutan (ascending)
      data.sort((a: any, b: any) => (a.urutan || 0) - (b.urutan || 0));
      setVouchers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);





  const [uploadingImage, setUploadingImage] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.3, // Kualitas diturunkan agar ukuran Base64 kecil (Firestore limit 1MB)
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setNewVoucher({ ...newVoucher, gambar_url: `data:image/jpeg;base64,${result.assets[0].base64}` });
    }
  };

  const handleAddVoucher = async () => {
    if (!newVoucher.nama || !newVoucher.poin || !newVoucher.stok) return Alert.alert("Error", "Lengkapi form");
    
    try {
      let finalImageUrl = newVoucher.gambar_url;

      if (!finalImageUrl || finalImageUrl.includes("1549465220")) {
        finalImageUrl = "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600&q=80"; // Default
      }

      if (newVoucher.id) {
        await updateDoc(doc(db, "Vouchers", newVoucher.id), {
          nama: newVoucher.nama,
          poin_dibutuhkan: parseInt(newVoucher.poin),
          stok: parseInt(newVoucher.stok),
          kategori: newVoucher.kategori,
          gambar_url: finalImageUrl,
          urutan: parseInt(newVoucher.urutan) || 0
        });
      } else {
        await addDoc(collection(db, "Vouchers"), {
          nama: newVoucher.nama,
          poin_dibutuhkan: parseInt(newVoucher.poin),
          stok: parseInt(newVoucher.stok),
          kategori: newVoucher.kategori,
          gambar_url: finalImageUrl,
          aktif: true,
          urutan: parseInt(newVoucher.urutan) || 0
        });

        // Notifikasi Global Voucher Baru
        await sendGlobalNotification(
          "Reward Baru Tersedia!",
          `Tukar poinmu dengan ${newVoucher.nama} sekarang. Stok terbatas!`,
          "promo",
          "gift",
          "success"
        );
      }
      
      setModalVisible(false);
      setNewVoucher({ id: "", nama: "", poin: "", stok: "", kategori: "Makanan & Minuman", gambar_url: "", urutan: "" });
    } catch (e) {
      Alert.alert("Error", "Gagal menyimpan voucher");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "Vouchers", id), { aktif: !currentStatus });
  };

  const updateVouchersOrder = async (newData: any[]) => {
    console.log("updateVouchersOrder dipanggil!", newData.map(v => v.nama));
    setVouchers(newData); // Optimistic UI update
    const batch = writeBatch(db);
    newData.forEach((v, index) => {
      const vRef = doc(db, "Vouchers", v.id);
      console.log(`Update ${v.nama} ke urutan ${index + 1}`);
      batch.update(vRef, { urutan: index + 1 });
    });
    try {
      await batch.commit();
      console.log("Batch commit berhasil!");
    } catch (e) {
      console.error("Batch commit gagal:", e);
      Alert.alert("Error", "Gagal menyimpan urutan baru");
    }
  };

  const deleteVoucher = async (id: string) => {
    Alert.alert("Hapus", "Yakin hapus voucher ini?", [
      { text: "Batal" },
      { text: "Hapus", onPress: async () => await deleteDoc(doc(db, "Vouchers", id)), style: "destructive" }
    ]);
  };

  const editVoucher = (v: any) => {
    setNewVoucher({
      id: v.id,
      nama: v.nama,
      poin: v.poin_dibutuhkan.toString(),
      stok: v.stok.toString(),
      kategori: v.kategori || "Umum",
      gambar_url: v.gambar_url || "",
      urutan: v.urutan !== undefined ? v.urutan.toString() : ""
    });
    setModalVisible(true);
  };

  if (loading) return <ActivityIndicator size="large" color={Colors.emerald[500]} style={{ marginTop: 50 }} />;

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={styles.addButton} onPress={() => {
        setNewVoucher({ id: "", nama: "", poin: "", stok: "", kategori: "Makanan & Minuman", gambar_url: "", urutan: "" });
        setModalVisible(true);
      }}>
        <Feather name="plus" size={20} color="white" />
        <Text style={styles.addButtonText}>Tambah Voucher</Text>
      </TouchableOpacity>

      <DraggableFlatList
        data={vouchers}
        onDragEnd={({ data }) => updateVouchersOrder(data)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item: v, drag, isActive }) => (
          <ScaleDecorator>
            <GHTouchableOpacity
              activeOpacity={1}
              onLongPress={drag}
              disabled={isActive}
            >
              <View style={[styles.card, { backgroundColor: cardBg, elevation: isActive ? 5 : 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: textColor }]}>{v.nama}</Text>
                  <Text style={[styles.cardSub, { color: subColor }]}>{v.poin_dibutuhkan} Poin • Sisa: {v.stok} • Urutan: {v.urutan || 0}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: v.aktif ? Colors.emerald[100] : Colors.red[100] }]}>
                    <Text style={[styles.statusText, { color: v.aktif ? Colors.emerald[700] : Colors.red[700] }]}>
                      {v.aktif ? "Aktif" : "Non-Aktif"}
                    </Text>
                  </View>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? Colors.obsidian[800] : Colors.obsidian[100] }]} onPress={() => editVoucher(v)}>
                    <Feather name="edit-2" size={20} color={textColor} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? Colors.obsidian[800] : Colors.obsidian[100] }]} onPress={() => toggleActive(v.id, v.aktif)}>
                    <Feather name={v.aktif ? "eye-off" : "eye"} size={20} color={textColor} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? "rgba(239, 68, 68, 0.2)" : Colors.red[50] }]} onPress={() => deleteVoucher(v.id)}>
                    <Feather name="trash-2" size={20} color={Colors.red[500]} />
                  </TouchableOpacity>
                  <GHTouchableOpacity onPressIn={drag} style={{ justifyContent: 'center', marginLeft: 4, padding: 8 }}>
                    <Feather name="menu" size={20} color={Colors.obsidian[400]} />
                  </GHTouchableOpacity>
                </View>
              </View>
            </GHTouchableOpacity>
          </ScaleDecorator>
        )}
      />

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView style={{ width: "100%" }} contentContainerStyle={{ justifyContent: "center", flexGrow: 1, paddingVertical: 20 }}>
            <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>{newVoucher.id ? "Edit Voucher" : "Tambah Voucher Baru"}</Text>
              
              <Text style={[styles.inputLabel, { color: textColor }]}>Nama Voucher</Text>
              <TextInput style={[styles.input, { borderColor: inputBorder, backgroundColor: inputBg, color: textColor }]} placeholderTextColor={subColor} placeholder="Misal: Kopi Susu" value={newVoucher.nama} onChangeText={(t) => setNewVoucher({...newVoucher, nama: t})} />
              
              <Text style={[styles.inputLabel, { color: textColor }]}>Harga (Poin)</Text>
              <TextInput style={[styles.input, { borderColor: inputBorder, backgroundColor: inputBg, color: textColor }]} placeholderTextColor={subColor} placeholder="Misal: 5000" keyboardType="numeric" value={newVoucher.poin} onChangeText={(t) => setNewVoucher({...newVoucher, poin: t})} />
              
              <Text style={[styles.inputLabel, { color: textColor }]}>Stok Awal</Text>
              <TextInput style={[styles.input, { borderColor: inputBorder, backgroundColor: inputBg, color: textColor }]} placeholderTextColor={subColor} placeholder="Misal: 10" keyboardType="numeric" value={newVoucher.stok} onChangeText={(t) => setNewVoucher({...newVoucher, stok: t})} />

              <Text style={[styles.inputLabel, { color: textColor }]}>Kategori</Text>
              <TextInput style={[styles.input, { borderColor: inputBorder, backgroundColor: inputBg, color: textColor }]} placeholderTextColor={subColor} placeholder="Misal: Makanan & Minuman" value={newVoucher.kategori} onChangeText={(t) => setNewVoucher({...newVoucher, kategori: t})} />

              <Text style={[styles.inputLabel, { color: textColor }]}>Urutan Tampil (Opsional)</Text>
              <TextInput style={[styles.input, { borderColor: inputBorder, backgroundColor: inputBg, color: textColor }]} placeholderTextColor={subColor} placeholder="Misal: 1" keyboardType="numeric" value={newVoucher.urutan} onChangeText={(t) => setNewVoucher({...newVoucher, urutan: t})} />

            <Text style={[styles.inputLabel, { color: textColor }]}>Gambar Voucher (Opsional)</Text>
            
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity style={[styles.imagePickerBtn, { flex: 1, backgroundColor: isDark ? "rgba(16, 185, 129, 0.1)" : Colors.emerald[50] }]} onPress={pickImage}>
                <Feather name="image" size={20} color={Colors.emerald[500]} />
                <Text style={styles.imagePickerText}>
                  {newVoucher.gambar_url ? "Ganti Foto" : "Pilih Foto"}
                </Text>
              </TouchableOpacity>
              
              {newVoucher.gambar_url !== "" && !newVoucher.gambar_url.includes("1549465220") && (
                <TouchableOpacity 
                  style={[styles.imagePickerBtn, { flex: 1, backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : Colors.red[50], borderColor: isDark ? "rgba(239, 68, 68, 0.3)" : Colors.red[200] }]} 
                  onPress={() => setNewVoucher({...newVoucher, gambar_url: ""})}
                >
                  <Feather name="trash-2" size={20} color={Colors.red[500]} />
                  <Text style={[styles.imagePickerText, { color: Colors.red[500] }]}>Hapus Foto</Text>
                </TouchableOpacity>
              )}
            </View>

            {newVoucher.gambar_url && !newVoucher.gambar_url.startsWith("data:image") && (
              <Text style={{ fontSize: 10, color: subColor, marginTop: 5 }}>*Menggunakan gambar existing</Text>
            )}

            <View style={{ flexDirection: "row", marginTop: 20, gap: 10 }}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: isDark ? Colors.obsidian[800] : Colors.obsidian[200] }]} onPress={() => setModalVisible(false)} disabled={uploadingImage}>
                <Text style={{ fontFamily: Typography.fontFamily.primary, color: isDark ? textColor : Colors.obsidian[900] }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.emerald[500] }]} onPress={handleAddVoucher} disabled={uploadingImage}>
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={{ fontFamily: Typography.fontFamily.primary, color: "white" }}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

// ==========================================
// RVM TAB COMPONENT
// ==========================================
const RvmTab = () => {
  const isDark = useColorScheme() === 'dark';
  const cardBg = isDark ? Colors.obsidian[900] : "white";
  const textColor = isDark ? Semantic.text.light : Colors.obsidian[900];
  const subColor = isDark ? Colors.obsidian[400] : Colors.obsidian[500];
  const inputBorder = isDark ? Colors.obsidian[700] : Colors.obsidian[200];
  const inputBg = isDark ? Colors.obsidian[800] : "white";

  const [rvms, setRvms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit RVM State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editRvmData, setEditRvmData] = useState({ id: "", lokasi: "", alamat: "", latitude: "", longitude: "" });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "RVM"), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRvms(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const toggleStatus = async (item: any) => {
    const newStatus = item.status_mesin === "aktif" ? "offline" : "aktif";
    try {
      await updateDoc(doc(db, "RVM", item.id), { status_mesin: newStatus });
      
      // Notifikasi Global Mesin
      if (newStatus === "aktif") {
        await sendGlobalNotification(
          "Mesin RVM Kembali Aktif!",
          `Mesin RVM di ${item.lokasi || 'lokasi Anda'} sekarang sudah bisa digunakan kembali.`,
          "system",
          "check-circle",
          "success"
        );
      } else {
        await sendGlobalNotification(
          "Mesin RVM Sedang Offline",
          `Mesin RVM di ${item.lokasi || 'lokasi Anda'} sedang offline untuk perbaikan/penuh.`,
          "system",
          "exclamation-circle",
          "danger"
        );
      }
    } catch (e) {
      Alert.alert("Error", "Gagal mengubah status mesin");
    }
  };

  const addDummyRVM = async () => {
    const id = `RVM-TEST-${Date.now().toString().slice(-4)}`;
    // Randomize location around Jakarta/Depok
    const randomLat = -6.200000 + (Math.random() - 0.5) * 0.1;
    const randomLng = 106.816666 + (Math.random() - 0.5) * 0.1;
    
    try {
      await setDoc(doc(db, "RVM", id), {
        lokasi: "Cabang Test",
        status_mesin: "aktif",
        kapasitas_plastik: Math.floor(Math.random() * 100),
        kapasitas_logam: Math.floor(Math.random() * 100),
        latitude: randomLat,
        longitude: randomLng,
      });
    } catch (e) {
      Alert.alert("Error", "Gagal tambah RVM");
    }
  };

  const handleEditRVM = (rvm: any) => {
    setEditRvmData({
      id: rvm.id,
      lokasi: rvm.lokasi || "",
      alamat: rvm.alamat || "",
      latitude: rvm.latitude ? rvm.latitude.toString() : "",
      longitude: rvm.longitude ? rvm.longitude.toString() : ""
    });
    setEditModalVisible(true);
  };

  const saveEditRVM = async () => {
    if (!editRvmData.lokasi) return Alert.alert("Error", "Lokasi tidak boleh kosong");
    
    try {
      await updateDoc(doc(db, "RVM", editRvmData.id), {
        lokasi: editRvmData.lokasi,
        alamat: editRvmData.alamat,
        latitude: parseFloat(editRvmData.latitude) || 0,
        longitude: parseFloat(editRvmData.longitude) || 0,
      });
      setEditModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Gagal mengupdate RVM");
    }
  };

  if (loading) return <ActivityIndicator size="large" color={Colors.emerald[500]} style={{ marginTop: 50 }} />;

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={styles.addButton} onPress={addDummyRVM}>
        <Feather name="plus" size={20} color="white" />
        <Text style={styles.addButtonText}>Tambah RVM Uji Coba</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {rvms.map((r) => (
          <View key={r.id} style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: textColor }]}>{r.lokasi}</Text>
              <Text style={[styles.cardSub, { color: subColor }]}>ID: {r.id}</Text>
              
              <View style={{ marginTop: 5, gap: 4 }}>
                <Text style={{ fontSize: 11, color: subColor }}>Plastik: {r.kapasitas_plastik}%</Text>
                <View style={[styles.barBg, { backgroundColor: isDark ? Colors.obsidian[800] : Colors.obsidian[100] }]}>
                  <View style={[styles.barFill, { width: `${r.kapasitas_plastik}%`, backgroundColor: r.kapasitas_plastik > 80 ? Colors.red[500] : Colors.emerald[500] }]} />
                </View>
                
                <Text style={{ fontSize: 11, color: subColor }}>Logam: {r.kapasitas_logam}%</Text>
                <View style={[styles.barBg, { backgroundColor: isDark ? Colors.obsidian[800] : Colors.obsidian[100] }]}>
                  <View style={[styles.barFill, { width: `${r.kapasitas_logam}%`, backgroundColor: r.kapasitas_logam > 80 ? Colors.red[500] : Colors.emerald[500] }]} />
                </View>
              </View>
            </View>
            
            <View style={{ alignItems: "flex-end", gap: 10 }}>
              <View style={[styles.statusBadge, { backgroundColor: r.status_mesin === "aktif" ? Colors.emerald[100] : Colors.red[100] }]}>
                <Text style={[styles.statusText, { color: r.status_mesin === "aktif" ? Colors.emerald[700] : Colors.red[700] }]}>
                  {r.status_mesin.toUpperCase()}
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? Colors.obsidian[800] : Colors.obsidian[100] }]} onPress={() => handleEditRVM(r)}>
                  <Feather name="edit-2" size={20} color={textColor} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? Colors.obsidian[800] : Colors.obsidian[100] }]} onPress={() => toggleStatus(r)}>
                  <Feather name="power" size={20} color={r.status_mesin === "aktif" ? Colors.red[500] : Colors.emerald[500]} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? "rgba(239, 68, 68, 0.2)" : Colors.red[50] }]} onPress={() => deleteDoc(doc(db, "RVM", r.id))}>
                  <Feather name="trash-2" size={20} color={Colors.red[500]} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Edit RVM Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Edit Info RVM</Text>
            
            <Text style={[styles.inputLabel, { color: textColor }]}>Lokasi</Text>
            <TextInput style={[styles.input, { borderColor: inputBorder, backgroundColor: inputBg, color: textColor }]} placeholderTextColor={subColor} placeholder="Misal: Stasiun UI" value={editRvmData.lokasi} onChangeText={(t) => setEditRvmData({...editRvmData, lokasi: t})} />
            
            <Text style={[styles.inputLabel, { color: textColor }]}>Alamat Lengkap</Text>
            <TextInput style={[styles.input, { borderColor: inputBorder, backgroundColor: inputBg, color: textColor }]} placeholderTextColor={subColor} placeholder="Misal: Jl. Margonda Raya No.1..." value={editRvmData.alamat} onChangeText={(t) => setEditRvmData({...editRvmData, alamat: t})} />
            
            <Text style={[styles.inputLabel, { color: textColor }]}>Latitude</Text>
            <TextInput style={[styles.input, { borderColor: inputBorder, backgroundColor: inputBg, color: textColor }]} placeholderTextColor={subColor} placeholder="-6.2000" keyboardType="numeric" value={editRvmData.latitude} onChangeText={(t) => setEditRvmData({...editRvmData, latitude: t})} />
            
            <Text style={[styles.inputLabel, { color: textColor }]}>Longitude</Text>
            <TextInput style={[styles.input, { borderColor: inputBorder, backgroundColor: inputBg, color: textColor }]} placeholderTextColor={subColor} placeholder="106.8166" keyboardType="numeric" value={editRvmData.longitude} onChangeText={(t) => setEditRvmData({...editRvmData, longitude: t})} />

            <View style={{ flexDirection: "row", marginTop: 20, gap: 10 }}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: isDark ? Colors.obsidian[800] : Colors.obsidian[200] }]} onPress={() => setEditModalVisible(false)}>
                <Text style={{ fontFamily: Typography.fontFamily.primary, color: isDark ? textColor : Colors.obsidian[900] }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.emerald[500] }]} onPress={saveEditRVM}>
                <Text style={{ fontFamily: Typography.fontFamily.primary, color: "white" }}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};


// ==========================================
// MAIN SCREEN
// ==========================================
export default function AdminPanelScreen() {
  const { userData, loading } = useAuth();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? Colors.obsidian[950] : "#F1F5F9";
  const headerBg = isDark ? Colors.obsidian[900] : "white";
  const textColor = isDark ? Semantic.text.light : Colors.obsidian[900];
  const borderColor = isDark ? Colors.obsidian[800] : Colors.obsidian[200];
  const [activeTab, setActiveTab] = useState<"voucher" | "rvm">("voucher");

  useEffect(() => {
    if (!loading) {
      const isAdmin = userData?.role === "admin" || userData?.Role === "admin" || userData?.Role === "Admin";
      if (!isAdmin) {
        router.replace("/(tabs)");
      }
    }
  }, [userData, loading]);

  if (loading) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: bgColor }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Admin Dashboard</Text>
      </View>

      {/* TABS */}
      <View style={[styles.tabContainer, { backgroundColor: headerBg }]}>
        <TouchableOpacity style={[styles.tab, activeTab === "voucher" && styles.tabActive]} onPress={() => setActiveTab("voucher")}>
          <Text style={[styles.tabText, activeTab === "voucher" && styles.tabTextActive]}>Kelola Voucher</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === "rvm" && styles.tabActive]} onPress={() => setActiveTab("rvm")}>
          <Text style={[styles.tabText, activeTab === "rvm" && styles.tabTextActive]}>Monitoring RVM</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <View style={{ flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }}>
        {activeTab === "voucher" ? <VoucherTab /> : <RvmTab />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: Colors.obsidian[200],
  },
  backBtn: { padding: 8, marginRight: 8, marginLeft: -8 },
  headerTitle: { fontFamily: Typography.fontFamily.primary, fontSize: 20, color: Colors.obsidian[900] },
  
  tabContainer: { flexDirection: "row", backgroundColor: "white" },
  tab: { flex: 1, paddingVertical: 15, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: Colors.emerald[500] },
  tabText: { fontFamily: Typography.fontFamily.primary, fontSize: 14, color: Colors.obsidian[400] },
  tabTextActive: { color: Colors.emerald[500] },

  addButton: {
    backgroundColor: Colors.emerald[500],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 15,
    gap: 8,
  },
  addButtonText: { fontFamily: Typography.fontFamily.primary, color: "white", fontSize: 16 },
  imagePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.emerald[50],
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.emerald[200],
    borderStyle: "dashed",
    marginTop: 5,
    gap: 8,
  },
  imagePickerText: {
    fontFamily: Typography.fontFamily.primary,
    color: Colors.emerald[700],
    fontSize: 14,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardTitle: { fontFamily: Typography.fontFamily.primary, fontSize: 16, color: Colors.obsidian[900], marginBottom: 4 },
  cardSub: { fontFamily: Typography.fontFamily.inter, fontSize: 13, color: Colors.obsidian[500], marginBottom: 8 },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  statusText: { fontFamily: Typography.fontFamily.primary, fontSize: 12 },
  
  actionRow: { flexDirection: "row", gap: 8, marginLeft: 10 },
  iconBtn: { padding: 8, backgroundColor: Colors.obsidian[100], borderRadius: 8 },

  barBg: { height: 8, backgroundColor: Colors.obsidian[100], borderRadius: 10, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 10 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { backgroundColor: "white", width: "100%", borderRadius: 20, padding: 20 },
  modalTitle: { fontFamily: Typography.fontFamily.primary, fontSize: 20, marginBottom: 20, color: Colors.obsidian[900] },
  inputLabel: { fontFamily: Typography.fontFamily.primary, fontSize: 14, color: Colors.obsidian[700], marginBottom: 8 },
  input: { borderWidth: 1, borderColor: Colors.obsidian[200], borderRadius: 10, padding: 12, marginBottom: 15, fontFamily: Typography.fontFamily.inter },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" }
});
