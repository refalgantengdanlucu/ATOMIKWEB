import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import type {
  AttendanceRecord,
  PollResponse,
  StudentActivity,
  StudentProgress,
} from './classroom';
import { normalizeStudentName } from './classroom';
import type { TrackedQuizResult } from './classroom-sync';

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
  if (!db || !isFirebaseConfigured) throw new Error('Firestore belum dikonfigurasi untuk menyimpan hasil kuis.');
  const user = auth?.currentUser;
  if (!user) throw new Error('Sesi Firebase diperlukan untuk menyimpan hasil kuis.');

  const attemptRef = doc(collection(db, 'quiz_attempts'));
  await setDoc(attemptRef, {
    id: attemptRef.id,
    uid: user.uid,
    alias: `Siswa-${user.uid.slice(0, 6)}`,
    className: attempt.className,
    quizTitle: attempt.quizTitle,
    activityName: attempt.quizTitle,
    moduleId: 'classroom',
    attemptType: 'practice',
    questionVersion: 'unversioned',
    answers: {},
    score: attempt.score,
    maxScore: attempt.maxScore,
    percent: attempt.percent,
    submittedAt: attempt.submittedAt,
    serverReceivedAt: serverTimestamp(),
  });
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
