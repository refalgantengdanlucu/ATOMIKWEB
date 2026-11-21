import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  getAuth,
  setPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim();
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim();
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim();
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim();
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim();

export const isFirebaseConfigured = Boolean(apiKey && authDomain && projectId && appId);

const firebaseApp = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp({
        apiKey,
        authDomain,
        projectId,
        appId,
        ...(storageBucket ? { storageBucket } : {}),
        ...(messagingSenderId ? { messagingSenderId } : {}),
      })
  : null;

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;

const rememberSessionKey = 'atomika-remember-session-v1';

export function setRememberSession(remember: boolean) {
  try {
    window.localStorage.setItem(rememberSessionKey, String(remember));
  } catch (error) {
    console.error('Preferensi sesi tidak dapat disimpan:', error);
    throw new Error('Pengaturan sesi tidak dapat disimpan pada browser ini.');
  }
}

export function getRememberSession() {
  try {
    return window.localStorage.getItem(rememberSessionKey) === 'true';
  } catch (error) {
    console.error('Preferensi sesi tidak dapat dibaca:', error);
    return false;
  }
}

export async function applySessionPersistence() {
  if (!auth) throw new Error('Autentikasi Firebase belum dikonfigurasi.');
  await setPersistence(auth, getRememberSession() ? browserLocalPersistence : browserSessionPersistence);
}
