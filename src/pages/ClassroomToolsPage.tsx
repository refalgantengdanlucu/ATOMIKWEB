import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  CalendarCheck,
  Check,
  CheckCircle2,
  ClipboardList,
  Eye,
  EyeOff,
  KeyRound,
  RotateCw,
  Users,
} from 'lucide-react';
import { updateTeacherPassword } from '../lib/teacher-auth';
import {
  ATOM_QUESTIONS,
  CLASSROOM_STORAGE_KEYS,
  getLocalDateKey,
  normalizeStudentName,
  POLL_OPTIONS,
  POLL_PROMPT,
  PROGRESS_STAGES,
  readClassroomData,
  writeClassroomData,
  recordClassroomQuiz,
  recordStudentActivity,
  type TrackedQuizResult,
} from '../lib/classroom';
import type {
  AttendanceRecord,
  PollResponse,
  PollSession,
  QuizAttempt,
  StudentActivity,
  StudentProgress,
} from '../lib/classroom';
import { useAccess } from '../lib/access-context';
import {
  getQuizAttempts,
  saveAttendance,
  savePollResponse,
  saveQuizAttempt,
  saveStudentActivity,
  saveStudentProgress,
  subscribeAllAttendance,
  subscribePollResponses,
  subscribeQuizAttempts,
  subscribeStudentActivities,
  subscribeStudentProgress,
} from '../lib/firebase-db';

type ActivityTab = 'quiz' | 'poll' | 'attendance' | 'progress' | 'activity' | 'settings';

const TABS: { id: ActivityTab; title: string; description: string; icon: typeof Activity }[] = [
  { id: 'quiz', title: 'Kuis Struktur Atom', description: '10 soal (Mudah, Sedang, Sukar)', icon: ClipboardList },
  { id: 'poll', title: 'Cek Pemahaman Live', description: 'Polling cepat kelas', icon: BarChart3 },
  { id: 'attendance', title: 'Presensi', description: 'Check-in kehadiran', icon: CalendarCheck },
  { id: 'progress', title: 'Progres Tugas', description: 'Checklist laporan praktikum', icon: CheckCircle2 },
];
const TEACHER_TABS = [
  ...TABS,
  { id: 'activity' as const, title: 'Aktivitas Siswa', description: 'Posisi dan progres belajar', icon: Users },
  { id: 'settings' as const, title: 'Sandi Guru', description: 'Pengaturan sandi khusus guru', icon: KeyRound },
];

const panelClass = 'rounded-3xl border border-[#F1E5D8] bg-white p-5 shadow-sm sm:p-8';
const buttonClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#C2410C] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#9A3412] disabled:cursor-not-allowed disabled:opacity-50';

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { dateStyle: 'full' });
}

function currentTimestamp(): string {
  return new Date().toISOString();
}

function studentActivityKey(activity: StudentActivity): string {
  return `${normalizeStudentName(activity.name)}|${normalizeStudentName(activity.className)}`;
}

function mergeActivities(local: StudentActivity[], remote: StudentActivity[]): StudentActivity[] {
  const records = new Map<string, StudentActivity>();
  for (const activity of [...local, ...remote]) {
    const key = studentActivityKey(activity);
    const existing = records.get(key);
    if (!existing || Date.parse(activity.lastSeen) > Date.parse(existing.lastSeen)) {
      records.set(key, activity);
    }
  }
  return [...records.values()].sort((a, b) => Date.parse(b.lastSeen) - Date.parse(a.lastSeen));
}

function mergeQuizResults(local: (QuizAttempt | TrackedQuizResult)[], remote: TrackedQuizResult[]): TrackedQuizResult[] {
  const results = new Map<string, TrackedQuizResult>();
  for (const result of [...local, ...remote]) {
    const submittedAt = new Date(result.submittedAt).toISOString();
    const maxScore = 'maxScore' in result && typeof result.maxScore === 'number' && result.maxScore > 0 ? result.maxScore : 10;
    const percent = 'percent' in result && typeof result.percent === 'number' ? result.percent : Math.round((result.score / maxScore) * 100);
    const normalized: TrackedQuizResult = {
      ...result,
      submittedAt,
      className: result.className ?? '',
      quizTitle: result.quizTitle ?? 'Kuis Struktur Atom (Fase E)',
      maxScore,
      percent,
    };
    const key = result.id || `${normalizeStudentName(normalized.name)}|${normalizeStudentName(normalized.className)}|${normalized.quizTitle}|${normalized.submittedAt}`;
    results.set(key, normalized);
  }
  return [...results.values()].sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt));
}

function mergeAttendanceRecords(local: AttendanceRecord[], remote: AttendanceRecord[]): AttendanceRecord[] {
  const records = new Map<string, AttendanceRecord>();
  for (const record of [...local, ...remote]) {
    const key = `${record.date}|${normalizeStudentName(record.name)}`;
    const existing = records.get(key);
    if (!existing || Date.parse(record.checkedInAt) > Date.parse(existing.checkedInAt)) {
      records.set(key, record);
    }
  }
  return [...records.values()].sort(
    (a, b) => b.date.localeCompare(a.date) || b.checkedInAt.localeCompare(a.checkedInAt)
  );
}

