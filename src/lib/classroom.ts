import { readJsonStorage, writeJsonStorage } from './safe-storage';

export const CLASSROOM_STORAGE_KEYS = {
  quiz: 'atomika-classroom-quiz-v1',
  poll: 'atomika-classroom-poll-v1',
  attendance: 'atomika-classroom-attendance-v1',
  progress: 'atomika-classroom-progress-v1',
  activity: 'atomika-classroom-activity-v1',
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

export interface AtomicQuizQuestion {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  correct: string;
  explanation: string;
  difficulty: 'mudah' | 'sedang' | 'sukar';
  topic: string;
}

export const ATOMIC_STRUCTURE_QUESTIONS: AtomicQuizQuestion[] = [
  {
    id: 'as-1',
    prompt: 'Partikel penyusun inti atom (nukleon) yang bermuatan positif dan partikel yang tidak bermuatan berturut-turut adalah...',
    options: [
      { id: 'A', text: 'Proton dan elektron' },
      { id: 'B', text: 'Proton dan neutron' },
      { id: 'C', text: 'Elektron dan neutron' },
      { id: 'D', text: 'Neutron dan proton' },
    ],
    correct: 'B',
    explanation: 'Inti atom tersusun dari proton yang bermuatan positif (+1) dan neutron yang bersifat netral (tidak bermuatan). Elektron berada di luar inti mengelilingi inti.',
    difficulty: 'mudah',
    topic: 'Struktur Atom Dasar',
  },
  {
    id: 'as-2',
    prompt: 'Model atom modern menyatakan bahwa elektron berada di daerah kebolehjadian terbesar ditemukannya elektron, yang disebut...',
    options: [
      { id: 'A', text: 'Inti atom' },
      { id: 'B', text: 'Orbital atom' },
      { id: 'C', text: 'Lintasan tetap' },
      { id: 'D', text: 'Sinar katoda' },
    ],
    correct: 'B',
    explanation: 'Menurut mekanika gelombang (model atom modern), posisi elektron tidak dapat dipastikan dengan pasti (prinsip ketidakpastian Heisenberg), melainkan dinyatakan dalam orbital yaitu ruang dengan kebolehjadian tertinggi menemukan elektron.',
    difficulty: 'mudah',
    topic: 'Struktur Atom Dasar',
  },
  {
    id: 'as-3',
    prompt: 'Unsur dengan lambang ²³₁₁Na memiliki jumlah proton, elektron, dan neutron pada keadaan netral berturut-turut adalah...',
    options: [
      { id: 'A', text: '11, 11, 12' },
      { id: 'B', text: '11, 12, 11' },
      { id: 'C', text: '12, 11, 11' },
      { id: 'D', text: '11, 11, 23' },
    ],
    correct: 'A',
    explanation: 'Nomor atom Z = 11, artinya jumlah proton = 11 dan elektron (atom netral) = 11. Nomor massa A = 23, sehingga neutron = A - Z = 23 - 11 = 12.',
    difficulty: 'sedang',
    topic: 'Nomor Atom & Nomor Massa',
  },
  {
    id: 'as-4',
    prompt: 'Karakteristik mendasar yang membedakan atom suatu unsur dengan atom unsur lainnya secara spesifik ditentukan oleh jumlah...',
    options: [
      { id: 'A', text: 'Neutron' },
      { id: 'B', text: 'Elektron valensi' },
      { id: 'C', text: 'Proton di dalam inti' },
      { id: 'D', text: 'Nomor massa' },
    ],
    correct: 'C',
    explanation: 'Jumlah proton di dalam inti (nomor atom Z) merupakan identitas khas suatu unsur. Tidak ada dua unsur berbeda yang memiliki jumlah proton yang sama.',
    difficulty: 'mudah',
    topic: 'Partikel Subatom',
  },
  {
    id: 'as-5',
    prompt: 'Suatu atom netral X memiliki 19 proton dan 20 neutron. Notasi nuklida yang benar untuk atom X adalah...',
    options: [
      { id: 'A', text: '¹⁹₂₀X' },
      { id: 'B', text: '²⁰₁₉X' },
      { id: 'C', text: '³⁹₁₉X' },
      { id: 'D', text: '³⁹₂₀X' },
    ],
    correct: 'C',
    explanation: 'Nomor atom Z = jumlah proton = 19. Nomor massa A = proton + neutron = 19 + 20 = 39. Notasi nuklida ditulis sebagai ᴬ_Z X, yaitu ³⁹₁₉X (Kalium/K).',
    difficulty: 'sedang',
    topic: 'Nomor Atom & Nomor Massa',
  },
  {
    id: 'as-6',
    prompt: 'Pasangan nuklida berikut yang tergolong ISOTOP adalah...',
    options: [
      { id: 'A', text: '¹²₆C dan ¹³₆C' },
      { id: 'B', text: '¹⁴₆C dan ¹⁴₇N' },
      { id: 'C', text: '³¹₁₅P dan ³²₁₆S' },
      { id: 'D', text: '²⁴₁₁Na dan ²⁴₁₂Mg' },
    ],
    correct: 'A',
    explanation: 'Isotop adalah atom-atom dari unsur yang sama (nomor atom Z sama, yaitu 6) tetapi memiliki nomor massa A yang berbeda (12 dan 13).',
    difficulty: 'sedang',
    topic: 'Isotop, Isobar, Isoton',
  },
  {
    id: 'as-7',
    prompt: 'Diberikan dua nuklida: ³¹₁₅P dan ³²₁₆S. Hubungan yang tepat antara kedua nuklida tersebut adalah...',
    options: [
      { id: 'A', text: 'Isotop, karena nomor atomnya berdekatan' },
      { id: 'B', text: 'Isobar, karena memiliki sifat kimia mirip' },
      { id: 'C', text: 'Isoton, karena keduanya memiliki 16 neutron' },
      { id: 'D', text: 'Isoton, karena keduanya memiliki 15 elektron' },
    ],
    correct: 'C',
    explanation: 'Jumlah neutron P = 31 - 15 = 16. Jumlah neutron S = 32 - 16 = 16. Karena jumlah neutronnya sama (16), maka kedua nuklida tersebut adalah ISOTON.',
    difficulty: 'sukar',
    topic: 'Isotop, Isobar, Isoton',
  },
  {
    id: 'as-8',
    prompt: 'Ion Magnesium (²⁴₁₂Mg²⁺) terbentuk ketika atom Mg kehilangan 2 elektron. Jumlah proton, neutron, dan elektron ion tersebut adalah...',
    options: [
      { id: 'A', text: '12 proton, 12 neutron, 12 elektron' },
      { id: 'B', text: '12 proton, 12 neutron, 10 elektron' },
      { id: 'C', text: '10 proton, 12 neutron, 12 elektron' },
      { id: 'D', text: '14 proton, 12 neutron, 12 elektron' },
    ],
    correct: 'B',
    explanation: 'Nomor atom Z = 12 (proton = 12). Inti tidak berubah saat pembentukan ion. Neutron = 24 - 12 = 12. Karena bermuatan +2 (kation), elektron berkurang 2: 12 - 2 = 10 elektron.',
    difficulty: 'sedang',
    topic: 'Ion & Perubahan Elektron',
  },
  {
    id: 'as-9',
    prompt: 'Suatu ion Sulfida (S²⁻) memiliki nomor atom 16 dan nomor massa 32. Pernyataan yang BENAR mengenai ion S²⁻ adalah...',
    options: [
      { id: 'A', text: 'Memiliki 16 proton dan 14 elektron' },
      { id: 'B', text: 'Memiliki 18 proton dan 16 elektron' },
      { id: 'C', text: 'Memiliki 16 proton dan 18 elektron' },
      { id: 'D', text: 'Memiliki 18 neutron dan 16 elektron' },
    ],
    correct: 'C',
    explanation: 'Ion S²⁻ adalah anion bermuatan -2, artinya atom S (Z=16) menangkap 2 elektron. Jumlah proton tetap 16, neutron = 32 - 16 = 16, dan jumlah elektron = 16 + 2 = 18 elektron.',
    difficulty: 'sedang',
    topic: 'Ion & Perubahan Elektron',
  },
  {
    id: 'as-10',
    prompt: 'Ketika atom klor netral (³⁵₁₇Cl) menerima 1 elektron menjadi ion klorida (Cl⁻), manakah pernyataan yang paling akurat?',
    options: [
      { id: 'A', text: 'Jumlah proton dan nomor massa bertambah 1 satuan' },
      { id: 'B', text: 'Jumlah neutron berkurang sehingga massa atom mengecil' },
      { id: 'C', text: 'Hanya jumlah elektron pada kulit terluar yang bertambah, sedangkan struktur inti (proton & neutron) tetap utuh' },
      { id: 'D', text: 'Muatan inti atom berubah dari netral menjadi negatif' },
    ],
    correct: 'C',
    explanation: 'Reaksi kimia dan pembentukan ion hanya melibatkan perpindahan elektron (terutama elektron valensi). Inti atom yang terdiri atas proton dan neutron tetap utuh dan tidak terpengaruh, sehingga nomor atom dan nomor massa tidak berubah.',
    difficulty: 'sukar',
    topic: 'Ion & Perubahan Elektron',
  },
];

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
  className?: string;
  quizTitle?: string;
}

export interface TrackedQuizResult extends QuizAttempt {
  uid?: string;
  institutionId?: string;
  className: string;
  quizTitle: string;
  maxScore: number;
  percent: number;
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
  uid?: string;
  institutionId?: string;
  name: string;
  className: string;
  activity: string;
  path: string;
  progressSummary: string;
  lastSeen: string;
}

export function getUserClassroomStorageKey(key: string, uid: string): string {
  return `${key}:uid:${uid}`;
}

export function normalizeStudentName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('id-ID');
}

export function getStudentActivityKey(
  activity: Pick<StudentActivity, 'uid' | 'name' | 'className'>
): string {
  return activity.uid?.trim()
    ? `uid:${activity.uid.trim()}`
    : `legacy:${normalizeStudentName(activity.name)}|${normalizeStudentName(activity.className)}`;
}

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function readClassroomData<T>(key: string, fallback: T): T {
  return readJsonStorage(key, fallback).value;
}

export function writeClassroomData<T>(key: string, value: T): boolean {
  const persisted = writeJsonStorage(key, value);
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('classroom-storage-update'));
    } catch (error) {
      console.error('Gagal memperbarui tampilan data kelas:', error);
    }
  }
  return persisted;
}
