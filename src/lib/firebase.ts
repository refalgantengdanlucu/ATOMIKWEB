import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  getAuth,
  setPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorageItem, setStorageItem } from './safe-storage';

function stripQuotes(value?: string) {
  return value?.trim().replace(/^["']|["']$/g, '');
}

const apiKey = stripQuotes(import.meta.env.VITE_FIREBASE_API_KEY);
const authDomain = stripQuotes(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
const projectId = stripQuotes(import.meta.env.VITE_FIREBASE_PROJECT_ID);
const storageBucket = stripQuotes(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
const messagingSenderId = stripQuotes(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
const appId = stripQuotes(import.meta.env.VITE_FIREBASE_APP_ID);
const measurementId = stripQuotes(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID);

const firebaseConfig: FirebaseOptions = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId: measurementId || undefined,
};

export function isFirebaseConfigComplete(
  config: Pick<FirebaseOptions, 'apiKey' | 'authDomain' | 'projectId' | 'appId'>
): boolean {
  const requiredConfig = [config.apiKey, config.authDomain, config.projectId, config.appId];
  return requiredConfig.every(
    (value) => Boolean(value) && !value?.toLowerCase().startsWith('your-')
  );
}

export const isFirebaseConfigured = isFirebaseConfigComplete(firebaseConfig);

const firebaseApp = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;

const rememberSessionKey = 'atomika-remember-session-v1';

export function setRememberSession(remember: boolean) {
  if (!setStorageItem(rememberSessionKey, String(remember))) {
    throw new Error('Pengaturan sesi tidak dapat disimpan pada browser ini.');
  }
}

export function getRememberSession() {
  return getStorageItem(rememberSessionKey).value === 'true';
}

export async function applySessionPersistence() {
  if (!auth) throw new Error('Autentikasi Firebase belum dikonfigurasi.');
  await setPersistence(auth, getRememberSession() ? browserLocalPersistence : browserSessionPersistence);
}
