import { useState, useEffect } from 'react';
import type { LocalProgress, TopicId } from '../types';
import { TOPICS } from '../data/topics';

export const PROGRESS_STORAGE_KEY = 'atomika-progress-v1';
export const PROGRESS_EVENT_NAME = 'atomika-progress-updated';

const DEFAULT_PROGRESS: LocalProgress = {
  version: 1,
  visitedSectionIds: [],
  labDone: {
    t1: false,
    t2: false,
    t3: false,
  },
  quizResults: {},
  updatedAt: new Date().toISOString(),
};

/**
 * Membaca data progres dari localStorage secara aman dengan fallback.
 */
export function getProgress(): LocalProgress {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_PROGRESS;
  }

  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;

    const parsed = JSON.parse(raw) as Partial<LocalProgress>;
    if (parsed && parsed.version === 1 && Array.isArray(parsed.visitedSectionIds)) {
      return {
        ...DEFAULT_PROGRESS,
        ...parsed,
        visitedSectionIds: parsed.visitedSectionIds,
        labDone: parsed.labDone || DEFAULT_PROGRESS.labDone,
        quizResults: parsed.quizResults || DEFAULT_PROGRESS.quizResults,
      };
    }
    return DEFAULT_PROGRESS;
  } catch (err) {
    console.warn('Gagal membaca atomika-progress-v1 dari localStorage:', err);
    return DEFAULT_PROGRESS;
  }
}

/**
 * Menyimpan progres ke localStorage dan memancarkan event pembaruan reaktif.
 */
export function saveProgress(progress: LocalProgress): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const updated = {
      ...progress,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT_NAME, { detail: updated }));
  } catch (err) {
    console.error('Gagal menyimpan ke atomika-progress-v1:', err);
  }
}

/**
 * Menandai sebuah bagian materi sebagai telah dibaca / selesai.
 */
export function markSectionRead(sectionId: string): LocalProgress {
  const current = getProgress();
  if (current.visitedSectionIds.includes(sectionId)) {
    // Tetap update lastOpenedSectionId jika berubah
    if (current.lastOpenedSectionId !== sectionId) {
      const updated: LocalProgress = {
        ...current,
        lastOpenedSectionId: sectionId,
      };
      saveProgress(updated);
      return updated;
    }
    return current;
  }

  const updated: LocalProgress = {
    ...current,
    visitedSectionIds: [...current.visitedSectionIds, sectionId],
    lastOpenedSectionId: sectionId,
  };
  saveProgress(updated);
  return updated;
}

/**
 * Memeriksa apakah suatu Topik berstatus terbuka (unlocked).
 * Aturan kurikulum berurutan:
 * - Topik 1 (t1): Selalu terbuka.
 * - Topik 2 (t2): Terbuka HANYA JIKA semua bagian di Topik 1 sudah selesai dibaca.
 * - Topik 3 (t3): Terbuka HANYA JIKA semua bagian di Topik 1 DAN Topik 2 sudah selesai dibaca.
 */
export function isTopicUnlocked(topicId: TopicId, visitedIds: string[]): boolean {
  if (topicId === 't1') return true;

  const t1 = TOPICS.find((t) => t.id === 't1');
  const t1Completed = t1 ? t1.sectionIds.every((id) => visitedIds.includes(id)) : false;

  if (topicId === 't2') {
    return t1Completed;
  }

  if (topicId === 't3') {
    const t2 = TOPICS.find((t) => t.id === 't2');
    const t2Completed = t2 ? t2.sectionIds.every((id) => visitedIds.includes(id)) : false;
    return t1Completed && t2Completed;
  }

  return false;
}

/**
 * Memeriksa apakah seluruh bagian dalam sebuah topik telah selesai dibaca.
 */
export function isTopicCompleted(topicId: TopicId, visitedIds: string[]): boolean {
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) return false;
  return topic.sectionIds.every((id) => visitedIds.includes(id));
}

/**
 * Memeriksa apakah suatu bagian (section) berstatus terbuka (unlocked).
 * Aturan urutan materi dalam topik:
 * - Topik harus terbuka terlebih dahulu.
 * - Bagian pertama (index 0) terbuka otomatis begitu topiknya terbuka.
 * - Bagian ke-N (index > 0) terbuka HANYA JIKA bagian sebelumnya (index - 1) sudah selesai dibaca.
 */
export function isSectionUnlocked(
  topicId: TopicId,
  sectionId: string,
  visitedIds: string[]
): boolean {
  if (!isTopicUnlocked(topicId, visitedIds)) {
    return false;
  }

  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) return false;

  const index = topic.sectionIds.indexOf(sectionId);
  if (index === -1) return false;

  // Bagian nomor 1 selalu terbuka
  if (index === 0) return true;

  // Bagian nomor N terbuka jika bagian nomor N-1 sudah dibaca
  const prevSectionId = topic.sectionIds[index - 1];
  return visitedIds.includes(prevSectionId);
}

/**
 * Mengambil ringkasan persentase dan jumlah bagian yang selesai dibaca per topik.
 */
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
  if (!topic) {
    return { completedCount: 0, totalCount: 0, percent: 0, isCompleted: false, unlocked: false };
  }

  const totalCount = topic.sectionIds.length;
  const completedCount = topic.sectionIds.filter((id) => visitedIds.includes(id)).length;
  const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const isCompleted = completedCount === totalCount;
  const unlocked = isTopicUnlocked(topicId, visitedIds);

  return {
    completedCount,
    totalCount,
    percent,
    isCompleted,
    unlocked,
  };
}

/**
 * Mengosongkan data progres kembali ke kondisi awal (awal belajar).
 */
export function resetAllProgress(): void {
  saveProgress({
    ...DEFAULT_PROGRESS,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Hook React untuk memantau data progres secara reaktif di komponen mana pun.
 */
export function useProgress() {
  const [progress, setProgress] = useState<LocalProgress>(getProgress);

  useEffect(() => {
    const handleUpdate = () => {
      setProgress(getProgress());
    };

    window.addEventListener(PROGRESS_EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(PROGRESS_EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    progress,
    markAsRead: markSectionRead,
    isTopicUnlocked: (topicId: TopicId) => isTopicUnlocked(topicId, progress.visitedSectionIds),
    isTopicCompleted: (topicId: TopicId) => isTopicCompleted(topicId, progress.visitedSectionIds),
    isSectionUnlocked: (topicId: TopicId, sectionId: string) =>
      isSectionUnlocked(topicId, sectionId, progress.visitedSectionIds),
    getTopicCompletion: (topicId: TopicId) =>
      getTopicCompletion(topicId, progress.visitedSectionIds),
    resetProgress: resetAllProgress,
  };
}

