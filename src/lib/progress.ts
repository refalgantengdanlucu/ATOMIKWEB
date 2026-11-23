import { useState, useEffect, useCallback } from 'react';
import type { LocalProgress, TopicId } from '../types';
import { TOPICS } from '../data/topics';
import { readJsonStorage, writeJsonStorage } from './safe-storage';

// ─────────────────────────────────────────────────────────
// Kebijakan Namespace per Pengguna (AD17-05)
// ─────────────────────────────────────────────────────────
// Progres setiap siswa disimpan pada kunci terpisah di localStorage.
// Format kunci: `atomika-progress-v1:{userKey}`
// - Jika Firebase aktif → userKey = UID Firebase (stabil, unik)
// - Jika tanpa Firebase → userKey = "nama|kelas" (lowercase, normalized)
// - Jika belum login sama sekali → userKey = "anonymous" (readonly/demo)
//
// Kunci lama `atomika-progress-v1` (global, tanpa userKey) dianggap
// sebagai data anonim dan TIDAK dihapus; hanya diabaikan saat user login.
// ─────────────────────────────────────────────────────────

export const PROGRESS_KEY_PREFIX = 'atomika-progress-v1:';
export const PROGRESS_EVENT_NAME = 'atomika-progress-updated';

/** Kunci anonymous — hanya digunakan sebelum login atau di mode demo. */
const ANONYMOUS_KEY = `${PROGRESS_KEY_PREFIX}anonymous`;

/** Membangun storage key dari identitas pengguna. */
export function buildProgressKey(userKey: string | null | undefined): string {
  if (!userKey || !userKey.trim()) return ANONYMOUS_KEY;
  return `${PROGRESS_KEY_PREFIX}${userKey.trim()}`;
}

/** Normalkan nama+kelas menjadi userKey yang aman sebagai bagian kunci localStorage. */
export function normalizeUserKey(name: string, className: string): string {
  const n = name.trim().toLocaleLowerCase('id-ID').replace(/\s+/g, '_');
  const c = className.trim().toLocaleLowerCase('id-ID').replace(/\s+/g, '_');
  return `${n}|${c}`;
}

// ─────────────────────────────────────────────────────────
// Tipe & Default
// ─────────────────────────────────────────────────────────

const DEFAULT_PROGRESS: LocalProgress = {
  version: 1,
  visitedSectionIds: [],
  labDone: { t1: false, t2: false, t3: false },
  quizResults: {},
  updatedAt: new Date().toISOString(),
};

export const LAB_MODES = [
  { id: 'partikel', label: 'Lab Partikel', topicId: 't1' },
  { id: 'kalkulator', label: 'Kalkulator Partikel', topicId: 't2' },
  { id: 'ion', label: 'Simulator Ion', topicId: 't3' },
] as const;

export type LabModeId = (typeof LAB_MODES)[number]['id'];

// ─────────────────────────────────────────────────────────
// Baca / Tulis localStorage (per kunci pengguna)
// ─────────────────────────────────────────────────────────

/**
 * Membaca progres dari localStorage untuk kunci pengguna tertentu.
 * Tidak pernah membaca kunci pengguna lain.
 */
export function getProgressForKey(storageKey: string): LocalProgress {
  const { value: parsed } = readJsonStorage<Partial<LocalProgress> | null>(storageKey, null);
  if (parsed && parsed.version === 1 && Array.isArray(parsed.visitedSectionIds)) {
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      visitedSectionIds: parsed.visitedSectionIds,
      labDone: {
        ...DEFAULT_PROGRESS.labDone,
        ...(parsed.labDone && typeof parsed.labDone === 'object' ? parsed.labDone : {}),
      },
      quizResults: parsed.quizResults || DEFAULT_PROGRESS.quizResults,
    };
  }
  return DEFAULT_PROGRESS;
}

/** Shorthand: baca dari kunci anonim (backward compat / demo). */
export function getProgress(): LocalProgress {
  return getProgressForKey(ANONYMOUS_KEY);
}

/**
 * Menyimpan progres ke localStorage pada kunci pengguna tertentu,
 * lalu memancarkan event reaktif.
 */
export function saveProgressForKey(storageKey: string, progress: LocalProgress): void {
  const updated: LocalProgress = { ...progress, updatedAt: new Date().toISOString() };
  writeJsonStorage(storageKey, updated);
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent(PROGRESS_EVENT_NAME, { detail: { storageKey, progress: updated } }),
      );
    } catch (error) {
      console.error(`[progress] Gagal memperbarui tampilan ${storageKey}:`, error);
    }
  }
}

/** Shorthand: simpan ke kunci anonim. */
export function saveProgress(progress: LocalProgress): void {
  saveProgressForKey(ANONYMOUS_KEY, progress);
}

// ─────────────────────────────────────────────────────────
// Operasi Progres (stateless — terima storageKey eksplisit)
// ─────────────────────────────────────────────────────────

