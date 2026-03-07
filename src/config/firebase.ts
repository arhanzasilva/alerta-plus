import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC8X2ryugN6PJIkrK11QrYY04mA90lfdHw",
  authDomain: "alerta-plus.firebaseapp.com",
  projectId: "alerta-plus",
  storageBucket: "alerta-plus.firebasestorage.app",
  messagingSenderId: "956724663412",
  appId: "1:956724663412:web:8d8fb984ef3fe7bf3a6d21",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// getMessaging throws in environments without service worker support (SSR, Node)
export const messaging = (() => {
  try { return getMessaging(app); } catch { return null; }
})();
