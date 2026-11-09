export const TEACHER_NAMES = ['Refaldi', 'Khilda', 'Wilda'] as const;
export const TEACHER_PIN = '122333';
export const CLASSROOM_STORAGE_KEYS = {
  quiz: 'atomika-classroom-quiz-v1',
  poll: 'atomika-classroom-poll-v1',
  attendance: 'atomika-classroom-attendance-v1',
  progress: 'atomika-classroom-progress-v1',
} as const;

export const REACTION_TYPES = [
  'Sintesis',
  'Dekomposisi',
  'Pertukaran tunggal',
  'Pertukaran ganda',
  'Pembakaran',
] as const;

export interface ReactionQuestion {
  equation: string;
  correct: (typeof REACTION_TYPES)[number];
  explanation: string;
}

export const REACTION_QUESTIONS: ReactionQuestion[] = [
  {
    equation: '2H₂ + O₂ → 2H₂O',
    correct: 'Sintesis',
    explanation: 'Dua zat bergabung membentuk satu jenis senyawa: A + B → AB.',
  },
  {
    equation: '2KClO₃ → 2KCl + 3O₂',
    correct: 'Dekomposisi',
    explanation: 'Satu senyawa terurai menjadi beberapa zat yang lebih sederhana.',
  },
  {
    equation: 'Zn + 2HCl → ZnCl₂ + H₂',
    correct: 'Pertukaran tunggal',
    explanation: 'Seng menggantikan hidrogen dari asam: A + BC → AC + B.',
  },
  {
    equation: 'AgNO₃ + NaCl → AgCl + NaNO₃',
    correct: 'Pertukaran ganda',
    explanation: 'Dua senyawa bertukar pasangan ion: AB + CD → AD + CB.',
  },
  {
    equation: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
    correct: 'Pembakaran',
    explanation: 'Metana bereaksi dengan oksigen dan menghasilkan CO₂ serta H₂O.',
  },
  {
    equation: 'CaCO₃ → CaO + CO₂',
    correct: 'Dekomposisi',
    explanation: 'Satu senyawa, CaCO₃, terurai menjadi dua senyawa yang lebih sederhana.',
  },
  {
    equation: 'Fe + CuSO₄ → FeSO₄ + Cu',
    correct: 'Pertukaran tunggal',
    explanation: 'Besi menggantikan tembaga dari senyawanya.',
  },
  {
    equation: 'HCl + NaOH → NaCl + H₂O',
    correct: 'Pertukaran ganda',
    explanation: 'Ion dari asam dan basa bertukar pasangan membentuk garam dan air.',
  },
  {
    equation: 'N₂ + 3H₂ → 2NH₃',
    correct: 'Sintesis',
    explanation: 'Dua unsur bergabung membentuk satu jenis senyawa.',
  },
  {
    equation: 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O',
    correct: 'Pembakaran',
    explanation: 'Propana terbakar dalam oksigen menghasilkan CO₂ dan H₂O.',
  },
];

export const POLL_PROMPT =
  'Setelah mempelajari reaksi kimia, seberapa yakin kamu membedakan jenis-jenis reaksi?';
export const POLL_OPTIONS = [
  'Saya sudah paham dan bisa menjelaskan',
  'Saya cukup paham, tetapi masih perlu latihan',
  'Saya masih bingung pada beberapa jenis reaksi',
  'Saya belum paham dan perlu penjelasan ulang',
] as const;

export const PROGRESS_STAGES = [
  'Rumusan Masalah',
  'Data & Pengamatan',
  'Analisis Data',
  'Kesimpulan',
] as const;

export interface QuizAttempt {
  id: string;
  name: string;
  score: number;
  submittedAt: string;
}

export interface PollResponse {
  id: string;
  optionIndex: number;
  submittedAt: string;
}

export interface PollSession {
  id: string;
  responses: PollResponse[];
}

export interface AttendanceRecord {
  name: string;
  date: string;
  checkedInAt: string;
}

export interface StudentProgress {
  name: string;
  completedStages: number[];
  updatedAt: string;
}

export function normalizeStudentName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('id-ID');
}

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function readClassroomData<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.error(`Gagal membaca data kelas (${key}):`, error);
    return fallback;
  }
}

export function writeClassroomData<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('classroom-storage-update'));
    return true;
  } catch (error) {
    console.error(`Gagal menyimpan data kelas (${key}):`, error);
    return false;
  }
}
