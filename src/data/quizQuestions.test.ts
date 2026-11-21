import { describe, expect, it } from 'vitest';
import { QUIZ_QUESTIONS } from './quizQuestions';

describe('topic quiz question banks', () => {
  it('provides five five-option questions for each topic', () => {
    for (const questions of Object.values(QUIZ_QUESTIONS)) {
      expect(questions).toHaveLength(5);
      for (const question of questions) {
        expect(question.options.map((option) => option.id)).toEqual(['a', 'b', 'c', 'd', 'e']);
        expect(question.options.some((option) => option.id === question.correct)).toBe(true);
        expect(question.explanation.length).toBeGreaterThan(0);
        expect(Object.keys(question.wrongFeedback).sort()).toEqual(
          question.options.map((option) => option.id).filter((id) => id !== question.correct).sort()
        );
      }
    }
  });

  it('balances correct answers across A to E in every topic', () => {
    for (const questions of Object.values(QUIZ_QUESTIONS)) {
      expect(questions.map((question) => question.correct)).toEqual(['a', 'b', 'c', 'd', 'e']);
    }
  });
});