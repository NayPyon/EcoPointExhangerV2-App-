import { collection, onSnapshot, query } from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { db } from "./firebaseConfig";

// 1. Tambahkan variabel baru ke dalam struktur jembatan
interface PointContextType {
  totalPoin: number;
  totalBottles: number;
  hariKonsisten: number;
  loading: boolean;
}

const PointContext = createContext<PointContextType>({
  totalPoin: 0,
  totalBottles: 0,
  hariKonsisten: 0,
  loading: true,
});

export const PointProvider = ({ children }: { children: ReactNode }) => {
  const [totalPoin, setTotalPoin] = useState(0);
  const [totalBottles, setTotalBottles] = useState(0); // State untuk botol
  const [hariKonsisten, setHariKonsisten] = useState(0); // State untuk hari

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "Riwayat_Transaksi"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let hitungPoin = 0;
        let hitungBotol = 0;
        const tanggalUnik = new Set(); // Mengumpulkan tanggal yang tidak duplikat

        snapshot.forEach((doc) => {
          const data = doc.data();

          // Kalkulasi Poin
          if (data.poin_didapat) hitungPoin += data.poin_didapat;

          // Kalkulasi Botol (Pastikan nama field di Firebase adalah 'total_botol')
          if (data.total_botol) hitungBotol += data.total_botol;

          // Kalkulasi Hari Konsisten dari Timestamp Firebase
          if (data.timestamp) {
            // Mengubah waktu Firebase menjadi format tanggal "YYYY-MM-DD"
            const dateString = data.timestamp
              .toDate()
              .toISOString()
              .split("T")[0];
            tanggalUnik.add(dateString);
          }
        });

        setTotalPoin(hitungPoin);
        setTotalBottles(hitungBotol); // Update botol
        setHariKonsisten(tanggalUnik.size); // Update hari konsisten (jumlah tanggal unik)
        setLoading(false);
      },
      (error) => {
        console.error("Gagal mendengarkan Firebase:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // 2. Lempar semua datanya ke luar supaya bisa ditangkap oleh layar
  return (
    <PointContext.Provider
      value={{ totalPoin, totalBottles, hariKonsisten, loading }}
    >
      {children}
    </PointContext.Provider>
  );
};

export const usePoints = () => useContext(PointContext);
