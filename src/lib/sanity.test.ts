import { describe, it, expect } from 'vitest';
import { TOPICS } from '../data/topics';

describe('ATOMIKA Initial Setup (Milestone M1)', () => {
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
});

