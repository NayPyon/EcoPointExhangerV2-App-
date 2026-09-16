import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, ActivityIndicator } from "react-native";
import { Typography, Colors, Spacing } from "@/constants/theme";
import { useAuth } from "../AuthContext";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ==========================================
// VOUCHER TAB COMPONENT
// ==========================================
const VoucherTab = () => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newVoucher, setNewVoucher] = useState({ id: "", nama: "", poin: "", stok: "", kategori: "Makanan & Minuman", gambar_url: "" });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "Vouchers"), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setVouchers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const deleteVoucher = async (id: string) => {
    Alert.alert("Konfirmasi", "Yakin ingin menghapus voucher ini?", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: async () => await deleteDoc(doc(db, "Vouchers", id)) }
    ]);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "Vouchers", id), { aktif: !current });
  };

  const openEditModal = (v: any) => {
    setNewVoucher({
      id: v.id,
      nama: v.nama,
      poin: v.poin_dibutuhkan.toString(),
      stok: v.stok.toString(),
      kategori: v.kategori || "Umum",
      gambar_url: v.gambar_url || ""
    });
    setModalVisible(true);
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.3, // Kualitas diturunkan agar ukuran Base64 kecil (Firestore limit 1MB)
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.width < 400 || asset.height < 400) {
        Alert.alert("Error", "Gambar terlalu kecil! Minimal resolusi 400x400 px.");
        return;
      }
      
      // Simpan Base64 string dengan format URI data
      const base64Uri = `data:image/jpeg;base64,${asset.base64}`;
      setNewVoucher({ ...newVoucher, gambar_url: base64Uri });
    }
  };

  const handleAddVoucher = async () => {
    if (!newVoucher.nama || !newVoucher.poin || !newVoucher.stok) {
      Alert.alert("Error", "Isi semua kolom wajib!");
      return;
    }
    
    setUploadingImage(true);
    try {
      let finalImageUrl = newVoucher.gambar_url;

      if (!finalImageUrl) {
        finalImageUrl = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80"; // Default
      }

      if (newVoucher.id) {
        // Mode Edit
        await updateDoc(doc(db, "Vouchers", newVoucher.id), {
          nama: newVoucher.nama,
          poin_dibutuhkan: parseInt(newVoucher.poin),
          stok: parseInt(newVoucher.stok),
          kategori: newVoucher.kategori || "Umum",
          gambar_url: finalImageUrl,
        });
      } else {
        // Mode Tambah Baru
        const id = `VOUCHER-${Date.now()}`;
        await setDoc(doc(db, "Vouchers", id), {
          nama: newVoucher.nama,
          poin_dibutuhkan: parseInt(newVoucher.poin),
          stok: parseInt(newVoucher.stok),
          kategori: newVoucher.kategori || "Umum",
          aktif: true,
          gambar_url: finalImageUrl,
        });
      }
      setModalVisible(false);
      setNewVoucher({ id: "", nama: "", poin: "", stok: "", kategori: "Makanan & Minuman", gambar_url: "" });
    } catch (e: any) {
      Alert.alert("Error", "Gagal menyimpan voucher: " + e.message);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color={Colors.emerald[500]} style={{ marginTop: 50 }} />;

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={styles.addButton} onPress={() => {
        setNewVoucher({ id: "", nama: "", poin: "", stok: "", kategori: "Makanan & Minuman", gambar_url: "" });
        setModalVisible(true);
      }}>
        <Feather name="plus" size={20} color="white" />
        <Text style={styles.addButtonText}>Tambah Voucher</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {vouchers.map((v) => (
          <View key={v.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{v.nama}</Text>
              <Text style={styles.cardSub}>Harga: {v.poin_dibutuhkan} Pts | Stok: {v.stok}</Text>
              <View style={[styles.statusBadge, { backgroundColor: v.aktif ? Colors.emerald[100] : Colors.red[100] }]}>
                <Text style={[styles.statusText, { color: v.aktif ? Colors.emerald[700] : Colors.red[700] }]}>
                  {v.aktif ? "Aktif" : "Nonaktif"}
                </Text>
              </View>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => openEditModal(v)}>
                <Feather name="edit-2" size={20} color={Colors.emerald[500]} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => toggleActive(v.id, v.aktif)}>
                <Feather name={v.aktif ? "eye-off" : "eye"} size={20} color={Colors.obsidian[500]} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => deleteVoucher(v.id)}>
                <Feather name="trash-2" size={20} color={Colors.red[500]} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Voucher Baru</Text>
            
            <Text style={styles.inputLabel}>Nama Voucher</Text>
            <TextInput style={styles.input} placeholder="Misal: Kopi Susu" value={newVoucher.nama} onChangeText={(t) => setNewVoucher({...newVoucher, nama: t})} />
            
            <Text style={styles.inputLabel}>Harga (Poin)</Text>
            <TextInput style={styles.input} placeholder="Misal: 5000" keyboardType="numeric" value={newVoucher.poin} onChangeText={(t) => setNewVoucher({...newVoucher, poin: t})} />
            
            <Text style={styles.inputLabel}>Stok Awal</Text>
            <TextInput style={styles.input} placeholder="Misal: 10" keyboardType="numeric" value={newVoucher.stok} onChangeText={(t) => setNewVoucher({...newVoucher, stok: t})} />

            <Text style={styles.inputLabel}>Kategori</Text>
            <TextInput style={styles.input} placeholder="Misal: Makanan & Minuman" value={newVoucher.kategori} onChangeText={(t) => setNewVoucher({...newVoucher, kategori: t})} />

            <Text style={styles.inputLabel}>Gambar Voucher (Min. 400x400)</Text>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
              <Feather name="image" size={20} color={Colors.emerald[500]} />
              <Text style={styles.imagePickerText}>
                {newVoucher.gambar_url && newVoucher.gambar_url.startsWith("data:image") 
                  ? "Gambar Dipilih ✓" 
                  : "Pilih Gambar dari Galeri"}
              </Text>
            </TouchableOpacity>
            {newVoucher.gambar_url && !newVoucher.gambar_url.startsWith("data:image") && (
              <Text style={{ fontSize: 10, color: Colors.obsidian[400], marginTop: 5 }}>*Menggunakan gambar existing</Text>
            )}

            <View style={{ flexDirection: "row", marginTop: 20, gap: 10 }}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.obsidian[200] }]} onPress={() => setModalVisible(false)} disabled={uploadingImage}>
                <Text style={{ fontFamily: Typography.fontFamily.primary }}>Batal</Text>
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
        </View>
      </Modal>
    </View>
  );
};

