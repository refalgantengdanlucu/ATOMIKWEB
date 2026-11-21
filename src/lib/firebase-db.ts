import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  limit,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type {
  AttendanceRecord,
  PollResponse,
  StudentActivity,
  StudentProgress,
} from './classroom';
import { normalizeStudentName } from './classroom';
import type { TrackedQuizResult } from './classroom-sync';
import type { AccessProfile } from './access-context';

export interface FirebaseUserProfile {
  uid: string;
  email: string;
  name: string;
  className: string;
  role: 'student' | 'teacher';
  status?: 'active' | 'inactive';
  updatedAt: string;
}

/**
 * Daftar email guru default yang diotorisasi.
 * Admin juga dapat menambahkan email guru baru ke koleksi 'authorized_teachers' di Firestore.
 */
const DEFAULT_AUTHORIZED_TEACHER_EMAILS = [
  'guru@atomika.id',
  'guru.atomika@atomika.id',
  'guru.kimia@sekolah.sch.id',
  'refaldi.widiansyah.2403316@students.um.ac.id',
];

/**
 * Memverifikasi apakah suatu email telah diotorisasi sebagai guru.
 * Mengecek konfigurasi environment, daftar guru default, dan koleksi Firestore 'authorized_teachers'.
 */
export async function isAuthorizedTeacherEmail(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  // 1. Cek dari environment variable jika diset
  const envList = (import.meta.env.VITE_AUTHORIZED_TEACHER_EMAILS || '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);
  if (envList.includes(normalized)) return true;

  // 2. Cek daftar email guru default
  if (DEFAULT_AUTHORIZED_TEACHER_EMAILS.map((e) => e.toLowerCase()).includes(normalized)) {
    return true;
  }

  // 3. Cek koleksi 'authorized_teachers' di Firestore
  if (db && isFirebaseConfigured) {
    try {
      const teacherRef = doc(db, 'authorized_teachers', normalized);
      const teacherSnap = await getDoc(teacherRef);
      if (teacherSnap.exists()) return true;

      // Cek apakah ada record di users dengan role teacher yang sudah terverifikasi
      const userRef = query(collection(db, 'users'), where('email', '==', normalized), where('role', '==', 'teacher'), limit(1));
      const userSnap = await getDocs(userRef);
      if (!userSnap.empty) return true;
    } catch (err) {
      console.warn('Gagal memverifikasi email guru dari Firestore:', err);
    }
  }

  return false;
}

/**
 * Menyimpan profil pengguna di koleksi 'users'.
 */
export async function saveUserProfile(profile: FirebaseUserProfile): Promise<void> {
  if (!db || !isFirebaseConfigured) return;
  const userRef = doc(db, 'users', profile.uid);
  await setDoc(userRef, profile, { merge: true });
}

/**
 * Mengambil profil pengguna dari koleksi 'users' berdasarkan UID.
 */
export async function getUserProfile(uid: string): Promise<FirebaseUserProfile | null> {
  if (!db || !isFirebaseConfigured) return null;
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return snap.data() as FirebaseUserProfile;
}

/**
 * Mengambil profil pengguna dari koleksi 'users' berdasarkan Email.
 */
export async function getUserProfileByEmail(email: string): Promise<FirebaseUserProfile | null> {
  if (!db || !isFirebaseConfigured) return null;
  const normalized = email.trim().toLowerCase();
  try {
    const q = query(collection(db, 'users'), where('email', '==', normalized), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as FirebaseUserProfile;
    }
    // Jika tidak ditemukan dengan huruf kecil, coba dengan email asli
    const qOrig = query(collection(db, 'users'), where('email', '==', email.trim()), limit(1));
    const snapOrig = await getDocs(qOrig);
    if (!snapOrig.empty) {
      return snapOrig.docs[0].data() as FirebaseUserProfile;
    }
  } catch (err) {
    console.warn('Gagal mencari profil user berdasarkan email:', err);
  }
  return null;
}

/**
 * Menentukan rute dashboard utama berdasarkan role pengguna.
 * - Guru -> '/kelas' (Dashboard Guru)
 * - Murid -> '/materi' (Dashboard Murid)
 */
export function getDashboardRouteForRole(role: 'student' | 'teacher'): string {
  return role === 'teacher' ? '/kelas' : '/materi';
}

/**
 * Mengubah FirebaseUserProfile menjadi AccessProfile.
 */
export function toAccessProfile(user: FirebaseUserProfile): AccessProfile {
  if (user.role === 'teacher') {
    return { role: 'teacher', name: user.name };
  }
  return {
    role: 'student',
    name: user.name,
    className: user.className || 'Belum diatur',
  };
}

/**
 * Menyimpan aktivitas siswa ke koleksi 'student_activities'.
 */
export async function saveStudentActivity(activity: StudentActivity): Promise<void> {
  if (!db || !isFirebaseConfigured) return;
  const docId = `${normalizeStudentName(activity.name)}_${normalizeStudentName(activity.className)}`;
  const activityRef = doc(db, 'student_activities', docId);
  await setDoc(activityRef, activity, { merge: true });
}

/**
 * Berlangganan (realtime listener) data aktivitas siswa untuk tampilan guru.
 */
export function subscribeStudentActivities(
  callback: (activities: StudentActivity[]) => void
): () => void {
  if (!db || !isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  const q = query(collection(db, 'student_activities'), orderBy('lastSeen', 'desc'), limit(100));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: StudentActivity[] = [];
      snapshot.forEach((d) => items.push(d.data() as StudentActivity));
      callback(items);
    },
    (error) => {
      console.error('Gagal mengambil data aktivitas dari Firebase:', error);
    }
  );
}

