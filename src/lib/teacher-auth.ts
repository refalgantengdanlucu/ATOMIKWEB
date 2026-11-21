import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
} from 'firebase/auth';
import { db, auth, isFirebaseConfigured } from './firebase';
import { saveUserProfile } from './firebase-db';

export interface TeacherAuthConfig {
  passwordHash: string;
  salt: string;
  status: 'active' | 'disabled';
  updatedAt: string;
}

// Inisialisasi awal salt & hash SHA-256 untuk sandi otorisasi guru di Firestore
// Disimpan dalam bentuk hash kriptografis agar sandi plaintext tidak pernah disimpan di source code
const DEFAULT_SALT = 'atomika_salt_v1';
const DEFAULT_HASH = 'd97bdc9cfba7b55528ece8d7ec203c664fc325b63e7197d28b7285158ca73186';

const TEACHER_EMAIL = 'guru.atomika@atomika.id';
const TEACHER_AUTH_INTERNAL = 'AtomikaGuruPass2026!';

/**
 * Menghasilkan hash SHA-256 menggunakan Web Crypto API standar.
 */
export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password.trim()}`);
  const cryptoObj = typeof globalThis !== 'undefined' && globalThis.crypto ? globalThis.crypto : window.crypto;
  const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Mengambil konfigurasi sandi guru dari Firestore settings/teacher_access.
 * Jika dokumen belum ada di Firestore, otomatis diinisialisasi.
 */
export async function getTeacherAuthConfig(): Promise<TeacherAuthConfig> {
  if (!db || !isFirebaseConfigured) {
    return {
      passwordHash: DEFAULT_HASH,
      salt: DEFAULT_SALT,
      status: 'active',
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const configRef = doc(db, 'settings', 'teacher_access');
    const snap = await getDoc(configRef);
    if (snap.exists()) {
      return snap.data() as TeacherAuthConfig;
    }

    // Buat dokumen konfigurasi awal di Firestore jika belum ada
    const initialConfig: TeacherAuthConfig = {
      passwordHash: DEFAULT_HASH,
      salt: DEFAULT_SALT,
      status: 'active',
      updatedAt: new Date().toISOString(),
    };
    await setDoc(configRef, initialConfig);
    return initialConfig;
  } catch (err) {
    console.warn('Gagal membaca konfigurasi sandi guru dari Firestore, memakai fallback aman:', err);
    return {
      passwordHash: DEFAULT_HASH,
      salt: DEFAULT_SALT,
      status: 'active',
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Memverifikasi sandi khusus guru terhadap hash tersimpan di database.
 */
export async function verifyTeacherPassword(
  inputPassword: string
): Promise<{ valid: boolean; message?: string }> {
  const config = await getTeacherAuthConfig();

  if (config.status !== 'active') {
    return {
      valid: false,
      message: 'Akses login guru saat ini dinonaktifkan oleh administrator.',
    };
  }

  const computedHash = await hashPasswordWithSalt(inputPassword, config.salt);
  if (computedHash !== config.passwordHash) {
    return {
      valid: false,
      message: 'Sandi guru tidak sesuai',
    };
  }

  return { valid: true };
}

/**
 * Melakukan proses login guru menggunakan sandi khusus:
 * 1. Verifikasi sandi terhadap hash di database
 * 2. Membuat sesi autentikasi Firebase yang valid
 * 3. Menyimpan/memperbarui profil guru di koleksi 'users'
 */
export async function loginAsTeacherWithPassword(password: string): Promise<void> {
  const check = await verifyTeacherPassword(password);
  if (!check.valid) {
    throw new Error(check.message || 'Sandi guru tidak sesuai');
  }

  // Jika Firebase dikonfigurasi, buat atau sinkronkan sesi Firebase guru
  if (isFirebaseConfigured && auth) {
    let teacherUid = '';

    try {
      // Coba login dengan akun sesi guru khusus
      const cred = await signInWithEmailAndPassword(auth, TEACHER_EMAIL, TEACHER_AUTH_INTERNAL);
      teacherUid = cred.user.uid;
    } catch (authErr: any) {
      const code = authErr?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        try {
          // Buat akun sesi guru jika belum pernah dibuat
          const newCred = await createUserWithEmailAndPassword(
            auth,
            TEACHER_EMAIL,
            TEACHER_AUTH_INTERNAL
          );
          teacherUid = newCred.user.uid;
        } catch {
          // Fallback: coba signInAnonymously jika ada pembatasan registrasi email
          try {
            const anonCred = await signInAnonymously(auth);
            teacherUid = anonCred.user.uid;
          } catch {
            console.warn('Gagal inisialisasi sesi Firebase Auth untuk guru, fallback sesi lokal');
          }
        }
      } else {
        // Coba fallback anonim
        try {
          const anonCred = await signInAnonymously(auth);
          teacherUid = anonCred.user.uid;
        } catch {
          console.warn('Gagal signInAnonymously untuk guru, fallback sesi lokal');
        }
      }
    }

    // Simpan data role guru di Firestore users jika teacherUid tersedia
    if (teacherUid) {
      try {
        await saveUserProfile({
          uid: teacherUid,
          email: TEACHER_EMAIL,
          name: 'Guru ATOMIKA',
          className: '',
          role: 'teacher',
          status: 'active',
          updatedAt: new Date().toISOString(),
        });
      } catch (saveErr) {
        console.warn('Gagal menyimpan profil guru ke Firestore:', saveErr);
      }
    }
  }
}

/**
 * Mengganti sandi khusus guru di database Firestore.
 * Sandi baru akan di-hash menggunakan salt acak baru.
 */
export async function updateTeacherPassword(newPassword: string): Promise<void> {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Database Firebase tidak tersedia.');
  }

  const salt =
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const passwordHash = await hashPasswordWithSalt(newPassword, salt);

  const updatedConfig: TeacherAuthConfig = {
    passwordHash,
    salt,
    status: 'active',
    updatedAt: new Date().toISOString(),
  };

  const configRef = doc(db, 'settings', 'teacher_access');
  await setDoc(configRef, updatedConfig, { merge: true });
}
