import { initializeApp, getApps, FirebaseApp } from "firebase/app"; 
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getAuth, Auth } from "firebase/auth";
// @ts-ignore
import { getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = { 
  apiKey: "AIzaSyAk17YQ_7yKAnfnW8EfO-8O8cUMKpzO8_M", 
  authDomain: "eco-point-2230e.firebaseapp.com", 
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
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} else {
  app = getApps()[0];
  auth = getAuth(app); 
}

export { app, auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