/**
 * Menyimpan hasil pengerjaan kuis ke koleksi 'quiz_attempts'.
 */
export async function saveQuizAttempt(attempt: TrackedQuizResult): Promise<void> {
  if (!db || !isFirebaseConfigured) return;
  const attemptRef = doc(db, 'quiz_attempts', attempt.id);
  await setDoc(attemptRef, attempt, { merge: true });
}

/**
 * Berlangganan data hasil kuis secara realtime.
 */
export function subscribeQuizAttempts(
  callback: (results: TrackedQuizResult[]) => void
): () => void {
  if (!db || !isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  const q = query(collection(db, 'quiz_attempts'), orderBy('submittedAt', 'desc'), limit(150));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: TrackedQuizResult[] = [];
      snapshot.forEach((d) => items.push(d.data() as TrackedQuizResult));
      callback(items);
    },
    (error) => {
      console.error('Gagal mengambil data kuis dari Firebase:', error);
    }
  );
}

/**
 * Menyimpan presensi kehadiran siswa ke koleksi 'attendance'.
 */
export async function saveAttendance(record: AttendanceRecord): Promise<void> {
  if (!db || !isFirebaseConfigured) return;
  const docId = `${record.date}_${normalizeStudentName(record.name)}`;
  const attendanceRef = doc(db, 'attendance', docId);
  await setDoc(attendanceRef, record, { merge: true });
}

/**
 * Berlangganan data presensi untuk tanggal tertentu.
 */
export function subscribeAttendance(
  dateKey: string,
  callback: (records: AttendanceRecord[]) => void
): () => void {
  if (!db || !isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  const q = query(collection(db, 'attendance'), orderBy('checkedInAt', 'asc'), limit(200));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: AttendanceRecord[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as AttendanceRecord;
        if (data.date === dateKey) {
          items.push(data);
        }
      });
      callback(items);
    },
    (error) => {
      console.error('Gagal mengambil data presensi dari Firebase:', error);
    }
  );
}

/**
 * Menyimpan respon polling siswa ke koleksi 'classroom_polls'.
 */
export async function savePollResponse(sessionId: string, response: PollResponse): Promise<void> {
  if (!db || !isFirebaseConfigured) return;
  const pollRef = doc(db, 'classroom_polls', `${sessionId}_${response.id}`);
  await setDoc(pollRef, { sessionId, ...response }, { merge: true });
}

/**
 * Menyimpan progres tugas laporan praktikum siswa ke koleksi 'student_progress'.
 */
export async function saveStudentProgress(progress: StudentProgress): Promise<void> {
  if (!db || !isFirebaseConfigured) return;
  const docId = normalizeStudentName(progress.name);
  const progressRef = doc(db, 'student_progress', docId);
  await setDoc(progressRef, progress, { merge: true });
}
