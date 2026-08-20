import { collection, onSnapshot, query } from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { db } from "./firebaseConfig";

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
  const [totalPoin, setTotalPoin] = useState(0);
  const [totalPlastik, setTotalPlastik] = useState(0);
  const [totalLogam, setTotalLogam] = useState(0);
  const [hariKonsisten, setHariKonsisten] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // KITA BACA KOLEKSI "Riwayat" SESUAI FOTO FIREBASE-MU
    const q = query(collection(db, "Riwayat"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let hitungPoin = 0;
        let hitungPlastik = 0;
        let hitungLogam = 0;
        const tanggalUnik = new Set();

        // LOG PELACAK (Cek terminal VS Code-mu nanti!)
        console.log(
          "✅ Terhubung ke Firebase! Jumlah dokumen ditemukan:",
          snapshot.size,
        );

        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log("📄 Isi Dokumen Terbaca:", data);

          if (data.poin) hitungPoin += data.poin;
          if (data.plastik) hitungPlastik += data.plastik;
          if (data.logam) hitungLogam += data.logam;

          if (data.tanggal) {
            try {
              const dateString = data.tanggal
                .toDate()
                .toISOString()
                .split("T")[0];
              tanggalUnik.add(dateString);
            } catch (e) {
              console.log("Format tanggal belum berupa Timestamp Firebase");
            }
          }
        });

        setTotalPoin(hitungPoin);
        setTotalPlastik(hitungPlastik);
        setTotalLogam(hitungLogam);
        setHariKonsisten(tanggalUnik.size);
        setLoading(false);
      },
      (error) => {
        console.error(
          "❌ Gagal mendengarkan Firebase (Cek Internetmu!):",
          error,
        );
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <PointContext.Provider
      value={{ totalPoin, totalPlastik, totalLogam, hariKonsisten, loading }}
    >
      {children}
    </PointContext.Provider>
  );
};

export const usePoints = () => useContext(PointContext);
