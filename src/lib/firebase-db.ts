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
import { DEFAULT_INSTITUTION_ID, isValidInstitutionId } from './access-context';
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
  const instId = activity.institutionId || DEFAULT_INSTITUTION_ID;
  const activityRef = doc(db, 'student_activities', activity.uid);
  await setDoc(activityRef, { ...activity, institutionId: instId }, { merge: true });
}

/**
 * Berlangganan (realtime listener) data aktivitas siswa untuk tampilan guru.
 */
export function subscribeStudentActivities(
  callback: (activities: StudentActivity[]) => void,
  institutionId?: string,
): () => void {
  const instId = institutionId || DEFAULT_INSTITUTION_ID;
  if (!db || !isFirebaseConfigured || !isValidInstitutionId(instId)) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'student_activities'),
    where('institutionId', '==', instId),
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
  const instId = isValidInstitutionId(profile?.institutionId)
    ? profile.institutionId
    : DEFAULT_INSTITUTION_ID;
  const alias = typeof profile?.name === 'string' && profile.name.trim()
    ? profile.name
    : user.displayName || `Siswa-${user.uid.slice(0, 6)}`;
  const className = typeof profile?.className === 'string'
    ? profile.className
    : attempt.className || 'Belum diatur';

  const attemptRef = doc(collection(db, 'quiz_attempts'));
  await setDoc(attemptRef, {
    id: attemptRef.id,
    uid: user.uid,
    institutionId: instId,
    alias,
    className,
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
  institutionId?: string,
): () => void {
  const instId = institutionId || DEFAULT_INSTITUTION_ID;
  if (!db || !isFirebaseConfigured || !isValidInstitutionId(instId)) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'quiz_attempts'),
    where('institutionId', '==', instId),
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
