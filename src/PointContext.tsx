import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { db } from "./firebaseConfig";
import { useAuth } from "./AuthContext";

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
  const { user } = useAuth();
  
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

    // KITA BACA KOLEKSI "Riwayat" KHUSUS UNTUK USER AKTIF
    const q = query(
      collection(db, "Riwayat"),
      where("user", "==", user.uid)
    );

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
                const dateString = data.tanggal.toDate().toISOString().split("T")[0];
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
      }
    );

    return () => unsubscribe();
  }, [user]);

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
