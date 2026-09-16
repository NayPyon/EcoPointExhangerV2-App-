import { collection, onSnapshot, query, where, doc, updateDoc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { db, generateChronologicalId } from "./firebaseConfig";

interface PointContextType {
  totalPoin: number;
  totalPlastik: number;
  totalLogam: number;
  hariKonsisten: number;
  loading: boolean;
}

const PointContext = createContext<PointContextType>({
  totalPoin: 0,
  totalPlastik: 0,
  totalLogam: 0,
  hariKonsisten: 0,
  loading: true,
});

export const PointProvider = ({ children }: { children: ReactNode }) => {
  const { user, userData } = useAuth();

  const [totalPoin, setTotalPoin] = useState(0);
  const [totalPlastik, setTotalPlastik] = useState(0);
  const [totalLogam, setTotalLogam] = useState(0);
  const [hariKonsisten, setHariKonsisten] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTotalPoin(0);
      setTotalPlastik(0);
      setTotalLogam(0);
      setHariKonsisten(0);
      setLoading(false);
      return;
    }

    // MIGRATION SCRIPT (Untuk mengubah ID dokumen lama menjadi format ID waktu urut)
    const runMigration = async () => {
      const migrated = await AsyncStorage.getItem("migrated_chrono_ids");
      if (migrated === "true") return;

      console.log("MIGRATING DATA TO CHRONOLOGICAL IDS...");
      
      // 1. Migrasi Riwayat
      const riwayatQ = query(collection(db, "Users", user.uid, "Riwayat"));
      const riwayatSnap = await getDocs(riwayatQ);
      for (const docSnap of riwayatSnap.docs) {
        if (!docSnap.id.match(/^\d{14,15}-/)) {
          const data = docSnap.data();
          const timestamp = data.tanggal?.toMillis ? data.tanggal.toMillis() : Date.now();
          const newId = generateChronologicalId(timestamp);
          await setDoc(doc(db, "Users", user.uid, "Riwayat", newId), data);
          await deleteDoc(doc(db, "Users", user.uid, "Riwayat", docSnap.id));
        }
      }

      // 2. Migrasi Notifications
      const notifQ = query(collection(db, "Users", user.uid, "Notifications"));
      const notifSnap = await getDocs(notifQ);
      for (const docSnap of notifSnap.docs) {
        if (!docSnap.id.match(/^\d{14,15}-/)) {
          const data = docSnap.data();
          const timestamp = data.time?.toMillis ? data.time.toMillis() : Date.now();
          const newId = generateChronologicalId(timestamp);
          await setDoc(doc(db, "Users", user.uid, "Notifications", newId), data);
          await deleteDoc(doc(db, "Users", user.uid, "Notifications", docSnap.id));
        }
      }

      await AsyncStorage.setItem("migrated_chrono_ids", "true");
      console.log("CHRONO MIGRATION COMPLETE!");
    };
    runMigration();

    // KITA BACA KOLEKSI "Riwayat" DARI SUBCOLLECTION USER
    const q = query(collection(db, "Users", user.uid, "Riwayat"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let hitungPoin = 0;
        let hitungPlastik = 0;
        let hitungLogam = 0;
        const tanggalUnik = new Set();

        snapshot.forEach((doc) => {
          const data = doc.data();

          if (data.poin) {
            if (data.tipe === "tukar_voucher") {
              hitungPoin -= data.poin;
            } else {
              hitungPoin += data.poin;
            }
          }
          if (data.plastik) hitungPlastik += data.plastik;
          if (data.logam) hitungLogam += data.logam;

          if (data.tanggal) {
            try {
              // Jika ini serverTimestamp yang baru dibuat lokal, toDate() mungkin belum ada.
              if (data.tanggal.toDate) {
                const dateString = data.tanggal
                  .toDate()
                  .toISOString()
                  .split("T")[0];
                tanggalUnik.add(dateString);
              }
            } catch (err) {}
          }
        });

        setTotalPoin(hitungPoin);
        setTotalPlastik(hitungPlastik);
        setTotalLogam(hitungLogam);
        setHariKonsisten(tanggalUnik.size);
        setLoading(false);
      },
      (error) => {
        console.error("Gagal mendengarkan data Riwayat:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  // Sinkronisasi otomatis ke profil user (koleksi Users) jika ada data historis yang belum masuk
  useEffect(() => {
    if (!user || !userData || loading) return;

    if (
      userData.poin !== totalPoin ||
      userData.total_plastik !== totalPlastik ||
      userData.total_logam !== totalLogam ||
      userData.streak !== hariKonsisten
    ) {
      updateDoc(doc(db, "Users", user.uid), {
        poin: totalPoin,
        total_plastik: totalPlastik,
        total_logam: totalLogam,
        streak: hariKonsisten,
      }).catch((e) => console.error("Gagal sinkronisasi data profil:", e));
    }
  }, [totalPoin, totalPlastik, totalLogam, hariKonsisten, userData, user, loading]);

  return (
    <PointContext.Provider
      value={{
        totalPoin,
        totalPlastik,
        totalLogam,
        hariKonsisten,
        loading,
      }}
    >
      {children}
    </PointContext.Provider>
  );
};

export const usePoints = () => useContext(PointContext);
