import React, { createContext, useContext, useState } from "react";

// Membuat wadah data global untuk Poin dan Riwayat
const PointContext = createContext(undefined);

export const PointProvider = ({ children }) => {
  const [points, setPoints] = useState(1250); // Poin awal (contoh)
  const [totalBottles, setTotalBottles] = useState(12); // Total botol awal
  const [historyList, setHistoryList] = useState([
    {
      id: "1",
      title: "Penukaran 5 Botol Plastik",
      points: "+50 Poin",
      date: "Hari ini, 10:30",
    },
    {
      id: "2",
      title: "Penukaran 7 Botol Kaleng",
      points: "+70 Poin",
      date: "Kemarin, 14:15",
    },
  ]);

  // Fungsi untuk menambah poin ketika botol berhasil didaur ulang
  const addPoints = (amount, bottleCount) => {
    setPoints((prev) => prev + amount);
    setTotalBottles((prev) => prev + bottleCount);

    // Tambah ke riwayat otomatis
    const newHistory = {
      id: Date.now().toString(),
      title: `Penukaran ${bottleCount} Botol Daur Ulang`,
      points: `+${amount} Poin`,
      date: "Baru saja",
    };
    setHistoryList((prev) => [newHistory, ...prev]);
  };

  return (
    <PointContext.Provider
      value={{ points, totalBottles, historyList, addPoints }}
    >
      {children}
    </PointContext.Provider>
  );
};

export const usePoints = () => {
  const context = useContext(PointContext);
  if (!context) {
    throw new Error("usePoints harus digunakan di dalam PointProvider");
  }
  return context;
};
