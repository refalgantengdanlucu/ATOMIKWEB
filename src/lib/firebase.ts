import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const stripQuotes = (val?: string) => val?.trim().replace(/^["']|["']$/g, '');

const apiKey = stripQuotes(import.meta.env.VITE_FIREBASE_API_KEY);
const authDomain = stripQuotes(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
const projectId = stripQuotes(import.meta.env.VITE_FIREBASE_PROJECT_ID);
const storageBucket = stripQuotes(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
const messagingSenderId = stripQuotes(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
const appId = stripQuotes(import.meta.env.VITE_FIREBASE_APP_ID);
const measurementId = stripQuotes(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID);

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId: measurementId || undefined,
};

export const isFirebaseConfigured = Boolean(apiKey && projectId);

function initFirebase(): { app: FirebaseApp | null; auth: Auth | null; db: Firestore | null } {
  if (!isFirebaseConfigured) {
    return { app: null, auth: null, db: null };
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    return { app, auth, db };
  } catch (error) {
    console.error('Inisialisasi Firebase gagal:', error);
    return { app: null, auth: null, db: null };
  }
}

const { app, auth, db } = initFirebase();

export { app, auth, db };

const rememberSessionKey = 'atomika-remember-session-v1';

export function setRememberSession(remember: boolean) {
  try {
    window.localStorage.setItem(rememberSessionKey, String(remember));
    if (auth) {
      void setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence
      ).catch((err) => console.error('Gagal mengatur persistensi sesi Firebase:', err));
    }
  } catch (error) {
    console.error('Preferensi sesi tidak dapat disimpan:', error);
  }
}

export function getRememberSession(): boolean {
  try {
    return window.localStorage.getItem(rememberSessionKey) === 'true';
  } catch {
    return false;
  }
}

