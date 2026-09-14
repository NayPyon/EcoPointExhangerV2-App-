import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAkl7YQ_7yKAnfnw8EfO-8o8cUMKpzO8_M",
  authDomain: "eco-point-2230e.firebaseapp.com",
  databaseURL:
    "https://eco-point-2230e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "eco-point-2230e",
  storageBucket: "eco-point-2230e.firebasestorage.app",
  messagingSenderId: "978442311403",
  appId: "1:978442311403:web:f6b88dbcf3226224dd50ae",
};

let app: FirebaseApp;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} else {
  app = getApps()[0];
  auth = getAuth(app);
}

export { app, auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
