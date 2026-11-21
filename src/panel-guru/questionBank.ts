import type { TopicId } from '../types';
import { QUIZ_QUESTIONS as V1_QUESTIONS } from './question-banks/v1';

export type VersionedQuestionBank = Partial<Record<TopicId, typeof V1_QUESTIONS[TopicId]>>;

export const QUESTION_BANKS: Record<string, VersionedQuestionBank> = {
  v1: V1_QUESTIONS,
};

export function getQuestionsForAttempt(version: string | null, moduleId: string | null) {
  const topicId: TopicId | null = moduleId === 't1' || moduleId === 't2' || moduleId === 't3'
    ? moduleId
    : null;
  if (!version || !topicId) return null;
  return QUESTION_BANKS[version]?.[topicId] ?? null;
}
