import type { TopicId } from '../types';

export interface QuizAttemptRecord {
  id: string;
  topicId: TopicId;
  studentIdentity: {
    uid: string | null;
    name: string;
    className: string;
    institutionId?: string;
  };
  answers: Record<string, string>;
  questionVersion: string;
  score: number;
  maxScore: number;
  percent: number;
  startedAt: string;
  submittedAt: string | null;
  elapsedSeconds: number;
  status: 'in_progress' | 'submitted';
}

export function createAttemptId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function calculateQuizScore(
  questions: { id: string; correct: string }[],
  answers: Record<string, string>
) {
  const score = questions.reduce(
    (total, question) => total + (answers[question.id] === question.correct ? 1 : 0),
    0
  );
  return {
    score,
    maxScore: questions.length,
    percent: questions.length === 0 ? 0 : Math.round((score / questions.length) * 100),
  };
}
