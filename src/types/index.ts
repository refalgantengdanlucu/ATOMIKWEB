export type TopicId = 't1' | 't2' | 't3';

export type LessonSection = {
  id: string;
  topicId: TopicId;
  order: number;
  title: string;
  body: string;
  keywords: string[]; // termasuk sinonim
};

export type Topic = {
  id: TopicId;
  title: string;
  description: string;
  learningObjectives: string[]; // kode TP dari Bagian 6
  sectionIds: string[];
};

export type Question = {
  id: string;
  topicId: TopicId;
  type: 'multiple-choice' | 'true-false' | 'numeric' | 'classification';
  prompt: string;
  options?: { id: string; label: string }[];
  correct: string | number | boolean; // id opsi, angka, atau boolean
  explanation: string;
  wrongHints?: Record<string, string>; // kunci: id opsi atau angka salah yang umum
  relatedSectionId: string;
  objectiveCode: string; // contoh 'TP 2.2'
};

export type Element = {
  z: number;
  symbol: string;
  name: string;
  defaultA: number;
};

export type Nuclide = {
  z: number;
  a: number;
};

export type LocalProgress = {
  version: 1;
  visitedSectionIds: string[];
  labDone: Record<TopicId, boolean>;
  quizResults: Partial<
    Record<
      TopicId,
      {
        attempts: number;
        lastScore: number;
        bestScore: number;
        lastCompletedAt: string;
      }
    >
  >;
  lastOpenedSectionId?: string;
  updatedAt: string; // ISO 8601
};

export type TopicStatus = 'not_started' | 'in_progress' | 'completed';