function downloadQuizSpreadsheet(results: TrackedQuizResult[]): void {
  const rows = [
    ['Nama', 'Kelas', 'Kuis', 'Skor', 'Skor Maksimum', 'Nilai (%)', 'Waktu'],
    ...results.map((result) => [
      result.name,
      result.className,
      result.quizTitle,
      String(result.score),
      String(result.maxScore),
      String(result.percent),
      result.submittedAt,
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map((cell) => {
    const safeCell = /^[=+\-@]/.test(cell) ? `'${cell}` : cell;
    return `"${safeCell.replace(/"/g, '""')}"`;
  }).join(',')).join('\r\n')}`;
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'hasil-kuis-struktur-atom.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function mergeStudentProgress(local: StudentProgress[], remote: StudentProgress[]): StudentProgress[] {
  const records = new Map<string, StudentProgress>();
  for (const student of [...local, ...remote]) {
    const key = `${normalizeStudentName(student.name)}|${normalizeStudentName(student.className ?? '')}`;
    const existing = records.get(key);
    if (!existing || Date.parse(student.updatedAt) > Date.parse(existing.updatedAt)) records.set(key, student);
  }
  return [...records.values()].sort(
    (a, b) => a.completedStages.length - b.completedStages.length || a.name.localeCompare(b.name, 'id'),
  );
}

export function ClassroomToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('aktivitas');
  const [activeTab, setActiveTabState] = useState<ActivityTab>(
    TEACHER_TABS.some((tab) => tab.id === requestedTab) ? requestedTab as ActivityTab : 'quiz',
  );
  const [storageError, setStorageError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const { profile } = useAccess();

  const refresh = useCallback(() => setRefreshKey((current) => current + 1), []);
  const setActiveTab = (tab: ActivityTab) => {
    setActiveTabState(tab);
    setSearchParams({ aktivitas: tab }, { replace: true });
  };

  useEffect(() => {
    const sync = () => refresh();
    window.addEventListener('storage', sync);
    window.addEventListener('classroom-storage-update', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('classroom-storage-update', sync);
    };
  }, [refresh]);

  const save = useCallback((key: string, value: unknown) => {
    if (!writeClassroomData(key, value)) {
      setStorageError('Data tidak dapat disimpan di browser ini. Periksa ruang penyimpanan atau pengaturan browser.');
      return false;
    }
    setStorageError('');
    refresh();
    return true;
  }, [refresh]);

  if (!profile) return null;

  const quizAttempts = readClassroomData<QuizAttempt[]>(CLASSROOM_STORAGE_KEYS.quiz, []);
  const pollSession = readClassroomData<PollSession>(CLASSROOM_STORAGE_KEYS.poll, { id: 'poll-1', responses: [] });
  const attendanceRecords = readClassroomData<AttendanceRecord[]>(CLASSROOM_STORAGE_KEYS.attendance, []);
  const studentProgress = readClassroomData<StudentProgress[]>(CLASSROOM_STORAGE_KEYS.progress, []);
  const activityRecords = readClassroomData<StudentActivity[]>(CLASSROOM_STORAGE_KEYS.activity, []);

  const groupedAttendance = [...attendanceRecords].sort((a, b) =>
    b.date.localeCompare(a.date) || b.checkedInAt.localeCompare(a.checkedInAt),
  );
  const orderedProgress = [...studentProgress].sort(
    (a, b) => a.completedStages.length - b.completedStages.length || a.name.localeCompare(b.name, 'id'),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-16">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#FFEDD5] px-3 py-1 text-xs font-bold text-[#9A3412]">
            {profile?.role === 'teacher' ? <Users className="h-4 w-4" aria-hidden="true" /> : <Activity className="h-4 w-4" aria-hidden="true" />}
            {profile?.role === 'teacher' ? 'Dashboard Guru' : 'Kegiatan kelas kimia'}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#172033] sm:text-4xl">{profile?.role === 'teacher' ? 'Rekap dan pantau kelas' : 'Belajar bersama, pantau progres'}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
            {profile?.role === 'teacher' ? `Selamat datang, ${profile.name}.` : 'Kuis, cek pemahaman, presensi, dan pelacak tugas untuk kelas XI.'}
          </p>
        </div>
      </header>

      {storageError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{storageError}</p>}

      <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-xs leading-5 text-emerald-950">
        <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
        <span>
          {profile?.role === 'teacher'
            ? 'Sistem Rekap Kelas Aktif — Hasil kuis, presensi, dan aktivitas murid langsung terhubung ke akun guru secara real-time.'
            : 'Sesi belajar murid aktif — Aktivitas dan progres pembelajaran tersimpan otomatis di akun guru.'}
        </span>
      </div>

      {profile?.role === 'teacher' ? (
        <TeacherDashboard
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRefresh={refresh}
          onSave={save}
          attempts={quizAttempts}
          pollSession={pollSession}
          attendanceRecords={groupedAttendance}
          progress={orderedProgress}
          activities={activityRecords}
          refreshVersion={refreshKey}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {TABS.map(({ id, title, description, icon: Icon }) => (
              <button
                type="button"
                key={id}
                onClick={() => setActiveTab(id)}
                aria-pressed={activeTab === id}
                className={`rounded-2xl border p-4 text-left transition-colors ${activeTab === id ? 'border-[#C2410C] bg-orange-50' : 'border-[#F1E5D8] bg-white hover:bg-orange-50/60'}`}
              >
                <Icon className={`mb-3 h-5 w-5 ${activeTab === id ? 'text-[#C2410C]' : 'text-[#F97316]'}`} aria-hidden="true" />
                <span className="block text-sm font-bold text-[#172033]">{title}</span>
                <span className="mt-1 block text-xs text-[#64748B]">{description}</span>
              </button>
            ))}
          </div>

          {activeTab === 'quiz' && <AtomQuiz key={profile.name} initialName={profile.name} className={profile.className} />}
          {activeTab === 'poll' && <StudentPoll key={pollSession.id} onSave={save} pollSession={pollSession} />}
          {activeTab === 'attendance' && <StudentAttendance key={profile.name} initialName={profile.name} onSave={save} records={attendanceRecords} />}
          {activeTab === 'progress' && <StudentTaskProgress key={`${profile.name}|${profile.className}`} initialName={profile.name} className={profile.className} onSave={save} progress={studentProgress} />}
        </>
      )}
    </div>
  );
}

function AtomQuiz({ initialName, className }: { initialName: string; className: string }) {
  const [name] = useState(initialName);
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [savedScore, setSavedScore] = useState<number | null>(null);
  const [syncMessage, setSyncMessage] = useState('');
  const question = ATOM_QUESTIONS[questionIndex];

  const finishQuiz = (nextAnswers: boolean[]) => {
    const score = nextAnswers.filter(Boolean).length;
    const attempt: TrackedQuizResult = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim().replace(/\s+/g, ' '),
      className,
      quizTitle: 'Kuis Struktur Atom (Fase E)',
      score,
      maxScore: ATOM_QUESTIONS.length,
      percent: Math.round((score / ATOM_QUESTIONS.length) * 100),
      submittedAt: new Date().toISOString(),
    };

    // 1. Simpan ke local classroom storage agar akun guru langsung membaca
    recordClassroomQuiz(attempt);
    setSavedScore(score);
    setFinished(true);

    // 2. Simpan ke database Firestore
    void saveQuizAttempt(attempt);

    // 3. Catat aktivitas belajar murid
    const activityRecord: StudentActivity = {
      name: attempt.name,
      className: attempt.className,
      activity: `Menyelesaikan Kuis Struktur Atom (Nilai: ${attempt.percent}%)`,
      path: '/kelas?aktivitas=quiz',
      progressSummary: `Skor: ${attempt.score}/${attempt.maxScore} (${attempt.percent}%)`,
      lastSeen: attempt.submittedAt,
    };
    recordStudentActivity(activityRecord);
    void saveStudentActivity(activityRecord);

    setSyncMessage('Nilai kuis tersimpan dan langsung masuk ke akun guru.');
  };

  if (finished) {
    return (
      <section className={`${panelClass} mx-auto max-w-2xl text-center`}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-[#64748B]">Kuis selesai, {name.trim()}!</p>
        <h2 className="mt-1 text-4xl font-black text-[#172033]">
          {savedScore ?? 0}
          <span className="text-xl text-[#64748B]"> / {ATOM_QUESTIONS.length}</span>
        </h2>
        <p className="mt-2 text-sm text-[#475569]">
          Nilai kuis Struktur Atom kamu telah otomatis tercatat dan dapat dilihat oleh guru di rekap kelas.
        </p>
        <p role="status" className="mt-3 text-xs text-[#64748B]">{syncMessage || 'Menyimpan hasil kuis...'}</p>
        <button
          type="button"
          className={`${buttonClass} mt-6`}
          onClick={() => {
            setQuestionIndex(-1);
            setSelected(null);
            setAnswers([]);
            setFinished(false);
            setSavedScore(null);
          }}
        >
          Ulangi Kuis
        </button>
      </section>
    );
  }

  if (questionIndex === -1) {
    return (
      <section className={`${panelClass} mx-auto max-w-2xl`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-[#C2410C]">
            Kuis Struktur Atom
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-[#475569]">
            {ATOM_QUESTIONS.length} Soal
          </span>
        </div>
        <h2 className="mt-3 text-2xl font-extrabold text-[#172033]">
          Uji Pemahaman Materi Struktur Atom
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#475569]">
          Soal disusun bertahap dengan 3 tingkat kesulitan:{' '}
          <span className="font-bold text-emerald-700">Mudah</span> (partikel & model dasar),{' '}
          <span className="font-bold text-amber-700">Sedang</span> (notasi atom, ion, konfigurasi Bohr), hingga{' '}
          <span className="font-bold text-rose-700">Sukar</span> (konfigurasi Aufbau & Aturan Hund).
        </p>
        <div className="mt-6 space-y-4">
          <p className="rounded-xl bg-[#FFF8F0] px-4 py-3 text-sm text-[#475569]">
            Nama peserta: <strong className="text-[#172033]">{name}</strong> {className && `(${className})`}
          </p>
          <button type="button" className={buttonClass} onClick={() => setQuestionIndex(0)}>
            Mulai Kuis Sekarang
          </button>
        </div>
      </section>
    );
  }

  const isCorrect = selected === question.correct;
  const difficultyBadge =
    question.difficulty === 'Mudah'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
      : question.difficulty === 'Sedang'
        ? 'bg-amber-50 text-amber-800 border-amber-300'
        : 'bg-rose-50 text-rose-800 border-rose-300';

  return (
    <section className={`${panelClass} mx-auto max-w-2xl`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
            Soal {questionIndex + 1} dari {ATOM_QUESTIONS.length}
          </p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${difficultyBadge}`}>
            Tingkat: {question.difficulty}
          </span>
        </div>
        <span className="text-xs font-semibold text-[#64748B]">
          {answers.filter(Boolean).length} benar sejauh ini
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-orange-100">
        <div
          className="h-full rounded-full bg-[#F97316] transition-all"
          style={{ width: `${((questionIndex + 1) / ATOM_QUESTIONS.length) * 100}%` }}
        />
      </div>

      <h2 className="mt-6 text-lg font-bold leading-relaxed text-[#172033]">
        {question.question}
      </h2>

      <div className="mt-5 space-y-2.5">
        {question.options.map((option, optIdx) => {
          const letter = String.fromCharCode(65 + optIdx);
          const isThisSelected = selected === option;
          const isThisCorrect = option === question.correct;

          let btnClass = 'border-[#F1E5D8] bg-white hover:border-orange-300 hover:bg-orange-50/60 text-[#172033]';
          if (selected) {
            if (isThisCorrect) {
              btnClass = 'border-green-500 bg-green-50 text-green-900 font-bold';
            } else if (isThisSelected) {
              btnClass = 'border-red-400 bg-red-50 text-red-900';
            } else {
              btnClass = 'border-[#F1E5D8] bg-slate-50/60 text-slate-400 opacity-60';
            }
          }

          return (
            <button
              type="button"
              key={option}
              disabled={selected !== null}
              onClick={() => {
                setSelected(option);
                setAnswers((current) => [...current, option === question.correct]);
              }}
              className={`flex w-full min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${btnClass}`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  selected && isThisCorrect
                    ? 'bg-green-600 text-white'
                    : selected && isThisSelected
                      ? 'bg-red-600 text-white'
                      : 'bg-orange-100 text-[#C2410C]'
                }`}
              >
                {letter}
              </span>
              <span className="flex-1 leading-snug">{option}</span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          role="status"
          className={`mt-5 rounded-2xl p-4 text-sm leading-6 border ${
            isCorrect
              ? 'border-green-200 bg-green-50 text-green-950'
              : 'border-amber-200 bg-amber-50 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1">
            {isCorrect ? (
              <span className="text-green-800">✓ Tepat sekali!</span>
            ) : (
              <span className="text-amber-900">
                ✕ Belum tepat. Jawaban yang benar: <strong>{question.correct}</strong>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#475569]">{question.explanation}</p>
          <button
            type="button"
            className={`${buttonClass} mt-4`}
            onClick={() => {
              if (questionIndex === ATOM_QUESTIONS.length - 1) {
                finishQuiz(answers);
              } else {
                setQuestionIndex((current) => current + 1);
                setSelected(null);
              }
            }}
          >
            {questionIndex === ATOM_QUESTIONS.length - 1 ? 'Lihat Skor Saya' : 'Soal Berikutnya'}
          </button>
        </div>
      )}
    </section>
  );
}

function StudentPoll({ onSave, pollSession }: { onSave: (key: string, value: unknown) => boolean; pollSession: PollSession }) {
  const submittedKey = `atomika-poll-submitted-${pollSession.id}`;
  const [submittedSessionId, setSubmittedSessionId] = useState(() => {
    try {
      return window.localStorage.getItem(submittedKey) === 'true' ? pollSession.id : '';
    } catch (error) {
      console.error('Gagal membaca status polling:', error);
      return '';
    }
  });
  const [choice, setChoice] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState('');
  const alreadySubmitted = submittedSessionId === pollSession.id;

  const submit = () => {
    if (choice === null) return;
    const response = { id: crypto.randomUUID(), optionIndex: choice, submittedAt: new Date().toISOString() };
    if (onSave(CLASSROOM_STORAGE_KEYS.poll, { ...pollSession, responses: [...pollSession.responses, response] })) {
      void savePollResponse(pollSession.id, response);
      try {
        window.localStorage.setItem(submittedKey, 'true');
        setSubmittedSessionId(pollSession.id);
        setSubmitError('');
      } catch (error) {
        console.error('Gagal menandai polling yang sudah dikirim:', error);
        setSubmitError('Jawaban tersimpan, tetapi penanda sekali-kirim gagal disimpan di browser ini.');
      }
    }
  };

  return (
    <section className={`${panelClass} mx-auto max-w-2xl`}>
      <p className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">Cek pemahaman · tanpa nilai</p>
      <h2 className="mt-3 text-xl font-extrabold leading-snug text-[#172033]">{POLL_PROMPT}</h2>
      {alreadySubmitted ? (
        <p role="status" className="mt-6 flex items-center gap-3 rounded-2xl bg-green-50 p-5 font-semibold text-green-900"><CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />Jawabanmu sudah tercatat.</p>
      ) : (
        <>
          <div className="mt-5 space-y-2">
            {POLL_OPTIONS.map((option, index) => (
              <label key={option} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm ${choice === index ? 'border-[#C2410C] bg-orange-50' : 'border-[#F1E5D8] hover:bg-orange-50/60'}`}>
                <input type="radio" name="poll-choice" checked={choice === index} onChange={() => setChoice(index)} className="h-4 w-4 accent-[#C2410C]" />
                <span className="font-medium text-[#172033]">{option}</span>
              </label>
            ))}
          </div>
          {submitError && <p role="alert" className="mt-3 text-sm text-amber-800">{submitError}</p>}
          <button type="button" className={`${buttonClass} mt-5`} disabled={choice === null} onClick={submit}>Kirim Jawaban</button>
        </>
      )}
    </section>
  );
}

function StudentAttendance({ initialName, onSave, records }: { initialName: string; onSave: (key: string, value: unknown) => boolean; records: AttendanceRecord[] }) {
  const name = initialName;
  const [confirmation, setConfirmation] = useState<{ name: string; time: string; duplicate: boolean } | null>(null);

  const checkIn = () => {
    const normalized = normalizeStudentName(name);
    if (!normalized) return;
    const today = getLocalDateKey(new Date());
    const existing = records.find((record) => record.date === today && normalizeStudentName(record.name) === normalized);
    if (existing) {
      setConfirmation({ name: existing.name, time: existing.checkedInAt, duplicate: true });
      return;
    }
    const record = { name: name.trim().replace(/\s+/g, ' '), date: today, checkedInAt: new Date().toISOString() };
    if (onSave(CLASSROOM_STORAGE_KEYS.attendance, [...records, record])) {
      void saveAttendance(record);
      setConfirmation({ name: record.name, time: record.checkedInAt, duplicate: false });
    }
  };

  return (
    <section className={`${panelClass} mx-auto max-w-2xl`}>
      <p className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">Presensi kelas kimia</p>
      <h2 className="mt-2 text-2xl font-extrabold text-[#172033]">Sudah sampai? Absen dulu.</h2>
      {confirmation ? (
        <div role="status" className={`mt-5 rounded-2xl p-5 ${confirmation.duplicate ? 'bg-amber-50 text-amber-950' : 'bg-green-50 text-green-900'}`}>
          <p className="font-bold">{confirmation.duplicate ? `Kamu sudah absen hari ini pukul ${formatTime(confirmation.time)}.` : 'Kehadiranmu tercatat!'}</p>
          <p className="mt-1 text-sm">{confirmation.name} · {formatDateTime(confirmation.time)}</p>
          <button type="button" className="mt-4 text-sm font-semibold underline" onClick={() => setConfirmation(null)}>Selesai</button>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <p className="rounded-xl bg-[#FFF8F0] px-4 py-3 text-sm text-[#475569]">Nama: <strong className="text-[#172033]">{name}</strong></p>
          <button type="button" className={`${buttonClass} min-h-14 w-full text-base`} onClick={checkIn}>Absen Sekarang</button>
        </div>
      )}
    </section>
  );
}

function StudentTaskProgress({ initialName, className, onSave, progress }: { initialName: string; className: string; onSave: (key: string, value: unknown) => boolean; progress: StudentProgress[] }) {
  const [name] = useState(initialName);
  const [loadedName, setLoadedName] = useState('');
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [saveMessage, setSaveMessage] = useState('');
  const [syncMessage, setSyncMessage] = useState('');

  const loadStudent = () => {
    const matched = progress.find(
      (student) => normalizeStudentName(student.name) === normalizeStudentName(name) &&
        normalizeStudentName(student.className ?? '') === normalizeStudentName(className),
    );
    const studentName = matched?.name ?? name.trim().replace(/\s+/g, ' ');
    setLoadedName(studentName);
    setCompletedStages(matched?.completedStages ?? []);
  };

  const updateStage = (index: number, checked: boolean) => {
    const nextStages = checked
      ? [...completedStages, index].sort((a, b) => a - b)
      : completedStages.filter((stage) => stage !== index);
    const updated: StudentProgress = { name: loadedName, className, completedStages: nextStages, updatedAt: currentTimestamp() };
    const nextRoster = [
      ...progress.filter((student) =>
        normalizeStudentName(student.name) !== normalizeStudentName(loadedName) ||
        normalizeStudentName(student.className ?? '') !== normalizeStudentName(className),
      ),
      updated,
    ];
    if (onSave(CLASSROOM_STORAGE_KEYS.progress, nextRoster)) {
      setCompletedStages(nextStages);
      setSaveMessage('Progres tersimpan.');
      void saveStudentProgress(updated);
      setSyncMessage('Progres praktikum tercatat di akun guru.');
    } else {
      setSaveMessage('Progres belum berhasil disimpan.');
    }
  };

  return (
    <section className={`${panelClass} mx-auto max-w-2xl`}>
      <p className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">Laporan praktikum</p>
      <h2 className="mt-2 text-2xl font-extrabold text-[#172033]">Tandai tahap yang sudah selesai</h2>
      {!loadedName ? (
        <div className="mt-5 space-y-4">
          <p className="rounded-xl bg-[#FFF8F0] px-4 py-3 text-sm text-[#475569]">Nama: <strong className="text-[#172033]">{name}</strong></p>
          <button type="button" className={buttonClass} onClick={loadStudent}>Lanjutkan progres</button>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#475569]">Hai, {loadedName}. Centang atau buka centang kapan saja.</p>
          <p className="mt-5 text-lg font-bold text-[#172033]">{completedStages.length} dari {PROGRESS_STAGES.length} tahap selesai</p>
          <div className="mt-3 space-y-2">
            {PROGRESS_STAGES.map((stage, index) => {
              const checked = completedStages.includes(index);
              return (
                <label key={stage} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${checked ? 'border-green-200 bg-green-50' : 'border-[#F1E5D8]'}`}>
                  <input type="checkbox" checked={checked} onChange={(event) => updateStage(index, event.target.checked)} className="h-5 w-5 accent-[#15803D]" />
                  <span className={`flex-1 text-sm font-semibold ${checked ? 'text-green-900' : 'text-[#172033]'}`}>{stage}</span>
                  {checked && <Check className="h-4 w-4 text-green-700" aria-hidden="true" />}
                </label>
              );
            })}
          </div>
          <p aria-live="polite" className="mt-3 min-h-5 text-xs text-[#64748B]">{saveMessage}</p>
          <p aria-live="polite" className="text-xs text-[#64748B]">{syncMessage}</p>
          <button type="button" onClick={() => { setLoadedName(''); setSaveMessage(''); }} className="mt-2 text-sm font-semibold text-[#C2410C] underline">Kembali</button>
        </>
      )}
    </section>
  );
}

function TeacherDashboard({
  activeTab,
  onTabChange,
  onRefresh,
  onSave,
  attempts,
  pollSession,
  attendanceRecords,
  progress,
  activities,
}: {
  activeTab: ActivityTab;
  onTabChange: (tab: ActivityTab) => void;
  onRefresh: () => void;
  onSave: (key: string, value: unknown) => boolean;
  attempts: QuizAttempt[];
  pollSession: PollSession;
  attendanceRecords: AttendanceRecord[];
  progress: StudentProgress[];
  activities: StudentActivity[];
  refreshVersion?: number;
}) {
  const [pollResetMessage, setPollResetMessage] = useState('');
  const [firebaseActivities, setFirebaseActivities] = useState<StudentActivity[]>([]);
  const [firebaseQuizzes, setFirebaseQuizzes] = useState<TrackedQuizResult[]>([]);
  const [firebaseAttendance, setFirebaseAttendance] = useState<AttendanceRecord[]>([]);
  const [firebaseProgress, setFirebaseProgress] = useState<StudentProgress[]>([]);
  const [firebasePolls, setFirebasePolls] = useState<PollResponse[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ambil data awal dan subscribe ke perubahan realtime Firestore
  useEffect(() => {
    // 1. Direct fetch pertama kali agar data langsung muncul seketika
    void getQuizAttempts().then((items) => {
      if (items.length > 0) {
        setFirebaseQuizzes(items);
      }
    });

    // 2. Realtime listeners
    const unsubActivities = subscribeStudentActivities((items) => setFirebaseActivities(items));
    const unsubQuizzes = subscribeQuizAttempts((items) => setFirebaseQuizzes(items));
    const unsubAttendance = subscribeAllAttendance((items) => setFirebaseAttendance(items));
    const unsubProgress = subscribeStudentProgress((items) => setFirebaseProgress(items));
    const unsubPolls = subscribePollResponses(pollSession.id, (items) => setFirebasePolls(items));

    return () => {
      unsubActivities();
      unsubQuizzes();
      unsubAttendance();
      unsubProgress();
      unsubPolls();
    };
  }, [pollSession.id]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    void getQuizAttempts().then((items) => {
      if (items.length > 0) {
        setFirebaseQuizzes(items);
      }
      setTimeout(() => setIsRefreshing(false), 500);
    });
  };

  const latestActivities = mergeActivities(activities, firebaseActivities);
  const allQuizResults = mergeQuizResults(attempts, firebaseQuizzes);
  const allAttendance = mergeAttendanceRecords(attendanceRecords, firebaseAttendance);
  const allProgress = mergeStudentProgress(progress, firebaseProgress);

  const allPollResponses = [
    ...pollSession.responses,
    ...firebasePolls.filter((fp) => !pollSession.responses.some((p) => p.id === fp.id)),
  ];
  const answerCounts = POLL_OPTIONS.map((_, optionIndex) =>
    allPollResponses.filter((response) => response.optionIndex === optionIndex).length,
  );
  const totalResponses = allPollResponses.length;

  const newestAttendanceDay = allAttendance.reduce(
    (latest, record) => (record.date > latest ? record.date : latest),
    '',
  );
  const latestDayCount = allAttendance.filter((record) => record.date === newestAttendanceDay).length;

  const startNewPoll = () => {
    const newSession: PollSession = { id: crypto.randomUUID(), responses: [] };
    if (onSave(CLASSROOM_STORAGE_KEYS.poll, newSession)) {
      setPollResetMessage('Sesi baru dimulai; jawaban sesi sebelumnya telah dihapus dari browser ini.');
    }
  };

  // Statistik Kuis Siswa
  const uniqueStudents = new Set(allQuizResults.map((r) => normalizeStudentName(r.name)));
  const averagePercent = allQuizResults.length
    ? Math.round(allQuizResults.reduce((acc, curr) => acc + (curr.percent ?? 0), 0) / allQuizResults.length)
    : 0;
  const highestPercent = allQuizResults.length
    ? Math.max(...allQuizResults.map((r) => r.percent ?? 0))
    : 0;

  return (
    <section className="space-y-5">
      <div className={`${panelClass} flex flex-wrap items-center justify-between gap-4`}>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">Dashboard Guru ATOMIKA</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Tersambung Langsung
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-extrabold text-[#172033]">Rekap Kelas Real-Time</h2>
          <p className="mt-1 text-sm text-[#64748B]">Hasil kuis dan progres murid masuk langsung ke akun guru tanpa spreadsheet.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#F1E5D8] bg-white px-3 text-sm font-semibold hover:bg-orange-50 transition-colors"
          >
            <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-[#C2410C]' : ''}`} aria-hidden="true" />
            {isRefreshing ? 'Menyegarkan...' : 'Segarkan Data'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TEACHER_TABS.map(({ id, title }) => (
          <button
            type="button"
            key={id}
            onClick={() => onTabChange(id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all ${
              activeTab === id
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'border border-[#F1E5D8] bg-white text-[#475569] hover:bg-orange-50/70'
            }`}
          >
            {title}
          </button>
        ))}
      </div>

      {activeTab === 'quiz' && (
        <div className={panelClass}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#172033]">Rekap Hasil Kuis Siswa</h3>
                <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-[#9A3412]">
                  {allQuizResults.length} pengerjaan
                </span>
              </div>
              <p className="mt-1 text-sm text-[#64748B]">
                Seluruh pengerjaan kuis siswa tercatat otomatis di akun guru secara langsung.
              </p>
            </div>
            <button
              type="button"
              onClick={handleManualRefresh}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[#F1E5D8] bg-white px-3 text-xs font-bold text-[#172033] hover:bg-orange-50"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-[#C2410C]' : ''}`} aria-hidden="true" />
              Segarkan Nilai
            </button>
          </div>

          {/* Kartu Ringkasan Statistik Nilai */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-orange-100 bg-[#FFF8F0] p-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">Total Pengerjaan</span>
              <span className="mt-1 block text-2xl font-black text-[#172033]">{allQuizResults.length}</span>
            </div>
            <div className="rounded-2xl border border-orange-100 bg-[#FFF8F0] p-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">Siswa Berpartisipasi</span>
              <span className="mt-1 block text-2xl font-black text-[#C2410C]">{uniqueStudents.size}</span>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-emerald-800">Rata-rata Nilai</span>
              <span className="mt-1 block text-2xl font-black text-emerald-700">{averagePercent}%</span>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-blue-800">Nilai Tertinggi</span>
              <span className="mt-1 block text-2xl font-black text-blue-900">{highestPercent}%</span>
            </div>
          </div>

          {allQuizResults.length ? (
            <div className="overflow-x-auto rounded-2xl border border-[#F1E5D8]">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-[#F1E5D8] bg-[#FFF8F0] text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  <tr>
                    <th className="px-4 py-3.5">Nama Siswa</th>
                    <th className="px-4 py-3.5">Kelas</th>
                    <th className="px-4 py-3.5">Kuis / Materi</th>
                    <th className="px-4 py-3.5 text-center">Skor</th>
                    <th className="px-4 py-3.5 text-center">Nilai Akhir</th>
                    <th className="px-4 py-3.5 text-right">Tanggal & Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1E5D8]/70 bg-white">
                  {allQuizResults.map((attempt) => {
                    const isPassing = (attempt.percent ?? 0) >= 75;
                    return (
                      <tr key={attempt.id} className="hover:bg-orange-50/40 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-[#172033]">{attempt.name}</td>
                        <td className="px-4 py-3.5 text-[#475569]">{attempt.className || '—'}</td>
                        <td className="px-4 py-3.5">
                          <span className="inline-block rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-[#C2410C]">
                            {attempt.quizTitle}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center font-bold text-[#172033]">
                          {attempt.score} <span className="text-xs font-normal text-[#64748B]">/ {attempt.maxScore}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${
                              isPassing
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {attempt.percent}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs text-[#64748B]">
                          {formatDateTime(attempt.submittedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState text="Belum ada hasil kuis yang dikerjakan oleh siswa. Siswa dapat mengerjakan Kuis Struktur Atom di Kegiatan Kelas atau Kuis Topik Materi." />
          )}

          {allQuizResults.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => downloadQuizSpreadsheet(allQuizResults)}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#F1E5D8] px-3.5 text-xs font-semibold text-[#475569] hover:bg-orange-50 transition-colors"
              >
                Unduh Rekap CSV
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'poll' && (
        <div className={panelClass}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h3 className="text-lg font-bold text-[#172033]">Cek Pemahaman Live</h3><p className="mt-1 max-w-2xl text-sm text-[#475569]">{POLL_PROMPT}</p></div>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[#9A3412]">{totalResponses} jawaban</span>
          </div>
          <div className="mt-6 space-y-5">
            {POLL_OPTIONS.map((option, index) => {
              const percentage = totalResponses ? Math.round((answerCounts[index] / totalResponses) * 100) : 0;
              return (
                <div key={option}>
                  <div className="mb-1.5 flex justify-between gap-4 text-sm"><span className="font-medium text-[#172033]">{option}</span><span className="shrink-0 font-bold text-[#475569]">{answerCounts[index]} · {percentage}%</span></div>
                  <div className="h-3 overflow-hidden rounded-full bg-orange-100"><div className="h-full rounded-full bg-[#F97316] transition-all" style={{ width: `${percentage}%` }} /></div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#F1E5D8] pt-5">
            <button type="button" className={buttonClass} onClick={onRefresh}><RotateCw className="h-4 w-4" aria-hidden="true" />Segarkan</button>
            <button type="button" className="min-h-11 rounded-xl border border-[#F1E5D8] px-4 text-sm font-bold text-[#475569] hover:bg-orange-50" onClick={startNewPoll}>Mulai Sesi Baru</button>
            {pollResetMessage && <span role="status" className="text-xs text-green-800">{pollResetMessage}</span>}
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className={panelClass}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><h3 className="text-lg font-bold text-[#172033]">Rekap presensi</h3><p className="mt-1 text-sm text-[#64748B]">Jumlah hadir pada tanggal terbaru</p></div>
            <p className="rounded-xl bg-green-50 px-4 py-2 text-sm font-bold text-green-900">{latestDayCount} siswa {newestAttendanceDay && `· ${formatDate(newestAttendanceDay)}`}</p>
          </div>
          {allAttendance.length ? (
            <div className="mt-5 space-y-5">
              {Array.from(new Set(allAttendance.map((record) => record.date))).sort((a, b) => b.localeCompare(a)).map((date) => (
                <div key={date}>
                  <h4 className="mb-2 border-b border-[#F1E5D8] pb-2 text-sm font-bold text-[#172033]">{formatDate(date)}</h4>
                  <ul className="divide-y divide-[#F1E5D8]/70">{allAttendance.filter((record) => record.date === date).map((record) => <li key={`${record.date}-${normalizeStudentName(record.name)}`} className="flex justify-between gap-4 py-2.5 text-sm"><span className="font-medium">{record.name}</span><time className="text-[#64748B]">{formatTime(record.checkedInAt)}</time></li>)}</ul>
                </div>
              ))}
            </div>
          ) : <EmptyState text="Belum ada presensi." />}
        </div>
      )}

      {activeTab === 'progress' && (
        <div className={panelClass}>
          <div className="mb-5"><h3 className="text-lg font-bold text-[#172033]">Progres laporan praktikum</h3><p className="text-sm text-[#64748B]">Diurutkan dari tahap paling sedikit selesai</p></div>
          {allProgress.length ? (
            <div className="space-y-3">
              {allProgress.map((student) => (
                <article key={`${normalizeStudentName(student.name)}|${normalizeStudentName(student.className ?? '')}`} className="rounded-2xl border border-[#F1E5D8] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-bold text-[#172033]">{student.name}{student.className && <span className="ml-2 text-xs font-medium text-[#64748B]">{student.className}</span>}</h4>
                    <span className="text-xs font-bold text-[#9A3412]">{student.completedStages.length} dari {PROGRESS_STAGES.length} tahap</span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {PROGRESS_STAGES.map((stage, index) => {
                      const complete = student.completedStages.includes(index);
                      return <span key={stage} className={`inline-flex items-center gap-2 text-xs ${complete ? 'font-semibold text-green-800' : 'text-[#64748B]'}`}><span className={`flex h-4 w-4 items-center justify-center rounded-full ${complete ? 'bg-green-100' : 'bg-slate-100'}`}>{complete && <Check className="h-3 w-3" aria-hidden="true" />}</span>{stage}</span>;
                    })}
                  </div>
                  <p className="mt-3 text-xs text-[#64748B]">Terakhir diperbarui {formatDateTime(student.updatedAt)}</p>
                </article>
              ))}
            </div>
          ) : <EmptyState text="Belum ada siswa yang mengisi progres." />}
        </div>
      )}
      {activeTab === 'activity' && (
        <div className={panelClass}>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-[#172033]">Aktivitas terakhir setiap siswa</h3>
              <p className="text-sm text-[#64748B]">Menunjukkan topik, laboratorium, atau aktivitas terakhir yang dibuka.</p>
            </div>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[#9A3412]">{latestActivities.length} siswa</span>
          </div>
          {latestActivities.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-[#F1E5D8] text-xs uppercase text-[#64748B]">
                  <tr><th className="px-3 py-3">Nama</th><th className="px-3 py-3">Kelas</th><th className="px-3 py-3">Terakhir di</th><th className="px-3 py-3">Progres materi</th><th className="px-3 py-3">Terakhir aktif</th></tr>
                </thead>
                <tbody>{latestActivities.map((student) => (
                  <tr key={`${normalizeStudentName(student.name)}|${normalizeStudentName(student.className)}`} className="border-b border-[#F1E5D8]/70 align-top">
                    <td className="px-3 py-3 font-semibold">{student.name}</td>
                    <td className="px-3 py-3">{student.className}</td>
                    <td className="px-3 py-3">{student.activity}</td>
                    <td className="px-3 py-3">{student.progressSummary}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{formatDateTime(student.lastSeen)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <EmptyState text="Belum ada aktivitas siswa. Data akan muncul setelah siswa masuk dan membuka materi atau modul." />}
        </div>
      )}
      {activeTab === 'settings' && (
        <div className={panelClass}>
          <TeacherPasswordSettings />
        </div>
      )}
    </section>
  );
}

function TeacherPasswordSettings() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');

    if (newPassword.length < 6) {
      setErr('Sandi baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErr('Konfirmasi sandi tidak sesuai.');
      return;
    }

    setLoading(true);
    try {
      await updateTeacherPassword(newPassword);
      setMsg('Sandi khusus guru berhasil diperbarui di database! Sandi baru telah aktif.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setErr(error?.message || 'Gagal memperbarui sandi guru.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h3 className="text-lg font-bold text-[#172033]">Pengaturan Sandi Khusus Guru</h3>
        <p className="text-sm text-[#64748B]">
          Perbarui sandi akses guru. Sandi disimpan secara aman dalam bentuk hash salted SHA-256 di database Firestore.
        </p>
      </div>

      {msg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
          {msg}
        </div>
      )}
      {err && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">
          {err}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-4">
        <label className="block space-y-1.5 text-xs font-bold text-[#475569]">
          <span>Sandi Baru Guru</span>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Masukkan sandi baru minimal 6 karakter"
              required
              className="min-h-11 w-full rounded-xl border border-[#E8D8C8] bg-white px-3 pr-10 text-sm text-[#172033] outline-none focus:border-[#C2410C]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#172033]"
              title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <label className="block space-y-1.5 text-xs font-bold text-[#475569]">
          <span>Konfirmasi Sandi Baru</span>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ketik ulang sandi baru"
            required
            className="min-h-11 w-full rounded-xl border border-[#E8D8C8] bg-white px-3 text-sm text-[#172033] outline-none focus:border-[#C2410C]"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#C2410C] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#9A3412] disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : 'Perbarui Sandi Guru'}
        </button>
      </form>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-xl bg-[#FFF8F0] px-4 py-8 text-center text-sm text-[#64748B]">{text}</p>;
}
