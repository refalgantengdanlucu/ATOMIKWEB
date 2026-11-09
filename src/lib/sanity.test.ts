import { describe, it, expect } from 'vitest';
import { TOPICS } from '../data/topics';
import { SECTIONS } from '../data/sections';
import { isTopicUnlocked, isSectionUnlocked, isTopicCompleted } from '../lib/progress';

describe('ATOMIKA Initial Setup & Modul Kemendikbud KD 3.2', () => {
  it('harus memuat 3 topik pembelajaran', () => {
    expect(TOPICS).toHaveLength(3);
    expect(TOPICS.map((t) => t.id)).toEqual(['t1', 't2', 't3']);
  });

  it('setiap topik memiliki tujuan pembelajaran dan daftar section', () => {
    TOPICS.forEach((topic) => {
      expect(topic.title).toBeTruthy();
      expect(topic.description).toBeTruthy();
      expect(topic.learningObjectives.length).toBeGreaterThan(0);
      expect(topic.sectionIds.length).toBeGreaterThan(0);
    });
  });

  it('memuat 17 bagian materi lengkap dari modul KD 3.2', () => {
    expect(SECTIONS).toHaveLength(17);
    TOPICS.forEach((topic) => {
      topic.sectionIds.forEach((sId) => {
        const found = SECTIONS.find((sec) => sec.id === sId);
        expect(found).toBeDefined();
        expect(found?.topicId).toBe(topic.id);
        expect(found?.title.length).toBeGreaterThan(0);
        expect(found?.body.length).toBeGreaterThan(100);
      });
    });
  });

  it('materi mencakup model atom Dalton, Thomson, Rutherford, Bohr, dan Mekanika Kuantum', () => {
    const titles = SECTIONS.map((s) => s.title.toLowerCase());
    expect(titles.some((t) => t.includes('dalton'))).toBe(true);
    expect(titles.some((t) => t.includes('thomson'))).toBe(true);
    expect(titles.some((t) => t.includes('rutherford'))).toBe(true);
    expect(titles.some((t) => t.includes('bohr'))).toBe(true);
    expect(titles.some((t) => t.includes('kuantum'))).toBe(true);
  });
});

describe('Sistem Penguncian Berurutan (Sequential Locking)', () => {
  const t1Ids = TOPICS.find((t) => t.id === 't1')!.sectionIds;
  const t2Ids = TOPICS.find((t) => t.id === 't2')!.sectionIds;

  // --- isTopicUnlocked ---
  it('Topik 1 selalu terbuka', () => {
    expect(isTopicUnlocked('t1', [])).toBe(true);
    expect(isTopicUnlocked('t1', t1Ids)).toBe(true);
  });

  it('Topik 2 terkunci jika Topik 1 belum selesai', () => {
    expect(isTopicUnlocked('t2', [])).toBe(false);
    expect(isTopicUnlocked('t2', [t1Ids[0]])).toBe(false); // baru 1 bagian
  });

  it('Topik 2 terbuka jika seluruh bagian Topik 1 selesai', () => {
    expect(isTopicUnlocked('t2', [...t1Ids])).toBe(true);
  });

  it('Topik 3 terkunci jika Topik 1 & 2 belum selesai', () => {
    expect(isTopicUnlocked('t3', [])).toBe(false);
    expect(isTopicUnlocked('t3', [...t1Ids])).toBe(false); // hanya T1 selesai
    expect(isTopicUnlocked('t3', [...t2Ids])).toBe(false); // hanya T2 (tidak valid tanpa T1)
  });

  it('Topik 3 terbuka jika Topik 1 DAN Topik 2 selesai semua', () => {
    expect(isTopicUnlocked('t3', [...t1Ids, ...t2Ids])).toBe(true);
  });

  // --- isSectionUnlocked ---
  it('Bagian pertama Topik 1 selalu terbuka', () => {
    expect(isSectionUnlocked('t1', t1Ids[0], [])).toBe(true);
  });

  it('Bagian kedua Topik 1 hanya terbuka jika bagian pertama sudah dibaca', () => {
    expect(isSectionUnlocked('t1', t1Ids[1], [])).toBe(false);
    expect(isSectionUnlocked('t1', t1Ids[1], [t1Ids[0]])).toBe(true);
  });

  it('Bagian pertama Topik 2 terkunci jika Topik 1 belum selesai', () => {
    expect(isSectionUnlocked('t2', t2Ids[0], [])).toBe(false);
    expect(isSectionUnlocked('t2', t2Ids[0], [t1Ids[0]])).toBe(false);
  });

  it('Bagian pertama Topik 2 terbuka jika Topik 1 selesai semua', () => {
    expect(isSectionUnlocked('t2', t2Ids[0], [...t1Ids])).toBe(true);
  });

  // --- isTopicCompleted ---
  it('isTopicCompleted: false jika belum ada bagian yang dibaca', () => {
    expect(isTopicCompleted('t1', [])).toBe(false);
  });

  it('isTopicCompleted: true jika semua bagian sudah dibaca', () => {
    expect(isTopicCompleted('t1', [...t1Ids])).toBe(true);
    expect(isTopicCompleted('t2', [...t1Ids, ...t2Ids])).toBe(true);
  });
});
