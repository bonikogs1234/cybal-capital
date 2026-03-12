import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "AIzaSyCflprFBgFC5GeXix5k5V0NqZm2nmH4Wag",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "cybal-capital-cc9d1.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "cybal-capital-cc9d1",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "cybal-capital-cc9d1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| "544084788794",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "1:544084788794:web:dec3f0f519b1e29584d703"
};

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);
export default app;