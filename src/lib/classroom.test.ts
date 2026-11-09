import { describe, expect, it } from 'vitest';
import {
  getLocalDateKey,
  normalizeStudentName,
  POLL_OPTIONS,
  PROGRESS_STAGES,
  REACTION_QUESTIONS,
} from './classroom';

describe('classroom activity defaults', () => {
  it('provides ten reaction classification questions and four poll choices', () => {
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
