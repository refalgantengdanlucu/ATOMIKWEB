import { describe, expect, it } from 'vitest';
import {
  ATOM_QUESTIONS,
  getLocalDateKey,
  normalizeStudentName,
  POLL_OPTIONS,
  PROGRESS_STAGES,
  REACTION_QUESTIONS,
} from './classroom';

describe('classroom activity defaults', () => {
  it('menyediakan 10 soal kuis Struktur Atom dengan tingkat Mudah, Sedang, dan Sukar', () => {
    expect(ATOM_QUESTIONS).toHaveLength(10);
    const mudah = ATOM_QUESTIONS.filter((q) => q.difficulty === 'Mudah');
    const sedang = ATOM_QUESTIONS.filter((q) => q.difficulty === 'Sedang');
    const sukar = ATOM_QUESTIONS.filter((q) => q.difficulty === 'Sukar');

    expect(mudah.length).toBeGreaterThan(0);
    expect(sedang.length).toBeGreaterThan(0);
    expect(sukar.length).toBeGreaterThan(0);

    ATOM_QUESTIONS.forEach((q) => {
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(q.correct);
      expect(q.explanation.length).toBeGreaterThan(15);
    });
  });

  it('provides reaction classification questions compatibility alias and four poll choices', () => {
    expect(REACTION_QUESTIONS).toHaveLength(10);
    expect(POLL_OPTIONS).toHaveLength(4);
    expect(PROGRESS_STAGES).toHaveLength(4);
  });

  it('normalizes names to prevent duplicate attendance with case or spacing differences', () => {
    expect(normalizeStudentName('  Siti   Aminah ')).toBe('siti aminah');
    expect(normalizeStudentName('SITI AMINAH')).toBe('siti aminah');
  });

  it('formats the local date without converting it to UTC', () => {
    expect(getLocalDateKey(new Date(2026, 0, 3, 23, 30))).toBe('2026-01-03');
  });
});
