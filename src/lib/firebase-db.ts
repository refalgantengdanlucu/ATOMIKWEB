import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  limit,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import { isValidInstitutionId } from './access-context';
import type { StudentActivity, TrackedQuizResult } from './classroom';

/**
 * Menyimpan aktivitas siswa ke koleksi 'student_activities'.
 */
export async function saveStudentActivity(activity: StudentActivity): Promise<void> {
  if (!db || !isFirebaseConfigured) return;
  if (!activity.uid) throw new Error('UID siswa diperlukan untuk menyimpan aktivitas.');
  if (!auth?.currentUser || auth.currentUser.uid !== activity.uid) {
    throw new Error('Sesi Firebase tidak cocok dengan pemilik aktivitas.');
  }
  if (!isValidInstitutionId(activity.institutionId)) {
    throw new Error('Akun siswa belum ditetapkan ke institusi oleh administrator.');
  }
  const activityRef = doc(db, 'student_activities', activity.uid);
  await setDoc(activityRef, activity, { merge: true });
}

/**
 * Berlangganan (realtime listener) data aktivitas siswa untuk tampilan guru.
 */
export function subscribeStudentActivities(
  callback: (activities: StudentActivity[]) => void,
  institutionId: string,
): () => void {
  if (!db || !isFirebaseConfigured || !isValidInstitutionId(institutionId)) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'student_activities'),
    where('institutionId', '==', institutionId),
    limit(100),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items: StudentActivity[] = [];
      snapshot.forEach((d) => items.push(d.data() as StudentActivity));
      callback(items.sort((a, b) => Date.parse(b.lastSeen) - Date.parse(a.lastSeen)));
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
  const profileSnapshot = await getDoc(doc(db, 'profiles', user.uid));
  const profile = profileSnapshot.data();
  if (
    !profileSnapshot.exists() ||
    !isValidInstitutionId(profile?.institutionId) ||
    typeof profile.name !== 'string' ||
    typeof profile.className !== 'string'
  ) {
    throw new Error('Akun siswa belum ditetapkan ke institusi oleh administrator.');
  }

  const attemptRef = doc(collection(db, 'quiz_attempts'));
  await setDoc(attemptRef, {
    id: attemptRef.id,
    uid: user.uid,
    institutionId: profile.institutionId,
    alias: profile.name,
    className: profile.className,
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
  callback: (results: TrackedQuizResult[]) => void,
  institutionId: string,
): () => void {
  if (!db || !isFirebaseConfigured || !isValidInstitutionId(institutionId)) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'quiz_attempts'),
    where('institutionId', '==', institutionId),
    limit(150),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items: TrackedQuizResult[] = [];
      snapshot.forEach((d) => items.push(d.data() as TrackedQuizResult));
      callback(items.sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt)));
    },
    (error) => {
      console.error('Gagal mengambil data kuis dari Firebase:', error);
    }
  );
}
