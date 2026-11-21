export const TEACHER_PIN = '122333';
export const CLASSROOM_STORAGE_KEYS = {
  quiz: 'atomika-classroom-quiz-v1',
  poll: 'atomika-classroom-poll-v1',
  attendance: 'atomika-classroom-attendance-v1',
  progress: 'atomika-classroom-progress-v1',
  activity: 'atomika-classroom-activity-v1',
} as const;

export type QuestionDifficulty = 'Mudah' | 'Sedang' | 'Sukar';

export interface AtomQuestion {
  id: string;
  difficulty: QuestionDifficulty;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

export const ATOM_QUESTIONS: AtomQuestion[] = [
  // --- TINGKAT MUDAH ---
  {
    id: 'atom-q1',
    difficulty: 'Mudah',
    question: 'Partikel subatomik yang bermuatan positif dan terletak di dalam inti atom adalah...',
    options: ['Proton', 'Elektron', 'Neutron', 'Positron'],
    correct: 'Proton',
    explanation:
      'Proton bermuatan positif (+1) dan bersama neutron terletak di dalam inti atom (nukleus), sedangkan elektron bermuatan negatif (-1) mengelilingi inti.',
  },
  {
    id: 'atom-q2',
    difficulty: 'Mudah',
    question:
      'Model atom yang menggambarkan atom menyerupai "roti kismis" dengan elektron bermuatan negatif tersebar merata dalam bola bermuatan positif dikemukakan oleh...',
    options: ['J.J. Thomson', 'John Dalton', 'Ernest Rutherford', 'Niels Bohr'],
    correct: 'J.J. Thomson',
    explanation:
      'J.J. Thomson mengemukakan model atom roti kismis setelah berhasil menemukan elektron melalui percobaan tabung sinar katode.',
  },
  {
    id: 'atom-q3',
    difficulty: 'Mudah',
    question:
      'Suatu atom netral memiliki nomor atom (Z) = 11 dan nomor massa (A) = 23. Jumlah proton, elektron, dan neutron atom tersebut berturut-turut adalah...',
    options: ['11, 11, 12', '11, 12, 11', '12, 11, 12', '11, 11, 23'],
    correct: '11, 11, 12',
    explanation:
      'Pada atom netral, proton = elektron = Z = 11. Jumlah neutron = A - Z = 23 - 11 = 12.',
  },

  // --- TINGKAT SEDANG ---
  {
    id: 'atom-q4',
    difficulty: 'Sedang',
    question:
      'Pasangan nuklida berikut yang merupakan pasangan ISOBAR (memiliki nomor massa sama namun nomor atom berbeda) adalah...',
    options: ['₁₂²⁴Mg dan ₁₁²⁴Na', '₆¹²C dan ₆¹³C', '₁₁²³Na dan ₁₂²⁴Mg', '₁₅³¹P dan ₁₆³²S'],
    correct: '₁₂²⁴Mg dan ₁₁²⁴Na',
    explanation:
      'Isobar adalah nuklida-nuklida yang memiliki nomor massa sama (keduanya memiliki massa 24), tetapi nomor atomnya berbeda (Mg = 12, Na = 11).',
  },
  {
    id: 'atom-q5',
    difficulty: 'Sedang',
    question:
      'Ion Ca²⁺ (nomor atom Ca = 20, nomor massa = 40) memiliki jumlah proton, elektron, dan neutron berturut-turut sebanyak...',
    options: [
      '20 proton, 18 elektron, 20 neutron',
      '20 proton, 22 elektron, 20 neutron',
      '18 proton, 20 elektron, 20 neutron',
      '20 proton, 20 elektron, 20 neutron',
    ],
    correct: '20 proton, 18 elektron, 20 neutron',
    explanation:
      'Jumlah proton = Z = 20. Karena bermuatan +2 (melepas 2 elektron), jumlah elektron = 20 - 2 = 18. Jumlah neutron = 40 - 20 = 20.',
  },
  {
    id: 'atom-q6',
    difficulty: 'Sedang',
    question:
      'Menurut teori atom Niels Bohr, konfigurasi elektron dari atom Klorin (₁₇Cl) pada kulit K, L, M adalah...',
    options: ['2, 8, 7', '2, 7, 8', '2, 8, 8, 1', '2, 8, 6, 1'],
    correct: '2, 8, 7',
    explanation:
      'Kapasitas maksimum kulit K = 2, kulit L = 8, dan sisa 7 elektron mengisi kulit M, sehingga elektron valensinya adalah 7.',
  },
  {
    id: 'atom-q7',
    difficulty: 'Sedang',
    question:
      'Kelemahan utama dari model atom Rutherford yang kemudian disempurnakan oleh Niels Bohr adalah ketidakmampuannya menjelaskan...',
    options: [
      'Mengapa elektron tidak jatuh ke inti atom akibat radiasi energi',
      'Adanya partikel neutron di dalam inti atom',
      'Bentuk lintasan elips pada orbital elektron',
      'Muatan positif yang terpusat di inti atom',
    ],
    correct: 'Mengapa elektron tidak jatuh ke inti atom akibat radiasi energi',
    explanation:
      'Menurut fisika klasik Maxwell, elektron yang berputar mengelilingi inti memancarkan radiasi elektromagnetik dan akhirnya jatuh ke inti. Bohr memecahkan ini dengan postulat lintasan stasioner berenergi tetap.',
  },

  // --- TINGKAT SUKAR ---
  {
    id: 'atom-q8',
    difficulty: 'Sukar',
    question:
      'Konfigurasi elektron atom Besi (₂₆Fe) berdasarkan prinsip Aufbau dan penulisan singkat gas mulia yang tepat adalah...',
    options: ['[Ar] 4s² 3d⁶', '[Ar] 4s¹ 3d⁷', '[Ar] 3d⁸', '[Ne] 3s² 3p⁶ 3d⁸'],
    correct: '[Ar] 4s² 3d⁶',
    explanation:
      'Nomor atom Fe = 26. Gas mulia terdekat adalah Argon ([Ar] dengan 18 elektron). Tingkat energi berikutnya terisi: 4s² (2 elektron) kemudian 3d⁶ (6 elektron), total 18 + 2 + 6 = 26.',
  },
  {
    id: 'atom-q9',
    difficulty: 'Sukar',
    question:
      'Ion Fe³⁺ memiliki nomor atom Z = 26. Jumlah elektron tidak berpasangan pada ion Fe³⁺ tersebut adalah...',
    options: ['5 elektron', '4 elektron', '3 elektron', '1 elektron'],
    correct: '5 elektron',
    explanation:
      'Konfigurasi Fe: [Ar] 4s² 3d⁶. Ketika membentuk Fe³⁺, dua elektron dari 4s dan satu elektron dari 3d lepas, menghasilkan [Ar] 3d⁵. Berdasarkan Aturan Hund, kelima orbital 3d masing-masing terisi tepat 1 elektron tunggal searah, sehingga terdapat 5 elektron tidak berpasangan.',
  },
  {
    id: 'atom-q10',
    difficulty: 'Sukar',
    question:
      'Konfigurasi elektron atom Kromium (₂₄Cr) yang tepat dan stabil menurut kaidah orbital setengah penuh (half-filled) adalah...',
    options: ['[Ar] 4s¹ 3d⁵', '[Ar] 4s² 3d⁴', '[Ar] 4s⁰ 3d⁶', '[Ne] 3s² 3p⁶ 4s² 3d⁴'],
    correct: '[Ar] 4s¹ 3d⁵',
    explanation:
      'Subkulit d yang terisi tepat setengah penuh (3d⁵) memiliki simetri bola dan kestabilan energi yang lebih tinggi dibanding 4s² 3d⁴, sehingga satu elektron dari 4s berpindah ke 3d menghasilkan konfigurasi stabil [Ar] 4s¹ 3d⁵.',
  },
];

// Alias kompatibilitas
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
  'Setelah mempelajari materi Struktur Atom, seberapa yakin kamu memahami konsep partikel dasar, model atom, dan konfigurasi elektron?';
export const POLL_OPTIONS = [
  'Saya sudah sangat paham dan bisa menjelaskan',
  'Saya cukup paham, tetapi masih perlu latihan soal',
  'Saya masih bingung pada beberapa konsep (misal: konfigurasi elektron/model atom)',
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
  className?: string;
  quizTitle?: string;
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
  className?: string;
  completedStages: number[];
  updatedAt: string;
}

export interface StudentActivity {
  name: string;
  className: string;
  activity: string;
  path: string;
  progressSummary: string;
  lastSeen: string;
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
