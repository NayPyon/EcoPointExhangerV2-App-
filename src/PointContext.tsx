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
  misiMingguanProgress: number;
  loading: boolean;
}

const PointContext = createContext<PointContextType>({
  totalPoin: 0,
  totalPlastik: 0,
  totalLogam: 0,
  hariKonsisten: 0,
  misiMingguanProgress: 0,
  loading: true,
});

export const PointProvider = ({ children }: { children: ReactNode }) => {
  const { user, userData } = useAuth();

  const [totalPoin, setTotalPoin] = useState(0);
  const [totalPlastik, setTotalPlastik] = useState(0);
  const [totalLogam, setTotalLogam] = useState(0);
  const [hariKonsisten, setHariKonsisten] = useState(0);
  const [misiMingguanProgress, setMisiMingguanProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTotalPoin(0);
      setTotalPlastik(0);
      setTotalLogam(0);
      setHariKonsisten(0);
      setMisiMingguanProgress(0);
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

    const getStartOfWeekMonday7AM = () => {
      const current = new Date();
      const day = current.getDay(); // 0: Sunday, 1: Monday...
      const hours = current.getHours();
      
      let daysToSubtract = 0;
      if (day === 0) daysToSubtract = 6;
      else if (day === 1) daysToSubtract = hours < 7 ? 7 : 0;
      else daysToSubtract = day - 1;
      
      const monday = new Date(current);
      monday.setDate(monday.getDate() - daysToSubtract);
      monday.setHours(7, 0, 0, 0);
      return monday;
    };

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let hitungPoin = 0;
        let hitungPlastik = 0;
        let hitungLogam = 0;
        let mingguanPlastik = 0;
        const tanggalUnik = new Set<string>();
        const startOfWeek = getStartOfWeekMonday7AM();

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
              if (data.tanggal.toDate) {
                const d = data.tanggal.toDate();
                
                // Misi mingguan (plastik minggu ini sejak senin 7 pagi)
                if (d >= startOfWeek && data.tipe !== "tukar_voucher" && data.plastik) {
                  mingguanPlastik += data.plastik;
                }

                // Hanya hitung streak jika user setor sampah (bukan tukar voucher)
                if (data.tipe !== "tukar_voucher") {
                  const dateString = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
                  tanggalUnik.add(dateString);
                }
              }
            } catch (err) {}
          }
        });

        // KALKULASI STREAK BERUNTUN
        const sortedDates = Array.from(tanggalUnik).sort().reverse();
        let currentStreak = 0;
        
        if (sortedDates.length > 0) {
          const today = new Date();
          const todayStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, '0') + "-" + String(today.getDate()).padStart(2, '0');
          
          const yesterday = new Date();
          yesterday.setDate(today.getDate() - 1);
          const yesterdayStr = yesterday.getFullYear() + "-" + String(yesterday.getMonth() + 1).padStart(2, '0') + "-" + String(yesterday.getDate()).padStart(2, '0');
          
          // Streak valid jika terakhir aktivitas hari ini atau kemarin
          if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
            currentStreak = 1;
            let checkDate = new Date(sortedDates[0]);
            
            for (let i = 1; i < sortedDates.length; i++) {
              checkDate.setDate(checkDate.getDate() - 1);
              const expectedStr = checkDate.getFullYear() + "-" + String(checkDate.getMonth() + 1).padStart(2, '0') + "-" + String(checkDate.getDate()).padStart(2, '0');
              
              if (sortedDates[i] === expectedStr) {
                currentStreak++;
              } else {
                break;
              }
            }
          }
        }

        setTotalPoin(hitungPoin);
        setTotalPlastik(hitungPlastik);
        setTotalLogam(hitungLogam);
        setHariKonsisten(currentStreak);
        setMisiMingguanProgress(mingguanPlastik);
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
        misiMingguanProgress,
        loading,
      }}
    >
      {children}
    </PointContext.Provider>
  );
};

export const usePoints = () => useContext(PointContext);
