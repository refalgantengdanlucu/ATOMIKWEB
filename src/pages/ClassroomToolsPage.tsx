import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Activity,
  BarChart3,
  CalendarCheck,
  Check,
  CheckCircle2,
  ClipboardList,
  LockKeyhole,
  RotateCw,
  Users,
} from 'lucide-react';
import {
  CLASSROOM_STORAGE_KEYS,
  getLocalDateKey,
  normalizeStudentName,
  POLL_OPTIONS,
  POLL_PROMPT,
  PROGRESS_STAGES,
  REACTION_QUESTIONS,
  REACTION_TYPES,
  readClassroomData,
  TEACHER_NAMES,
  TEACHER_PIN,
  writeClassroomData,
} from '../lib/classroom';
import type { AttendanceRecord, PollSession, QuizAttempt, StudentProgress } from '../lib/classroom';

type ActivityTab = 'quiz' | 'poll' | 'attendance' | 'progress';

const TABS: { id: ActivityTab; title: string; description: string; icon: typeof Activity }[] = [
  { id: 'quiz', title: 'Kuis Reaksi', description: '10 soal klasifikasi reaksi', icon: ClipboardList },
  { id: 'poll', title: 'Cek Pemahaman Live', description: 'Polling cepat kelas', icon: BarChart3 },
  { id: 'attendance', title: 'Presensi', description: 'Check-in kehadiran', icon: CalendarCheck },
  { id: 'progress', title: 'Progres Tugas', description: 'Checklist laporan praktikum', icon: CheckCircle2 },
];

const panelClass = 'rounded-3xl border border-[#F1E5D8] bg-white p-5 shadow-sm sm:p-8';
const buttonClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#C2410C] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#9A3412] disabled:cursor-not-allowed disabled:opacity-50';
const inputClass = 'min-h-12 w-full rounded-xl border border-[#E8D8C8] bg-white px-4 text-base text-[#172033] outline-none focus:border-[#C2410C] focus:ring-2 focus:ring-orange-100';

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

