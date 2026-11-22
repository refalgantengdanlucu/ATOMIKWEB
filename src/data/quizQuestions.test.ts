import { describe, expect, it } from 'vitest';
import { ESSAY_QUESTIONS, QUIZ_QUESTIONS } from './quizQuestions';

describe('topic quiz question banks', () => {
  it('provides five five-option multiple-choice questions for each topic', () => {
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

  it('provides two numbered essay questions for each topic', () => {
    expect(ESSAY_QUESTIONS.t1.map((question) => question.number)).toEqual([1, 2]);
    expect(ESSAY_QUESTIONS.t2.map((question) => question.number)).toEqual([3, 4]);
    expect(ESSAY_QUESTIONS.t3.map((question) => question.number)).toEqual([5, 6]);

    for (const questions of Object.values(ESSAY_QUESTIONS)) {
      expect(questions).toHaveLength(2);
      for (const question of questions) {
        expect(question.id).toBeTruthy();
        expect(question.prompt.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('balances correct answers across A to E in every topic', () => {
    for (const questions of Object.values(QUIZ_QUESTIONS)) {
      expect(questions.map((question) => question.correct)).toEqual(['a', 'b', 'c', 'd', 'e']);
    }
  });
});