export function markSectionReadForKey(storageKey: string, sectionId: string): LocalProgress {
  const current = getProgressForKey(storageKey);
  const alreadyVisited = current.visitedSectionIds.includes(sectionId);
  if (alreadyVisited && current.lastOpenedSectionId === sectionId) return current;
  const updated: LocalProgress = {
    ...current,
    visitedSectionIds: alreadyVisited
      ? current.visitedSectionIds
      : [...current.visitedSectionIds, sectionId],
    lastOpenedSectionId: sectionId,
  };
  saveProgressForKey(storageKey, updated);
  return updated;
}

/** @deprecated Gunakan markSectionReadForKey untuk operasi user-aware. */
export function markSectionRead(sectionId: string): LocalProgress {
  return markSectionReadForKey(ANONYMOUS_KEY, sectionId);
}

export function resetProgressForKey(storageKey: string): void {
  saveProgressForKey(storageKey, { ...DEFAULT_PROGRESS, updatedAt: new Date().toISOString() });
}

/** @deprecated Gunakan resetProgressForKey untuk operasi user-aware. */
export function resetAllProgress(): void {
  resetProgressForKey(ANONYMOUS_KEY);
}

// ─────────────────────────────────────────────────────────
// Fungsi Logika Penguncian (pure — tidak menyentuh storage)
// ─────────────────────────────────────────────────────────

export function isTopicUnlocked(topicId: TopicId, visitedIds: string[]): boolean {
  if (topicId === 't1') return true;
  const t1 = TOPICS.find((t) => t.id === 't1');
  const t1Done = t1 ? t1.sectionIds.every((id) => visitedIds.includes(id)) : false;
  if (topicId === 't2') return t1Done;
  if (topicId === 't3') {
    const t2 = TOPICS.find((t) => t.id === 't2');
    const t2Done = t2 ? t2.sectionIds.every((id) => visitedIds.includes(id)) : false;
    return t1Done && t2Done;
  }
  return false;
}

export function isTopicCompleted(topicId: TopicId, visitedIds: string[]): boolean {
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) return false;
  return topic.sectionIds.every((id) => visitedIds.includes(id));
}

export function areAllTopicsCompleted(visitedIds: string[]): boolean {
  return TOPICS.every((topic) => isTopicCompleted(topic.id, visitedIds));
}

export function isLaboratoryUnlocked(progress: LocalProgress): boolean {
  return areAllTopicsCompleted(progress.visitedSectionIds);
}

export function areAllLabModesCompleted(progress: LocalProgress): boolean {
  return LAB_MODES.every(({ topicId }) => progress.labDone[topicId]);
}

export function areQuizzesUnlocked(progress: LocalProgress): boolean {
  return isLaboratoryUnlocked(progress) && areAllLabModesCompleted(progress);
}

export function isQuizUnlocked(topicId: TopicId, progress: LocalProgress): boolean {
  if (!areQuizzesUnlocked(progress)) return false;
  const topicIndex = TOPICS.findIndex((topic) => topic.id === topicId);
  if (topicIndex === -1) return false;
  return TOPICS.slice(0, topicIndex).every(
    (topic) => (progress.quizResults[topic.id]?.attempts ?? 0) > 0
  );
}

export function markLabModeCompleteForKey(storageKey: string, modeId: LabModeId): LocalProgress {
  const mode = LAB_MODES.find(({ id }) => id === modeId);
  if (!mode) return getProgressForKey(storageKey);
  const current = getProgressForKey(storageKey);
  if (current.labDone[mode.topicId]) return current;
  const updated: LocalProgress = {
    ...current,
    labDone: { ...current.labDone, [mode.topicId]: true },
  };
  saveProgressForKey(storageKey, updated);
  return updated;
}

/** @deprecated Gunakan markLabModeCompleteForKey untuk operasi user-aware. */
export function markLabModeComplete(modeId: LabModeId): LocalProgress {
  return markLabModeCompleteForKey(ANONYMOUS_KEY, modeId);
}

export function isAllTopicsCompleted(visitedIds: string[]): boolean {
  return TOPICS.every((t) => isTopicCompleted(t.id as TopicId, visitedIds));
}

export function isLabModeUnlocked(mode: string, visitedIds: string[]): boolean {
  if (isAllTopicsCompleted(visitedIds)) return true;
  if (mode === 'partikel') return isTopicCompleted('t1', visitedIds);
  if (mode === 'kalkulator') return isTopicCompleted('t2', visitedIds);
  if (mode === 'ion') return isTopicCompleted('t3', visitedIds);
  return isTopicCompleted('t1', visitedIds);
}

export function isQuizTopicUnlocked(topicId: TopicId, visitedIds: string[]): boolean {
  if (isAllTopicsCompleted(visitedIds)) return true;
  return isTopicCompleted(topicId, visitedIds);
}

export function isSectionUnlocked(
  topicId: TopicId,
  sectionId: string,
  visitedIds: string[]
): boolean {
  if (!isTopicUnlocked(topicId, visitedIds)) return false;
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) return false;
  const index = topic.sectionIds.indexOf(sectionId);
  if (index === -1) return false;
  if (index === 0) return true;
  const prevSectionId = topic.sectionIds[index - 1];
  return visitedIds.includes(prevSectionId);
}