function StudentNameInput({
  value,
  onChange,
  label = 'Nama siswa',
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <label className="block space-y-2 text-sm font-semibold text-[#172033]">
      {label}
      <input
        className={inputClass}
        autoComplete="name"
        maxLength={80}
        placeholder="Ketik nama lengkap"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function ClassroomToolsPage() {
  const [activeTab, setActiveTab] = useState<ActivityTab>('quiz');
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [teacherName, setTeacherName] = useState<string>(TEACHER_NAMES[0]);
  const [pin, setPin] = useState('');
  const [teacherUnlocked, setTeacherUnlocked] = useState(false);
  const [teacherError, setTeacherError] = useState('');
  const [storageError, setStorageError] = useState('');
  const [, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((current) => current + 1), []);

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

  const openTeacherGate = () => {
    setTeacherOpen(true);
    setTeacherUnlocked(false);
    setPin('');
    setTeacherError('');
  };

  const unlockTeacher = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pin !== TEACHER_PIN) {
      setTeacherError('PIN belum sesuai. Coba lagi.');
      return;
    }
    setTeacherError('');
    setTeacherUnlocked(true);
  };

  const dismissTeacher = () => {
    setTeacherUnlocked(false);
    setTeacherOpen(false);
    setPin('');
  };

  const quizAttempts = readClassroomData<QuizAttempt[]>(CLASSROOM_STORAGE_KEYS.quiz, []);
  const pollSession = readClassroomData<PollSession>(CLASSROOM_STORAGE_KEYS.poll, { id: 'poll-1', responses: [] });
  const attendanceRecords = readClassroomData<AttendanceRecord[]>(CLASSROOM_STORAGE_KEYS.attendance, []);
  const studentProgress = readClassroomData<StudentProgress[]>(CLASSROOM_STORAGE_KEYS.progress, []);

  const newestAttendanceDay = attendanceRecords.reduce(
    (latest, record) => (record.date > latest ? record.date : latest),
    '',
  );
  const latestDayCount = attendanceRecords.filter((record) => record.date === newestAttendanceDay).length;
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
            <Activity className="h-4 w-4" aria-hidden="true" />
            Kegiatan kelas kimia
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#172033] sm:text-4xl">Belajar bersama, pantau progres</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
            Kuis, cek pemahaman, presensi, dan pelacak tugas untuk kelas XI.
          </p>
        </div>
        {!teacherOpen && (
          <button type="button" onClick={openTeacherGate} className="self-start rounded-lg px-3 py-2 text-xs font-semibold text-[#64748B] underline decoration-dotted underline-offset-4 hover:text-[#172033] sm:self-auto">
            Akses Guru
          </button>
        )}
      </header>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950">
        Data disimpan di browser/perangkat ini. Agar hasil terkumpul dari perangkat siswa yang berbeda dan terlihat bersama secara live, aplikasi perlu dihubungkan ke backend bersama. PIN di sisi klien hanya penghalang kasual; bukan pengamanan data yang kuat.
      </div>

      {storageError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{storageError}</p>}

      {teacherOpen ? (
        teacherUnlocked ? (
          <TeacherDashboard
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onClose={dismissTeacher}
            onRefresh={refresh}
            onSave={save}
            attempts={quizAttempts}
            pollSession={pollSession}
            attendanceRecords={groupedAttendance}
            newestAttendanceDay={newestAttendanceDay}
            latestDayCount={latestDayCount}
            progress={orderedProgress}
          />
        ) : (
          <form onSubmit={unlockTeacher} className={`${panelClass} mx-auto max-w-md`}>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[#C2410C]">
              <LockKeyhole className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-[#172033]">Masuk dashboard guru</h2>
            <p className="mt-1 text-sm text-[#64748B]">Pilih nama guru dan masukkan PIN.</p>
            <label className="mt-5 block space-y-2 text-sm font-semibold text-[#172033]">
              Nama guru
              <select value={teacherName} onChange={(event) => setTeacherName(event.target.value)} className={inputClass}>
                {TEACHER_NAMES.map((name) => <option key={name}>{name}</option>)}
              </select>
            </label>
            <label className="mt-4 block space-y-2 text-sm font-semibold text-[#172033]">
              PIN
              <input className={inputClass} inputMode="numeric" autoComplete="one-time-code" type="password" maxLength={12} value={pin} onChange={(event) => setPin(event.target.value)} />
            </label>
            <p className="mt-2 text-xs text-[#64748B]">Contoh format PIN: 0000000</p>
            {teacherError && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{teacherError}</p>}
            <div className="mt-6 flex gap-3">
              <button type="submit" className={buttonClass}>Buka dashboard</button>
              <button type="button" onClick={dismissTeacher} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-[#475569] hover:bg-orange-50">Batal</button>
            </div>
            <p className="mt-5 border-t border-[#F1E5D8] pt-4 text-xs leading-5 text-[#64748B]">
              PIN disimpan di kode aplikasi dan dapat dilihat oleh pengguna teknis. Ini hanya penghalang kasual, bukan keamanan tingkat tinggi.
            </p>
          </form>
        )
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

          {activeTab === 'quiz' && <ReactionQuiz onSave={save} attempts={quizAttempts} />}
          {activeTab === 'poll' && <StudentPoll key={pollSession.id} onSave={save} pollSession={pollSession} />}
          {activeTab === 'attendance' && <StudentAttendance onSave={save} records={attendanceRecords} />}
          {activeTab === 'progress' && <StudentTaskProgress onSave={save} progress={studentProgress} />}
        </>
      )}
    </div>
  );
}

function ReactionQuiz({ onSave, attempts }: { onSave: (key: string, value: unknown) => boolean; attempts: QuizAttempt[] }) {
  const [name, setName] = useState('');
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [savedScore, setSavedScore] = useState<number | null>(null);
  const question = REACTION_QUESTIONS[questionIndex];

  const finishQuiz = (nextAnswers: boolean[]) => {
    const score = nextAnswers.filter(Boolean).length;
    const attempt: QuizAttempt = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim().replace(/\s+/g, ' '),
      score,
      submittedAt: new Date().toISOString(),
    };
    if (onSave(CLASSROOM_STORAGE_KEYS.quiz, [...attempts, attempt])) {
      setSavedScore(score);
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <section className={`${panelClass} mx-auto max-w-2xl text-center`}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700"><CheckCircle2 className="h-7 w-7" aria-hidden="true" /></div>
        <p className="text-sm font-semibold text-[#64748B]">Kuis selesai, {name.trim()}!</p>
        <h2 className="mt-1 text-4xl font-black text-[#172033]">{savedScore ?? 0}<span className="text-xl text-[#64748B]"> / 10</span></h2>
        <p className="mt-2 text-sm text-[#475569]">Ini adalah hasil kuismu. Hanya kamu yang melihat skor di halaman ini.</p>
        <button type="button" className={`${buttonClass} mt-6`} onClick={() => { setName(''); setQuestionIndex(-1); setSelected(null); setAnswers([]); setFinished(false); setSavedScore(null); }}>Selesai</button>
      </section>
    );
  }

  if (questionIndex === -1) {
    return (
      <section className={`${panelClass} mx-auto max-w-2xl`}>
        <p className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">Kuis klasifikasi reaksi · 10 soal</p>
        <h2 className="mt-2 text-2xl font-extrabold text-[#172033]">Kenali pola reaksinya</h2>
        <p className="mt-2 text-sm leading-6 text-[#475569]">Pilih jenis reaksi yang paling sesuai. Setiap jawaban mendapat umpan balik langsung.</p>
        <div className="mt-6 space-y-4">
          <StudentNameInput value={name} onChange={setName} />
          <button type="button" className={buttonClass} disabled={!name.trim()} onClick={() => setQuestionIndex(0)}>Mulai kuis</button>
        </div>
      </section>
    );
  }

  const isCorrect = selected === question.correct;
  return (
    <section className={`${panelClass} mx-auto max-w-2xl`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">Soal {questionIndex + 1} dari 10</p>
        <span className="text-xs font-semibold text-[#64748B]">{answers.filter(Boolean).length} benar sejauh ini</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-orange-100"><div className="h-full rounded-full bg-[#F97316] transition-all" style={{ width: `${((questionIndex + 1) / REACTION_QUESTIONS.length) * 100}%` }} /></div>
      <h2 className="mt-7 text-lg font-bold text-[#172033]">Klasifikasikan persamaan reaksi berikut:</h2>
      <p className="my-5 rounded-2xl bg-[#FFF8F0] px-4 py-6 text-center font-mono text-lg font-bold text-[#172033] sm:text-2xl">{question.equation}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {REACTION_TYPES.map((type) => (
          <button type="button" key={type} disabled={selected !== null} onClick={() => { setSelected(type); setAnswers((current) => [...current, type === question.correct]); }} className={`min-h-12 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${selected === type ? (type === question.correct ? 'border-green-500 bg-green-50 text-green-800' : 'border-red-300 bg-red-50 text-red-800') : selected && type === question.correct ? 'border-green-500 bg-green-50 text-green-800' : 'border-[#F1E5D8] hover:border-orange-300 hover:bg-orange-50'}`}>
            {type}
          </button>
        ))}
      </div>
      {selected && (
        <div role="status" className={`mt-4 rounded-xl p-4 text-sm leading-6 ${isCorrect ? 'bg-green-50 text-green-900' : 'bg-amber-50 text-amber-950'}`}>
          <strong>{isCorrect ? 'Tepat!' : `Belum tepat. Jawabannya: ${question.correct}.`}</strong> {question.explanation}
          <button type="button" className={`${buttonClass} mt-4`} onClick={() => {
            if (questionIndex === REACTION_QUESTIONS.length - 1) {
              finishQuiz(answers);
            } else {
              setQuestionIndex((current) => current + 1);
              setSelected(null);
            }
          }}>{questionIndex === REACTION_QUESTIONS.length - 1 ? 'Lihat skor saya' : 'Soal berikutnya'}</button>
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

function StudentAttendance({ onSave, records }: { onSave: (key: string, value: unknown) => boolean; records: AttendanceRecord[] }) {
  const [name, setName] = useState('');
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
          <button type="button" className="mt-4 text-sm font-semibold underline" onClick={() => { setName(''); setConfirmation(null); }}>Selesai</button>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <StudentNameInput value={name} onChange={setName} />
          <button type="button" disabled={!name.trim()} className={`${buttonClass} min-h-14 w-full text-base`} onClick={checkIn}>Absen Sekarang</button>
        </div>
      )}
    </section>
  );
}

function StudentTaskProgress({ onSave, progress }: { onSave: (key: string, value: unknown) => boolean; progress: StudentProgress[] }) {
  const [name, setName] = useState('');
  const [loadedName, setLoadedName] = useState('');
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [saveMessage, setSaveMessage] = useState('');

  const loadStudent = () => {
    const matched = progress.find((student) => normalizeStudentName(student.name) === normalizeStudentName(name));
    const studentName = matched?.name ?? name.trim().replace(/\s+/g, ' ');
    setLoadedName(studentName);
    setCompletedStages(matched?.completedStages ?? []);
  };

  const updateStage = (index: number, checked: boolean) => {
    const nextStages = checked
      ? [...completedStages, index].sort((a, b) => a - b)
      : completedStages.filter((stage) => stage !== index);
    const updated: StudentProgress = { name: loadedName, completedStages: nextStages, updatedAt: currentTimestamp() };
    const nextRoster = [
      ...progress.filter((student) => normalizeStudentName(student.name) !== normalizeStudentName(loadedName)),
      updated,
    ];
    if (onSave(CLASSROOM_STORAGE_KEYS.progress, nextRoster)) {
      setCompletedStages(nextStages);
      setSaveMessage('Progres tersimpan.');
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
          <StudentNameInput value={name} onChange={setName} />
          <button type="button" disabled={!name.trim()} className={buttonClass} onClick={loadStudent}>Lanjutkan progres</button>
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
          <button type="button" onClick={() => { setLoadedName(''); setName(''); setSaveMessage(''); }} className="mt-2 text-sm font-semibold text-[#C2410C] underline">Ganti nama siswa</button>
        </>
      )}
    </section>
  );
}

function TeacherDashboard({
  activeTab,
  onTabChange,
  onClose,
  onRefresh,
  onSave,
  attempts,
  pollSession,
  attendanceRecords,
  newestAttendanceDay,
  latestDayCount,
  progress,
}: {
  activeTab: ActivityTab;
  onTabChange: (tab: ActivityTab) => void;
  onClose: () => void;
  onRefresh: () => void;
  onSave: (key: string, value: unknown) => boolean;
  attempts: QuizAttempt[];
  pollSession: PollSession;
  attendanceRecords: AttendanceRecord[];
  newestAttendanceDay: string;
  latestDayCount: number;
  progress: StudentProgress[];
}) {
  const [pollResetMessage, setPollResetMessage] = useState('');
  const sortedAttempts = [...attempts].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const answerCounts = POLL_OPTIONS.map((_, optionIndex) =>
    pollSession.responses.filter((response) => response.optionIndex === optionIndex).length,
  );
  const totalResponses = pollSession.responses.length;

  const startNewPoll = () => {
    const newSession: PollSession = { id: crypto.randomUUID(), responses: [] };
    if (onSave(CLASSROOM_STORAGE_KEYS.poll, newSession)) {
      setPollResetMessage('Sesi baru dimulai; jawaban sesi sebelumnya telah dihapus dari browser ini.');
    }
  };

  return (
    <section className="space-y-5">
      <div className={`${panelClass} flex flex-wrap items-center justify-between gap-4`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">Dashboard guru</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[#172033]">Rekap kelas</h2>
          <p className="mt-1 text-sm text-[#64748B]">Data siswa tidak ditampilkan pada halaman siswa.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onRefresh} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#F1E5D8] px-3 text-sm font-semibold hover:bg-orange-50"><RotateCw className="h-4 w-4" aria-hidden="true" />Segarkan</button>
          <button type="button" onClick={onClose} className="min-h-10 rounded-xl px-3 text-sm font-semibold text-[#64748B] hover:bg-orange-50">Keluar guru</button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(({ id, title }) => (
          <button type="button" key={id} onClick={() => onTabChange(id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${activeTab === id ? 'bg-[#C2410C] text-white' : 'border border-[#F1E5D8] bg-white text-[#475569]'}`}>{title}</button>
        ))}
      </div>

      {activeTab === 'quiz' && (
        <div className={panelClass}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div><h3 className="text-lg font-bold text-[#172033]">Hasil kuis klasifikasi reaksi</h3><p className="text-sm text-[#64748B]">{attempts.length} pengerjaan tersimpan · terbaru dahulu</p></div>
            <Users className="h-5 w-5 text-[#F97316]" aria-hidden="true" />
          </div>
          {sortedAttempts.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-left text-sm">
                <thead className="border-b border-[#F1E5D8] text-xs uppercase text-[#64748B]"><tr><th className="px-3 py-3">Nama</th><th className="px-3 py-3">Skor</th><th className="px-3 py-3">Waktu</th><th className="px-3 py-3">Tanggal & waktu</th></tr></thead>
                <tbody>{sortedAttempts.map((attempt) => <tr key={attempt.id} className="border-b border-[#F1E5D8]/70"><td className="px-3 py-3 font-semibold">{attempt.name}</td><td className="px-3 py-3">{attempt.score}/10</td><td className="px-3 py-3">{formatTime(attempt.submittedAt)}</td><td className="px-3 py-3">{formatDateTime(attempt.submittedAt)}</td></tr>)}</tbody>
              </table>
            </div>
          ) : <EmptyState text="Belum ada hasil kuis." />}
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
          {attendanceRecords.length ? (
            <div className="mt-5 space-y-5">
              {Array.from(new Set(attendanceRecords.map((record) => record.date))).sort((a, b) => b.localeCompare(a)).map((date) => (
                <div key={date}>
                  <h4 className="mb-2 border-b border-[#F1E5D8] pb-2 text-sm font-bold text-[#172033]">{formatDate(date)}</h4>
                  <ul className="divide-y divide-[#F1E5D8]/70">{attendanceRecords.filter((record) => record.date === date).map((record) => <li key={`${record.date}-${normalizeStudentName(record.name)}`} className="flex justify-between gap-4 py-2.5 text-sm"><span className="font-medium">{record.name}</span><time className="text-[#64748B]">{formatTime(record.checkedInAt)}</time></li>)}</ul>
                </div>
              ))}
            </div>
          ) : <EmptyState text="Belum ada presensi." />}
        </div>
      )}

      {activeTab === 'progress' && (
        <div className={panelClass}>
          <div className="mb-5"><h3 className="text-lg font-bold text-[#172033]">Progres laporan praktikum</h3><p className="text-sm text-[#64748B]">Diurutkan dari tahap paling sedikit selesai</p></div>
          {progress.length ? (
            <div className="space-y-3">
              {progress.map((student) => (
                <article key={normalizeStudentName(student.name)} className="rounded-2xl border border-[#F1E5D8] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-bold text-[#172033]">{student.name}</h4>
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
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-xl bg-[#FFF8F0] px-4 py-8 text-center text-sm text-[#64748B]">{text}</p>;
}
