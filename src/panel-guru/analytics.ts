import type { QuizQuestion } from './question-banks/v1';
import { getQuestionsForAttempt } from './questionBank';
import type { AttemptType, TeacherQuizAttempt } from './quizAttempts';

export interface AttemptGroup {
  moduleId: string;
  activityName: string;
  attemptType: AttemptType;
  questionVersion: string | null;
  attempts: TeacherQuizAttempt[];
}

export interface ItemSummary {
  question: QuizQuestion;
  counts: Record<string, number>;
  correctCount: number;
  incorrectCount: number;
  responseCount: number;
  studentCount: number;
}

export interface VerifiedScore {
  score: number;
  maxScore: number;
  percent: number;
}

function compareAttemptTime(left: TeacherQuizAttempt, right: TeacherQuizAttempt) {
  const leftTime = left.serverReceivedAt?.getTime() ?? Number.NaN;
  const rightTime = right.serverReceivedAt?.getTime() ?? Number.NaN;
  if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) return left.id.localeCompare(right.id);
  if (Number.isNaN(leftTime)) return 1;
  if (Number.isNaN(rightTime)) return -1;
  return leftTime - rightTime || left.id.localeCompare(right.id);
}

export function groupAcceptedAttempts(attempts: TeacherQuizAttempt[]): AttemptGroup[] {
  const groups = new Map<string, AttemptGroup>();

  for (const attempt of attempts) {
    if (!attempt.moduleId) continue;
    const key = JSON.stringify([
      attempt.moduleId,
      attempt.activityName,
      attempt.attemptType,
      attempt.questionVersion,
    ]);
    const group = groups.get(key) ?? {
      moduleId: attempt.moduleId,
      activityName: attempt.activityName,
      attemptType: attempt.attemptType,
      questionVersion: attempt.questionVersion,
      attempts: [],
    };
    group.attempts.push(attempt);
    groups.set(key, group);
  }

  return [...groups.values()].sort((left, right) =>
    left.moduleId.localeCompare(right.moduleId) ||
    left.activityName.localeCompare(right.activityName) ||
    left.attemptType.localeCompare(right.attemptType) ||
    (left.questionVersion ?? '').localeCompare(right.questionVersion ?? '')
  );
}

export function selectAttemptsForRecap(group: AttemptGroup): {
  attempts: TeacherQuizAttempt[];
  ignoredWithoutUid: number;
  ignoredWithoutServerTime: number;
} {
  if (group.attemptType === 'unknown') {
    return { attempts: [], ignoredWithoutUid: 0, ignoredWithoutServerTime: 0 };
  }

  const byStudent = new Map<string, TeacherQuizAttempt[]>();
  let ignoredWithoutUid = 0;
  let ignoredWithoutServerTime = 0;
  for (const attempt of group.attempts) {
    if (!attempt.uid) {
      ignoredWithoutUid += 1;
      continue;
    }
    if (!attempt.serverReceivedAt) {
      ignoredWithoutServerTime += 1;
      continue;
    }
    const history = byStudent.get(attempt.uid) ?? [];
    history.push(attempt);
    byStudent.set(attempt.uid, history);
  }

  const selected = [...byStudent.values()].map((history) => {
    const chronological = [...history].sort(compareAttemptTime);
    return group.attemptType === 'diagnostic'
      ? chronological[0]
      : chronological[chronological.length - 1];
  });

  return {
    attempts: selected.sort(compareAttemptTime),
    ignoredWithoutUid,
    ignoredWithoutServerTime,
  };
}

export function summarizeQuestion(
  question: QuizQuestion,
  attempts: TeacherQuizAttempt[]
): ItemSummary {
  const counts = Object.fromEntries(question.options.map((option) => [option.id, 0]));
  const answered = attempts.filter((attempt) => {
    const selected = attempt.answers?.[question.id];
    return typeof selected === 'string' && Object.prototype.hasOwnProperty.call(counts, selected);
  });
  for (const attempt of answered) {
    const selected = attempt.answers![question.id];
    counts[selected] += 1;
  }

  const correctCount = counts[question.correct] ?? 0;
  return {
    question,
    counts,
    correctCount,
    incorrectCount: answered.length - correctCount,
    responseCount: answered.length,
    studentCount: attempts.length,
  };
}

export function calculateVerifiedScore(attempt: TeacherQuizAttempt): VerifiedScore | null {
  const questions = getQuestionsForAttempt(attempt.questionVersion, attempt.moduleId);
  if (!questions || !attempt.answers) return null;

  const selections = questions.map((question) => {
    const selected = attempt.answers?.[question.id];
    return question.options.some((option) => option.id === selected) ? selected : null;
  });
  if (selections.some((selected) => selected === null)) return null;

  const score = questions.reduce(
    (total, question, index) => total + Number(selections[index] === question.correct),
    0
  );
  return {
    score,
    maxScore: questions.length,
    percent: Math.round((score / questions.length) * 100),
  };
}

export function recommendNextActivity(summaries: ItemSummary[]): string {
  const summariesWithResponses = summaries.filter((summary) => summary.responseCount > 0);
  if (summariesWithResponses.length === 0) {
    return 'Belum ada jawaban per butir yang dapat dianalisis. Kumpulkan hasil kuis berversi yang menyimpan pilihan siswa sebelum menentukan tindak lanjut.';
  }

  const distractors = summariesWithResponses.flatMap((summary) =>
    summary.question.options
      .filter((option) => option.id !== summary.question.correct && summary.counts[option.id] > 0)
      .map((option) => ({
        option,
        question: summary.question,
        count: summary.counts[option.id],
        responseCount: summary.responseCount,
      }))
  );
  distractors.sort((left, right) =>
    right.count / right.responseCount - left.count / left.responseCount ||
    right.count - left.count
  );
  const mostChosenDistractor = distractors[0];

  if (!mostChosenDistractor) {
    return 'Berikan satu soal transfer kontekstual secara berpasangan agar siswa menerapkan konsep pada situasi baru.';
  }

  return `Lakukan diskusi berpasangan pada butir “${mostChosenDistractor.question.prompt}”, khususnya pilihan “${mostChosenDistractor.option.label}”, lalu minta tiap pasangan menjelaskan alasan memilih jawaban yang benar.`;
}