// ==========================================
// RVM TAB COMPONENT
// ==========================================
const RvmTab = () => {
  const [rvms, setRvms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "RVM"), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRvms(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "aktif" ? "offline" : "aktif";
    try {
      await updateDoc(doc(db, "RVM", id), { status_mesin: newStatus });
    } catch (e) {
      Alert.alert("Error", "Gagal mengubah status mesin");
    }
  };

  const addDummyRVM = async () => {
    const id = `RVM-TEST-${Date.now().toString().slice(-4)}`;
    try {
      await setDoc(doc(db, "RVM", id), {
        lokasi: "Cabang Test",
        status_mesin: "aktif",
        kapasitas_plastik: Math.floor(Math.random() * 100),
        kapasitas_logam: Math.floor(Math.random() * 100),
      });
    } catch (e) {
      Alert.alert("Error", "Gagal tambah RVM");
    }
  };

  if (loading) return <ActivityIndicator size="large" color={Colors.emerald[500]} style={{ marginTop: 50 }} />;

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={styles.addButton} onPress={addDummyRVM}>
        <Feather name="plus" size={20} color="white" />
        <Text style={styles.addButtonText}>Tambah Mesin RVM (Test)</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {rvms.length === 0 && <Text style={{ textAlign: "center", marginTop: 20 }}>Belum ada mesin terdaftar.</Text>}
        {rvms.map((r) => (
          <View key={r.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{r.id}</Text>
              <Text style={styles.cardSub}>Lokasi: {r.lokasi || "Tidak diketahui"}</Text>
              
              {/* Progress Bars */}
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 12, color: Colors.obsidian[600], marginBottom: 4 }}>Kapasitas Plastik: {r.kapasitas_plastik}%</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${r.kapasitas_plastik}%`, backgroundColor: r.kapasitas_plastik > 80 ? Colors.red[500] : Colors.emerald[500] }]} />
                </View>

                <Text style={{ fontSize: 12, color: Colors.obsidian[600], marginBottom: 4, marginTop: 8 }}>Kapasitas Logam: {r.kapasitas_logam}%</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${r.kapasitas_logam}%`, backgroundColor: r.kapasitas_logam > 80 ? Colors.red[500] : '#F59E0B' }]} />
                </View>
              </View>

              <View style={[styles.statusBadge, { marginTop: 15, backgroundColor: r.status_mesin === 'aktif' ? Colors.emerald[100] : Colors.red[100] }]}>
                <Text style={[styles.statusText, { color: r.status_mesin === 'aktif' ? Colors.emerald[700] : Colors.red[700] }]}>
                  {r.status_mesin === 'aktif' ? "Mesin Online" : "Mesin Offline"}
                </Text>
              </View>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => toggleStatus(r.id, r.status_mesin)}>
                <Feather name="power" size={20} color={r.status_mesin === 'aktif' ? Colors.red[500] : Colors.emerald[500]} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => deleteDoc(doc(db, "RVM", r.id))}>
                <Feather name="trash-2" size={20} color={Colors.red[500]} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};


// ==========================================
// MAIN SCREEN
// ==========================================
export default function AdminPanelScreen() {
  const { userData, loading } = useAuth();
  const insets = useSafeAreaInsets();
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={Colors.obsidian[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
      </View>

      {/* TABS */}
      <View style={styles.tabContainer}>
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
