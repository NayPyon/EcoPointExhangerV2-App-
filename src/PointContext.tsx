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

export const getStartOfWeekMonday7AM = () => {
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

export interface WeeklyMission {
  id: string;
  title: string;
  target: number;
  progress: number;
  type: 'plastik' | 'logam' | 'transaksi' | 'hari' | 'campuran';
  reward: number;
  isClaimed: boolean;
}

interface PointContextType {
  totalGold: number;
  totalEssence: number;
  totalPlastik: number;
  totalLogam: number;
  hariKonsisten: number;
  weeklyMissions: WeeklyMission[];
  loading: boolean;
  claimMission: (missionId: string) => Promise<void>;
}

const PointContext = createContext<PointContextType>({
  totalGold: 0,
  totalEssence: 0,
  totalPlastik: 0,
  totalLogam: 0,
  hariKonsisten: 0,
  weeklyMissions: [],
  loading: true,
  claimMission: async () => {},
});

export const PointProvider = ({ children }: { children: ReactNode }) => {
  const { user, userData } = useAuth();

  const [totalGold, setTotalGold] = useState(0);
  const [totalEssence, setTotalEssence] = useState(0);
  const [totalPlastik, setTotalPlastik] = useState(0);
  const [totalLogam, setTotalLogam] = useState(0);
  const [hariKonsisten, setHariKonsisten] = useState(0);
  const [weeklyMissions, setWeeklyMissions] = useState<WeeklyMission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTotalGold(0);
      setTotalEssence(0);
      setTotalPlastik(0);
      setTotalLogam(0);
      setHariKonsisten(0);
      setWeeklyMissions([]);
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

    const runTextMigration = async () => {
      const isMigrated = await AsyncStorage.getItem("migrated_notif_text_v2");
      if (isMigrated === "true") return;

      const notifQ = query(collection(db, "Users", user.uid, "Notifications"));
      const notifSnap = await getDocs(notifQ);
      for (const docSnap of notifSnap.docs) {
        const data = docSnap.data();
        if (data.desc && data.desc.includes("Poin.")) {
          const newDesc = data.desc.replace(/Kamu mendapatkan \+(\d+) Poin\./, "Kamu mendapatkan +$1 Gold & Essence.");
          if (newDesc !== data.desc) {
            await updateDoc(doc(db, "Users", user.uid, "Notifications", docSnap.id), { desc: newDesc });
          }
        }
      }
      await AsyncStorage.setItem("migrated_notif_text_v2", "true");
      console.log("NOTIF TEXT MIGRATION COMPLETE!");
    };
    runTextMigration();

    // KITA BACA KOLEKSI "Riwayat" DARI SUBCOLLECTION USER
    const q = query(collection(db, "Users", user.uid, "Riwayat"));



    const MISSION_POOL = [
      { id: 'm1', title: 'Kumpulkan 20 Botol Plastik', target: 20, type: 'plastik', reward: 500 },
      { id: 'm2', title: 'Kumpulkan 30 Botol Plastik', target: 30, type: 'plastik', reward: 750 },
      { id: 'm3', title: 'Kumpulkan 10 Kaleng Logam', target: 10, type: 'logam', reward: 500 },
      { id: 'm4', title: 'Kumpulkan 15 Kaleng Logam', target: 15, type: 'logam', reward: 750 },
      { id: 'm5', title: 'Setor sampah 2 kali', target: 2, type: 'transaksi', reward: 300 },
      { id: 'm6', title: 'Setor sampah 3 kali', target: 3, type: 'transaksi', reward: 500 },
      { id: 'm7', title: 'Kumpulkan total 25 sampah', target: 25, type: 'campuran', reward: 600 },
      { id: 'm8', title: 'Kumpulkan total 40 sampah', target: 40, type: 'campuran', reward: 1000 },
      { id: 'm9', title: 'Setor di 2 hari berbeda', target: 2, type: 'hari', reward: 400 },
      { id: 'm10', title: 'Setor di 3 hari berbeda', target: 3, type: 'hari', reward: 800 },
      { id: 'm11', title: 'Kumpulkan 15 Botol Plastik', target: 15, type: 'plastik', reward: 300 },
      { id: 'm12', title: 'Kumpulkan 25 Botol Plastik', target: 25, type: 'plastik', reward: 600 },
      { id: 'm13', title: 'Kumpulkan 5 Kaleng Logam', target: 5, type: 'logam', reward: 250 },
      { id: 'm14', title: 'Kumpulkan 20 Kaleng Logam', target: 20, type: 'logam', reward: 1000 },
      { id: 'm15', title: 'Setor sampah 4 kali', target: 4, type: 'transaksi', reward: 800 },
    ] as const;

    const getDeterministicMissions = (uid: string, weekTimestamp: number) => {
      let seed = weekTimestamp;
      for (let i = 0; i < uid.length; i++) {
        seed += uid.charCodeAt(i);
      }
      const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };
      const shuffled = [...MISSION_POOL].sort(() => random() - 0.5);
      return shuffled.slice(0, 2);
    };

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let hitungGold = 0;
        let hitungEssence = 0;
        let hitungPlastik = 0;
        let hitungLogam = 0;
        
        let mingguanPlastik = 0;
        let mingguanLogam = 0;
        let mingguanTransaksi = 0;
        const mingguanHariSetor = new Set<string>();

        const tanggalUnik = new Set<string>();
        const startOfWeek = getStartOfWeekMonday7AM().getTime();

        snapshot.forEach((doc) => {
          const data = doc.data();

          if (data.poin) {
            if (data.tipe === "tukar_voucher") {
              hitungGold -= data.poin;
            } else {
              hitungGold += data.poin;
              hitungEssence += data.essence !== undefined ? data.essence : data.poin;
            }
          }
          if (data.plastik) hitungPlastik += data.plastik;
          if (data.logam) hitungLogam += data.logam;

          if (data.tanggal) {
            try {
              if (data.tanggal.toDate) {
                const d = data.tanggal.toDate();
                const dTime = d.getTime();
                
                // Hanya hitung jika user setor sampah
                if (data.tipe !== "tukar_voucher" && data.tipe !== "misi_mingguan") {
                  const dateString = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
                  tanggalUnik.add(dateString);

                  // Hitung Misi Mingguan
                  if (dTime >= startOfWeek) {
                    mingguanTransaksi += 1;
                    mingguanHariSetor.add(dateString);
                    if (data.plastik) mingguanPlastik += data.plastik;
                    if (data.logam) mingguanLogam += data.logam;
                  }
                }
              }
            } catch (err) {}
          }
        });

        // Setup Misi Mingguan
        const currentMissions = getDeterministicMissions(user.uid, startOfWeek);
        const claimedMissions: string[] = userData?.current_week_start === startOfWeek ? (userData?.claimed_missions || []) : [];
        
        const generatedWeeklyMissions: WeeklyMission[] = currentMissions.map(m => {
          let progress = 0;
          if (m.type === 'plastik') progress = mingguanPlastik;
          else if (m.type === 'logam') progress = mingguanLogam;
          else if (m.type === 'transaksi') progress = mingguanTransaksi;
          else if (m.type === 'campuran') progress = mingguanPlastik + mingguanLogam;
          else if (m.type === 'hari') progress = mingguanHariSetor.size;
          
          return {
            ...m,
            progress: Math.min(progress, m.target),
            isClaimed: claimedMissions.includes(m.id)
          };
        });
        setWeeklyMissions(generatedWeeklyMissions);

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

        setTotalGold(hitungGold);
        setTotalEssence(hitungEssence);
        setTotalPlastik(hitungPlastik);
        setTotalLogam(hitungLogam);
        setHariKonsisten(currentStreak);
        setLoading(false);
      },
      (error) => {
        console.error("Gagal mendengarkan data Riwayat:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const claimMission = async (missionId: string) => {
    if (!user || !userData) return;
    
    const mission = weeklyMissions.find(m => m.id === missionId);
    if (!mission || mission.isClaimed || mission.progress < mission.target) return;
    
    const startOfWeek = getStartOfWeekMonday7AM().getTime();
    const currentClaimed = userData?.current_week_start === startOfWeek ? (userData?.claimed_missions || []) : [];
    
    // 1. Update user document
    // We update `poin` which acts as gold, and `essence`
    // We also use `Timestamp.now()` from firestore, make sure it is imported
    const { Timestamp } = require("firebase/firestore");
    await updateDoc(doc(db, "Users", user.uid), {
        poin: (userData.poin || 0) + mission.reward,
        essence: (userData.essence || 0) + mission.reward,
        current_week_start: startOfWeek,
        claimed_missions: [...currentClaimed, missionId],
        last_misi_claimed: Timestamp.now(),
    });

    // 2. Add to Riwayat
    const riwayatId = generateChronologicalId(Date.now());
    await setDoc(doc(db, "Users", user.uid, "Riwayat", riwayatId), {
      judul: "Hadiah " + mission.title,
      tipe: "misi_mingguan",
      poin: mission.reward,
      essence: mission.reward,
      plastik: 0,
      logam: 0,
      tanggal: Timestamp.now(),
    });

    // 3. Add to Notifications
    const notifId = generateChronologicalId(Date.now() + 1);
    await setDoc(doc(db, "Users", user.uid, "Notifications", notifId), {
      title: "Misi Selesai! 🎉",
      message: `Selamat! Kamu telah menyelesaikan misi ${mission.title} dan mendapatkan +${mission.reward} Gold & Essence.`,
      desc: `Selamat! Kamu telah menyelesaikan misi ${mission.title} dan mendapatkan +${mission.reward} Gold & Essence.`,
      time: Timestamp.now(),
      icon: "bullseye",
      color_type: "success",
      isRead: false,
      type: "mission",
    });
  };

  // Sinkronisasi otomatis ke profil user (koleksi Users) jika ada data historis yang belum masuk
  useEffect(() => {
    if (!user || !userData || loading) return;

    if (
      userData.poin !== totalGold ||
      userData.essence !== totalEssence ||
      userData.total_plastik !== totalPlastik ||
      userData.total_logam !== totalLogam ||
      userData.streak !== hariKonsisten
    ) {
      updateDoc(doc(db, "Users", user.uid), {
        poin: totalGold,
        essence: totalEssence,
        total_plastik: totalPlastik,
        total_logam: totalLogam,
        streak: hariKonsisten,
      }).catch((e) => console.error("Gagal sinkronisasi data profil:", e));
    }
  }, [totalGold, totalEssence, totalPlastik, totalLogam, hariKonsisten, userData, user, loading]);

  return (
    <PointContext.Provider
      value={{
        totalGold,
        totalEssence,
        totalPlastik,
        totalLogam,
        hariKonsisten,
        weeklyMissions,
        loading,
        claimMission,
      }}
    >
      {children}
    </PointContext.Provider>
  );
};

export const usePoints = () => useContext(PointContext);
