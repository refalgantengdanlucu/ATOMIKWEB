import {
  collection,
  doc,
  onSnapshot,
  limit,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
  where,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { DEFAULT_INSTITUTION_ID } from '../lib/access-context';
import type { TopicId } from '../types';

export type AttemptType = 'diagnostic' | 'practice' | 'unknown';

export interface TeacherQuizAttempt {
  id: string;
  uid: string | null;
  alias: string;
  className?: string | null;
  moduleId: string | null;
  activityName: string;
  attemptType: AttemptType;
  questionVersion: string | null;
  score: number | null;
  maxScore: number | null;
  percent: number | null;
  answers: Record<string, string> | null;
  elapsedSeconds?: number | null;
  status?: 'in_progress' | 'submitted' | null;
  serverReceivedAt: Date | null;
}

export interface AttemptFeed {
  status: 'loading' | 'empty' | 'ready' | 'error';
  attempts: TeacherQuizAttempt[];
  updatedAt: Date | null;
  error?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeAnswers(value: unknown): Record<string, string> | null {
  if (!isRecord(value)) return null;
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
  );
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

function normalizeAttempt(id: string, value: Record<string, unknown>): TeacherQuizAttempt {
  const attemptType = value.attemptType === 'diagnostic' || value.attemptType === 'practice'
    ? value.attemptType
    : 'unknown';

  return {
    id,
    uid: typeof value.uid === 'string' ? value.uid : null,
    alias: typeof value.alias === 'string'
      ? value.alias
      : typeof value.uid === 'string'
        ? `Siswa-${value.uid.slice(0, 6)}`
        : 'Siswa tanpa alias',
    className: typeof value.className === 'string' ? value.className : null,
    moduleId: typeof value.moduleId === 'string' ? value.moduleId : null,
    activityName: typeof value.activityName === 'string'
      ? value.activityName
      : typeof value.quizTitle === 'string'
        ? value.quizTitle
        : 'Aktivitas tidak diketahui',
    attemptType,
    questionVersion: typeof value.questionVersion === 'string' ? value.questionVersion : null,
    score: typeof value.score === 'number' && Number.isFinite(value.score) ? value.score : null,
    maxScore: typeof value.maxScore === 'number' && Number.isFinite(value.maxScore) ? value.maxScore : null,
    percent: typeof value.percent === 'number' && Number.isFinite(value.percent) ? value.percent : null,
    answers: normalizeAnswers(value.answers),
    elapsedSeconds: typeof value.elapsedSeconds === 'number' && Number.isFinite(value.elapsedSeconds)
      ? value.elapsedSeconds
      : null,
    status: value.status === 'in_progress' || value.status === 'submitted' ? value.status : null,
    serverReceivedAt: normalizeServerTime(value.serverReceivedAt),
  };
}

export function subscribeAcceptedAttempts(
  onChange: (feed: AttemptFeed) => void,
  institutionId: string,
): () => void {
  if (!db) {
    onChange({
      status: 'error',
      attempts: [],
      updatedAt: null,
      error: 'Firestore belum dikonfigurasi.',
    });
    return () => {};
  }

  onChange({ status: 'loading', attempts: [], updatedAt: null });
  const attemptsQuery = query(
    collection(db, 'quiz_attempts'),
    where('institutionId', '==', institutionId),
    limit(200),
  );
  return onSnapshot(
    attemptsQuery,
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.metadata.fromCache) return;

      const attempts = snapshot.docs
        .filter((document) => !document.metadata.hasPendingWrites)
        .map((document) => normalizeAttempt(document.id, document.data()))
        .sort(
          (left, right) =>
            (right.serverReceivedAt?.getTime() ?? 0) - (left.serverReceivedAt?.getTime() ?? 0),
        );

      onChange({
        status: attempts.length > 0 ? 'ready' : 'empty',
        attempts,
        updatedAt: new Date(),
      });
    },
    (error) => {
      console.error('Gagal memuat hasil kuis Panel Guru:', error);
      onChange({
        status: 'error',
        attempts: [],
        updatedAt: null,
        error: 'Hasil kuis gagal dimuat. Periksa koneksi dan aturan akses Firestore.',
      });
    }
  );
}

export async function saveTopicQuizAttempt({
  moduleId,
  activityName,
  answers,
  score,
  maxScore,
  percent,
  attemptId,
  elapsedSeconds,
  studentIdentity,
}: {
  moduleId: TopicId;
  activityName: string;
  answers: Record<string, string>;
  score: number;
  maxScore: number;
  percent: number;
  attemptId: string;
  elapsedSeconds: number;
  studentIdentity: {
    uid: string | null;
    name: string;
    className: string;
    institutionId?: string;
  };
}): Promise<void> {
  const user = auth?.currentUser;
  if (!db || !user) throw new Error('Sesi Firebase diperlukan untuk mengirim hasil kuis.');
  const institutionId = studentIdentity.institutionId || DEFAULT_INSTITUTION_ID;

  const attemptRef = doc(db, 'quiz_attempts', attemptId);
  await setDoc(attemptRef, {
    id: attemptRef.id,
    uid: user.uid,
    institutionId,
    alias: studentIdentity.name || `Siswa-${user.uid.slice(0, 6)}`,
    className: studentIdentity.className,
    quizTitle: activityName,
    elapsedSeconds,
    status: 'submitted',
    moduleId,
    activityName,
    attemptType: 'practice',
    questionVersion: 'v1',
    answers,
    score,
    maxScore,
    percent,
    submittedAt: new Date().toISOString(),
    serverReceivedAt: serverTimestamp(),
  });
}
