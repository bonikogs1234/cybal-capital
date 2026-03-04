import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCflprFBgFC5GeXix5k5V0NqZm2nmH4Wag",
  authDomain: "cybal-capital-cc9d1.firebaseapp.com",
  projectId: "cybal-capital-cc9d1",
  storageBucket: "cybal-capital-cc9d1.firebasestorage.app",
  messagingSenderId: "544084788794",
  appId: "1:544084788794:web:dec3f0f519b1e29584d703"
};

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);
export default app;