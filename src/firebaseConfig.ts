import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Masukkan kode dari Firebase Console milikmu di sini
const firebaseConfig = {
  apiKey: "AIzaSyAk17YQ_7yKAnfnW8EfO-8O8cUMKpzO8_M",
  authDomain: "eco-point-2230e.firebaseapp.com",
  projectId: "eco-point-2230e",
  storageBucket: "eco-point-2230e.firebasestorage.app",
  messagingSenderId: "978442311403",
  appId: "1:978442311403:web:f6b88dbcf3226224dd50ae",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
