import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { DEFAULT_INSTITUTION_ID, isValidInstitutionId } from './access-context';
import { readJsonStorage, writeJsonStorage } from './safe-storage';
import type { TopicId } from '../types';

export interface EssaySubmission {
  id: string;
  uid: string;
  institutionId: string;
  studentName: string;
  className: string;
  questionId: string;
  questionNumber: number;
  subtopicId: TopicId;
  subtopicTitle: string;
  prompt: string;
  answer: string;
  savedAt: string;
  updatedAt: string;
  teacherScore?: number | null;
  teacherFeedback?: string | null;
  serverReceivedAt?: Date | null;
}

function essayStorageKey(uid: string): string {
  return `atomika-essay-answers-v1:${uid}`;
}

function normalizeServerTime(value: unknown): Date | null {
  if (value && typeof value === 'object' && 'toDate' in value) {
    const toDate = (value as Timestamp).toDate;
    if (typeof toDate === 'function') {
      const date = toDate.call(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }
  return null;
}

/**
 * Menyimpan atau memperbarui jawaban essay siswa ke Firestore dan localStorage.
 */
export async function saveEssayAnswer({
  uid,
  studentName,
  className,
  questionId,
  questionNumber,
  subtopicId,
  subtopicTitle,
  prompt,
  answer,
  institutionId,
}: {
  uid: string;
  studentName: string;
  className: string;
  questionId: string;
  questionNumber: number;
  subtopicId: TopicId;
  subtopicTitle: string;
  prompt: string;
  answer: string;
  institutionId?: string;
}): Promise<EssaySubmission> {
  const instId = isValidInstitutionId(institutionId) ? institutionId : DEFAULT_INSTITUTION_ID;
  const now = new Date().toISOString();
  const submissionId = `${uid}_${questionId}`;

  const submission: EssaySubmission = {
    id: submissionId,
    uid,
    institutionId: instId,
    studentName: studentName.trim() || 'Siswa ATOMIKA',
    className: className.trim() || 'Belum diatur',
    questionId,
    questionNumber,
    subtopicId,
    subtopicTitle,
    prompt,
    answer: answer.trim(),
    savedAt: now,
    updatedAt: now,
  };

  // Simpan secara lokal segera untuk persistensi instan
  const localCache = readJsonStorage<Record<string, EssaySubmission>>(essayStorageKey(uid), {}).value || {};
  localCache[questionId] = submission;
  writeJsonStorage(essayStorageKey(uid), localCache);

  // Simpan ke Firestore jika tersedia
  if (db && isFirebaseConfigured) {
    try {
      const essayDocRef = doc(db, 'essay_submissions', submissionId);
      await setDoc(
        essayDocRef,
        {
          ...submission,
          serverReceivedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (err) {
      console.warn('Gagal menyimpan jawaban essay ke Firestore, tersimpan di penyimpanan lokal:', err);
    }
  }

  return submission;
}

/**
 * Membaca seluruh jawaban essay siswa dari cache lokal dan Firestore.
 */
export async function loadStudentEssayAnswers(uid: string): Promise<Record<string, EssaySubmission>> {
  const localCache = readJsonStorage<Record<string, EssaySubmission>>(essayStorageKey(uid), {}).value || {};

  if (!db || !isFirebaseConfigured || !uid) {
    return localCache;
  }

  try {
    const q = query(collection(db, 'essay_submissions'), where('uid', '==', uid));
    const snapshot = await getDocs(q);
    const remoteData: Record<string, EssaySubmission> = {};

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      remoteData[data.questionId] = {
        id: docSnap.id,
        uid: data.uid,
        institutionId: data.institutionId || DEFAULT_INSTITUTION_ID,
        studentName: data.studentName || 'Siswa ATOMIKA',
        className: data.className || '',
        questionId: data.questionId,
        questionNumber: data.questionNumber,
        subtopicId: data.subtopicId,
        subtopicTitle: data.subtopicTitle,
        prompt: data.prompt,
        answer: data.answer || '',
        savedAt: data.savedAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        teacherScore: typeof data.teacherScore === 'number' ? data.teacherScore : null,
        teacherFeedback: typeof data.teacherFeedback === 'string' ? data.teacherFeedback : null,
        serverReceivedAt: normalizeServerTime(data.serverReceivedAt),
      };
    });

    const merged = { ...localCache, ...remoteData };
    writeJsonStorage(essayStorageKey(uid), merged);
    return merged;
  } catch (err) {
    console.warn('Gagal memuat jawaban essay dari Firestore, memakai cache lokal:', err);
    return localCache;
  }
}

/**
 * Realtime listener untuk dashboard guru melihat seluruh rekapan essay siswa.
 */
export function subscribeAllEssaySubmissions(
  callback: (submissions: EssaySubmission[]) => void,
  institutionId?: string,
): () => void {
  const instId = institutionId || DEFAULT_INSTITUTION_ID;
  if (!db || !isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  try {
    const q = query(
      collection(db, 'essay_submissions'),
      where('institutionId', '==', instId),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const items: EssaySubmission[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            uid: data.uid,
            institutionId: data.institutionId || instId,
            studentName: data.studentName || 'Siswa ATOMIKA',
            className: data.className || '',
            questionId: data.questionId,
            questionNumber: data.questionNumber,
            subtopicId: data.subtopicId,
            subtopicTitle: data.subtopicTitle,
            prompt: data.prompt,
            answer: data.answer || '',
            savedAt: data.savedAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            teacherScore: typeof data.teacherScore === 'number' ? data.teacherScore : null,
            teacherFeedback: typeof data.teacherFeedback === 'string' ? data.teacherFeedback : null,
            serverReceivedAt: normalizeServerTime(data.serverReceivedAt),
          });
        });

        // Urutkan berdasarkan waktu pembaruan terbaru
        items.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
        callback(items);
      },
      (error) => {
        console.error('Gagal mengambil data essay dari Firestore:', error);
        callback([]);
      },
    );
  } catch (err) {
    console.error('Error saat subscribe essay submissions:', err);
    callback([]);
    return () => {};
  }
}

/**
 * Memperbarui nilai dan umpan balik guru untuk jawaban essay siswa.
 */
export async function gradeEssaySubmission(
  submissionIdOrParams: string | { submissionId: string; score: number | null; feedback: string },
  teacherScore?: number | null,
  teacherFeedback?: string,
): Promise<void> {
  if (!db || !isFirebaseConfigured) return;

  let subId = '';
  let scoreVal: number | null = null;
  let feedbackVal = '';

  if (typeof submissionIdOrParams === 'object' && submissionIdOrParams !== null) {
    subId = submissionIdOrParams.submissionId;
    scoreVal = submissionIdOrParams.score;
    feedbackVal = submissionIdOrParams.feedback || '';
  } else {
    subId = submissionIdOrParams;
    scoreVal = teacherScore !== undefined ? teacherScore : null;
    feedbackVal = teacherFeedback || '';
  }

  const essayDocRef = doc(db, 'essay_submissions', subId);
  await setDoc(
    essayDocRef,
    {
      teacherScore: scoreVal,
      teacherFeedback: feedbackVal.trim(),
      gradedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}
