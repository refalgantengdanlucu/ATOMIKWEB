import { describe, expect, it } from 'vitest';
import { QUIZ_QUESTIONS } from './question-banks/v1';
import {
  calculateVerifiedScore,
  groupAcceptedAttempts,
  selectAttemptsForRecap,
  summarizeQuestion,
} from './analytics';
import type { TeacherQuizAttempt } from './quizAttempts';

function makeAttempt(
  id: string,
  uid: string,
  attemptType: TeacherQuizAttempt['attemptType'],
  receivedAt: string,
  answer: string
): TeacherQuizAttempt {
  return {
    id,
    uid,
    alias: `Siswa-${uid}`,
    moduleId: 't1',
    activityName: 'Kuis T1',
    attemptType,
    questionVersion: 'v1',
    score: 1,
    maxScore: 5,
    percent: 20,
    answers: { 't1-q1': answer },
    serverReceivedAt: new Date(receivedAt),
  };
}

describe('teacher panel attempt recap', () => {
  it('selects one diagnostic first try and one practice last try per student', () => {
    const attempts = [
      makeAttempt('diagnostic-first', 'student-a', 'diagnostic', '2025-01-01T10:00:00Z', 'a'),
      makeAttempt('diagnostic-retry', 'student-a', 'diagnostic', '2025-01-02T10:00:00Z', 'b'),
      makeAttempt('practice-first', 'student-a', 'practice', '2025-01-01T10:00:00Z', 'a'),
      makeAttempt('practice-last', 'student-a', 'practice', '2025-01-02T10:00:00Z', 'b'),
      makeAttempt('practice-other-student', 'student-b', 'practice', '2025-01-02T09:00:00Z', 'a'),
    ];

    const groups = groupAcceptedAttempts(attempts);
    const diagnostic = groups.find((group) => group.attemptType === 'diagnostic');
    const practice = groups.find((group) => group.attemptType === 'practice');

    expect(diagnostic && selectAttemptsForRecap(diagnostic).attempts.map((attempt) => attempt.id))
      .toEqual(['diagnostic-first']);
    expect(practice && selectAttemptsForRecap(practice).attempts.map((attempt) => attempt.id).sort())
      .toEqual(['practice-last', 'practice-other-student']);
  });

  it('uses only recorded valid answers as item frequencies, without treating missing answers as wrong', () => {
    const question = QUIZ_QUESTIONS.t1[0];
    const attempts = [
      makeAttempt('correct', 'student-a', 'practice', '2025-01-01T10:00:00Z', question.correct),
      makeAttempt('incorrect', 'student-b', 'practice', '2025-01-01T10:00:00Z', 'b'),
      {
        ...makeAttempt('missing', 'student-c', 'practice', '2025-01-01T10:00:00Z', 'b'),
        answers: {},
      },
    ];
    const summary = summarizeQuestion(question, attempts);

    expect(summary.studentCount).toBe(3);
    expect(summary.responseCount).toBe(2);
    expect(summary.correctCount).toBe(1);
    expect(summary.incorrectCount).toBe(1);
    expect(summary.counts.b).toBe(1);
  });

  it('does not count attempts without a student UID', () => {
    const group = groupAcceptedAttempts([
      makeAttempt('identified', 'student-a', 'practice', '2025-01-01T10:00:00Z', 'a'),
      { ...makeAttempt('unidentified', 'student-b', 'practice', '2025-01-02T10:00:00Z', 'b'), uid: null },
    ])[0];

    const selection = selectAttemptsForRecap(group);
    expect(selection.attempts.map((attempt) => attempt.id)).toEqual(['identified']);
    expect(selection.ignoredWithoutUid).toBe(1);
  });

  it('does not guess retry order when a server timestamp is missing', () => {
    const group = groupAcceptedAttempts([
      makeAttempt('dated', 'student-a', 'practice', '2025-01-01T10:00:00Z', 'a'),
      { ...makeAttempt('undated', 'student-b', 'practice', '2025-01-02T10:00:00Z', 'b'), serverReceivedAt: null },
    ])[0];

    const selection = selectAttemptsForRecap(group);
    expect(selection.attempts.map((attempt) => attempt.id)).toEqual(['dated']);
    expect(selection.ignoredWithoutServerTime).toBe(1);
  });

  it('verifies complete quiz scores from the matching question bank instead of trusting the submitted score', () => {
    const questions = QUIZ_QUESTIONS.t1;
    const attempt = {
      ...makeAttempt('complete', 'student-a', 'practice', '2025-01-01T10:00:00Z', 'a'),
      answers: Object.fromEntries(questions.map((question) => [question.id, question.correct])),
      score: 0,
    };

    expect(calculateVerifiedScore(attempt)).toEqual({ score: 5, maxScore: 5, percent: 100 });
    expect(calculateVerifiedScore({ ...attempt, answers: {} })).toBeNull();
  });
});