export function getTopicCompletion(
  topicId: TopicId,
  visitedIds: string[]
): {
  completedCount: number;
  totalCount: number;
  percent: number;
  isCompleted: boolean;
  unlocked: boolean;
} {
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) return { completedCount: 0, totalCount: 0, percent: 0, isCompleted: false, unlocked: false };
  const totalCount = topic.sectionIds.length;
  const completedCount = topic.sectionIds.filter((id) => visitedIds.includes(id)).length;
  const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const isCompleted = completedCount === totalCount;
  const unlocked = isTopicUnlocked(topicId, visitedIds);
  return { completedCount, totalCount, percent, isCompleted, unlocked };
}

// ─────────────────────────────────────────────────────────
// Hook useProgress — sadar identitas pengguna (AD17-05)
// ─────────────────────────────────────────────────────────

export interface ProgressUserIdentity {
  /** UID Firebase (utama) atau null jika tidak ada. */
  uid: string | null;
  /** Nama siswa dari profil. Digunakan sebagai fallback jika uid null. */
  name?: string;
  /** Nama kelas siswa. Digunakan sebagai fallback jika uid null. */
  className?: string;
}

/**
 * Derivasi storage key dari identitas pengguna.
 * Prioritas: uid Firebase > nama|kelas > anonymous
 */
export function deriveStorageKey(identity: ProgressUserIdentity | null | undefined): string {
  if (!identity) return ANONYMOUS_KEY;
  if (identity.uid) return buildProgressKey(identity.uid);
  if (identity.name) return buildProgressKey(normalizeUserKey(identity.name, identity.className ?? ''));
  return ANONYMOUS_KEY;
}

/**
 * Hook utama untuk mengakses dan memodifikasi progres belajar.
 *
 * @param identity  Identitas pengguna yang sedang aktif.
 *   - Harus dioper dari AccessProvider/useAccess agar key-nya benar.
 *   - Jika null/undefined, hook beroperasi dalam mode anonim.
 *
 * Hook ini REAKTIF terhadap perubahan `identity`:
 * ketika pengguna logout lalu pengguna lain login,
 * hook otomatis memuat ulang progres dari kunci yang berbeda
 * tanpa mencampur data kedua pengguna.
 */
export function useProgress(identity?: ProgressUserIdentity | null) {
  const storageKey = deriveStorageKey(identity);

  const [progress, setProgress] = useState<LocalProgress>(() =>
    getProgressForKey(storageKey)
  );

  // Muat ulang progres setiap kali identitas (dan kunci storage) berubah
  useEffect(() => {
    setProgress(getProgressForKey(storageKey));
  }, [storageKey]);

  // Dengarkan event update dari tab/jendela yang sama
  const handleUpdate = useCallback(
    (event: Event) => {
      const detail = (event as CustomEvent<{ storageKey: string }>).detail;
      // Hanya respond jika event berasal dari kunci yang sama
      if (!detail?.storageKey || detail.storageKey === storageKey) {
        setProgress(getProgressForKey(storageKey));
      }
    },
    [storageKey]
  );

  // Dengarkan event update dari tab lain (storage event)
  const handleStorageEvent = useCallback(
    (event: StorageEvent) => {
      if (event.key === storageKey) {
        setProgress(getProgressForKey(storageKey));
      }
    },
    [storageKey]
  );

  useEffect(() => {
    window.addEventListener(PROGRESS_EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener(PROGRESS_EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [handleUpdate, handleStorageEvent]);

  // ── Operasi yang terikat ke storageKey aktif ──

  const markAsRead = useCallback(
    (sectionId: string) => markSectionReadForKey(storageKey, sectionId),
    [storageKey]
  );

  const markLabModeCompleteForUser = useCallback(
    (modeId: LabModeId) => markLabModeCompleteForKey(storageKey, modeId),
    [storageKey]
  );

  const resetProgress = useCallback(
    () => resetProgressForKey(storageKey),
    [storageKey]
  );

  const visited = progress.visitedSectionIds;

  return {
    progress,
    storageKey,
    markAsRead,
    resetProgress,
    isTopicUnlocked: (topicId: TopicId) => isTopicUnlocked(topicId, visited),
    isTopicCompleted: (topicId: TopicId) => isTopicCompleted(topicId, visited),
    isLaboratoryUnlocked: () => isLaboratoryUnlocked(progress),
    areAllLabModesCompleted: () => areAllLabModesCompleted(progress),
    areQuizzesUnlocked: () => areQuizzesUnlocked(progress),
    isQuizUnlocked: (topicId: TopicId) => isQuizUnlocked(topicId, progress),
    markLabModeComplete: markLabModeCompleteForUser,
    isSectionUnlocked: (topicId: TopicId, sectionId: string) =>
      isSectionUnlocked(topicId, sectionId, visited),
    getTopicCompletion: (topicId: TopicId) => getTopicCompletion(topicId, visited),
    isAllTopicsCompleted: () => isAllTopicsCompleted(visited),
    isLabModeUnlocked: (mode: string) => isLabModeUnlocked(mode, visited),
    isQuizTopicUnlocked: (topicId: TopicId) => isQuizTopicUnlocked(topicId, visited),
  };
}
