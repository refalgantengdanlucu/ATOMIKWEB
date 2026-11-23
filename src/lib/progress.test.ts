import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deriveStorageKey,
  getProgressForKey,
  markSectionReadForKey,
  recordActivityForKey,
} from './progress';
import { TOPICS } from '../data/topics';

const storageValues = new Map<string, string>();
const storage = {
  getItem: (key: string) => storageValues.get(key) ?? null,
  setItem: (key: string, value: string) => storageValues.set(key, value),
  removeItem: (key: string) => storageValues.delete(key),
};

describe('isolasi progres per siswa', () => {
  beforeEach(() => {
    storageValues.clear();
    const fakeWindow = new EventTarget();
    Object.defineProperty(fakeWindow, 'localStorage', { value: storage });
    vi.stubGlobal('window', fakeWindow);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('menyimpan dua bagian siswa A saat B login dan memulihkannya setelah A login kembali', () => {
    const studentA = deriveStorageKey({ uid: 'student-a' });
    const studentB = deriveStorageKey({ uid: 'student-b' });
    const [firstSection, secondSection] = TOPICS[0].sectionIds;

    markSectionReadForKey(studentA, firstSection);
    markSectionReadForKey(studentA, secondSection);

    expect(getProgressForKey(studentA).visitedSectionIds).toEqual([
      firstSection,
      secondSection,
    ]);

    expect(getProgressForKey(studentB).visitedSectionIds).toEqual([]);
    markSectionReadForKey(studentB, firstSection);
    expect(getProgressForKey(studentB).visitedSectionIds).toEqual([firstSection]);

    expect(getProgressForKey(studentA).visitedSectionIds).toEqual([
      firstSection,
      secondSection,
    ]);
  });

  it('menyimpan aktivitas pada namespace akun masing-masing', () => {
    const studentA = deriveStorageKey({ uid: 'student-a' });
    const studentB = deriveStorageKey({ uid: 'student-b' });

    recordActivityForKey(studentA, { activity: 'Materi', path: '/materi/t1' });

    expect(getProgressForKey(studentA).activityLog).toHaveLength(1);
    expect(getProgressForKey(studentB).activityLog).toEqual([]);
  });

  it('mengarantina progres global lama di namespace anonymous, bukan akun siswa', () => {
    const legacySection = TOPICS[0].sectionIds[0];
    storage.setItem('atomika-progress-v1', JSON.stringify({
      version: 1,
      visitedSectionIds: [legacySection],
    }));

    const anonymousKey = deriveStorageKey(null);
    expect(getProgressForKey(anonymousKey).visitedSectionIds).toEqual([legacySection]);
    expect(getProgressForKey(deriveStorageKey({ uid: 'student-a' })).visitedSectionIds).toEqual([]);
    expect(storage.getItem('atomika-progress-v1')).not.toBeNull();
  });
});
