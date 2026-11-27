import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Clock3, HelpCircle,
  RotateCcw, Send, UserRound, X,
} from 'lucide-react';
import { TOPICS } from '../data/topics';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { useAccess, DEFAULT_INSTITUTION_ID } from '../lib/access-context';
import { saveProgressForKey, getProgressForKey, useProgress } from '../lib/progress';
import { readJsonStorage, writeJsonStorage } from '../lib/safe-storage';
import { calculateQuizScore, createAttemptId, type QuizAttemptRecord } from '../lib/quiz-attempt';
import { saveTopicQuizAttempt } from '../panel-guru/quizAttempts';
import type { Topic, TopicId } from '../types';

interface SavedQuizSession {
  attempt: QuizAttemptRecord;
  currentIndex: number;
  phase: 'intro' | 'question' | 'result';
}

function quizStorageKey(storageKey: string, topicId: TopicId) {
  return `${storageKey}:quiz-${topicId}-v1`;
}

function historyStorageKey(storageKey: string, topicId: TopicId) {
  return `${storageKey}:quiz-${topicId}-history-v1`;
}

function readHistory(storageKey: string, topicId: TopicId): QuizAttemptRecord[] {
  const result = readJsonStorage<QuizAttemptRecord[]>(historyStorageKey(storageKey, topicId), []);
  return Array.isArray(result.value) ? result.value : [];
}

function readSession(storageKey: string, topicId: TopicId): SavedQuizSession | null {
  const result = readJsonStorage<SavedQuizSession | null>(quizStorageKey(storageKey, topicId), null);
  return result.value;
}

function writeSession(storageKey: string, topicId: TopicId, session: SavedQuizSession | null) {
  return session
    ? writeJsonStorage(quizStorageKey(storageKey, topicId), session)
    : true;
}

export function QuizSessionPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const topic = TOPICS.find((item) => item.id === topicId);
  const { storageKey } = useProgress();

  if (!topic) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-[#B91C1C]">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-[#172033]">Paket Kuis Tidak Ditemukan</h1>
        <p className="mt-2 text-sm text-[#475569]">Paket kuis "{topicId}" tidak tersedia.</p>
        <Link to="/kuis" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#C2410C] px-5 py-2.5 text-sm font-semibold text-white">
          <ArrowLeft className="h-4 w-4" /> Daftar Kuis
        </Link>
      </div>
    );
  }

  return <QuizSession key={`${storageKey}:${topic.id}`} topic={topic} storageKey={storageKey} />;
}

function QuizSession({ topic, storageKey }: { topic: Topic; storageKey: string }) {
  const { profile } = useAccess();
  const questions = QUIZ_QUESTIONS[topic.id];
  const [saved] = useState(() => readSession(storageKey, topic.id));
  const [session, setSession] = useState<SavedQuizSession>(
    saved?.attempt.status === 'submitted'
      ? saved
      : saved?.phase === 'question'
        ? saved
        : { attempt: createInitialAttempt(topic.id, profile), currentIndex: 0, phase: 'intro' }
  );
  const [history, setHistory] = useState(() => readHistory(storageKey, topic.id));
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'pending' | 'saved' | 'failed'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(session.attempt.elapsedSeconds);

  useEffect(() => {
    if (session.phase !== 'question') return;
    const timer = window.setInterval(() => {
      const elapsed = Math.max(0, Math.floor((Date.now() - Date.parse(session.attempt.startedAt)) / 1000));
      setElapsedSeconds(elapsed);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [session.phase, session.attempt.startedAt]);

  const persist = (next: SavedQuizSession) => {
    setSession(next);
    setStorageAvailable(writeSession(storageKey, topic.id, next));
  };

  const answeredCount = useMemo(
    () => questions.filter((question) => session.attempt.answers[question.id]).length,
    [questions, session.attempt.answers]
  );
  const result = calculateQuizScore(questions, session.attempt.answers);

  const startQuiz = () => {
    const attempt = createInitialAttempt(topic.id, profile);
    const next = { attempt, currentIndex: 0, phase: 'question' as const };
    setElapsedSeconds(0);
    persist(next);
  };

  const chooseAnswer = (questionId: string, optionId: string) => {
    if (session.phase !== 'question') return;
    persist({
      ...session,
      attempt: {
        ...session.attempt,
        answers: { ...session.attempt.answers, [questionId]: optionId },
      },
    });
  };

  const submitQuiz = () => {
    if (answeredCount !== questions.length || session.attempt.status === 'submitted') return;
    const elapsed = Math.max(0, Math.floor((Date.now() - Date.parse(session.attempt.startedAt)) / 1000));
    const score = calculateQuizScore(questions, session.attempt.answers);
    const submittedAt = new Date().toISOString();
    const completedAttempt: QuizAttemptRecord = {
      ...session.attempt,
      ...score,
      elapsedSeconds: elapsed,
      submittedAt,
      status: 'submitted',
    };
    const resultSession: SavedQuizSession = { ...session, attempt: completedAttempt, phase: 'result' };
    persist(resultSession);
    setConfirmSubmit(false);
    setElapsedSeconds(elapsed);

    const nextHistory = [completedAttempt, ...history].slice(0, 20);
    setHistory(nextHistory);
    writeJsonStorage(historyStorageKey(storageKey, topic.id), nextHistory);

    const progressData = getProgressForKey(storageKey);
    const previous = progressData.quizResults[topic.id];
    saveProgressForKey(storageKey, {
      ...progressData,
      quizResults: {
        ...progressData.quizResults,
        [topic.id]: {
          attempts: (previous?.attempts ?? 0) + 1,
          lastScore: score.percent,
          bestScore: Math.max(previous?.bestScore ?? 0, score.percent),
          lastCompletedAt: submittedAt,
        },
      },
    });

    if (profile?.role === 'student') {
      setSyncStatus('pending');
      void saveTopicQuizAttempt({
        attemptId: completedAttempt.id,
        moduleId: topic.id,
        activityName: `Kuis pemahaman materi · ${topic.title}`,
        answers: completedAttempt.answers,
        score: score.score,
        maxScore: score.maxScore,
        percent: score.percent,
        elapsedSeconds: elapsed,
        studentIdentity: completedAttempt.studentIdentity,
      }).then(() => setSyncStatus('saved')).catch((error: unknown) => {
        console.error('Gagal mengirim hasil kuis ke Firestore:', error);
        setSyncStatus('failed');
      });
    }
  };

  const restartQuiz = () => {
    setSyncStatus('idle');
    setConfirmSubmit(false);
    startQuiz();
  };

  if (session.phase === 'intro') {
    return (
      <div className="mx-auto max-w-3xl pb-16">
        <Link to="/kuis" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#C2410C] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Daftar Kuis
        </Link>
        <div className="mt-5 rounded-2xl border border-[#F1E5D8] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C2410C]">
            <HelpCircle className="h-4 w-4 text-[#F97316]" /> Paket {TOPICS.findIndex((item) => item.id === topic.id) + 1}
          </div>
          <h1 className="text-2xl font-bold text-[#172033] sm:text-3xl">{topic.title}</h1>
          <p className="mt-3 leading-7 text-[#475569]">{topic.description}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <InfoCard label="Jumlah soal" value="5 soal" />
            <InfoCard label="Bentuk soal" value="Pilihan A–E" />
            <InfoCard label="Nilai" value="0–100" />
          </div>
          <p className="mt-6 rounded-xl bg-[#FFF8F0] px-4 py-3 text-sm leading-6 text-[#475569]">
            Jawaban akan disimpan saat dipilih. Setelah semua soal dijawab, kamu perlu mengonfirmasi pengumpulan sebelum nilai dan pembahasan ditampilkan.
          </p>
          <button type="button" onClick={startQuiz} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#C2410C] px-5 py-3 font-semibold text-white hover:bg-[#9A3412] sm:w-auto">
            Mulai kuis <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <HistoryPanel history={history} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-16">
      <div className="flex items-center justify-between gap-3">
        <Link to="/kuis" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#C2410C] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Daftar Kuis
        </Link>
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <Clock3 className="h-4 w-4" /> {formatDuration(elapsedSeconds)}
        </div>
      </div>

      {session.phase === 'result' ? (
        <section aria-live="polite" className="rounded-2xl border border-green-200 bg-green-50 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-lg font-bold text-green-900"><CheckCircle2 className="h-6 w-6" /> Kuis selesai</p>
              <p className="mt-2 text-2xl font-extrabold text-green-950">{result.score} dari {result.maxScore} benar · Nilai {result.percent}%</p>
              <p className="mt-1 text-xs text-green-800">Waktu: {formatDuration(resultElapsed(elapsedSeconds))}</p>
            </div>
            <button type="button" onClick={restartQuiz} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9A3412]">
              <RotateCcw className="h-4 w-4" /> Ulangi kuis
            </button>
          </div>
          {profile?.role === 'student' && (
            <p role="status" className="mt-3 text-xs font-semibold text-green-900">
              {syncStatus === 'pending' && 'Mengirim hasil ke server...'}
              {syncStatus === 'saved' && 'Hasil berhasil diterima server.'}
              {syncStatus === 'failed' && 'Hasil tersimpan di perangkat ini; pengiriman ke server gagal.'}
            </p>
          )}
        </section>
      ) : (
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#64748B]">
            <span>Soal {session.currentIndex + 1} dari {questions.length}</span>
            <span>{answeredCount}/{questions.length} terjawab</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#F1E5D8]" aria-label={`${answeredCount} dari ${questions.length} soal terjawab`}>
            <div className="h-full bg-[#F97316] transition-all" style={{ width: `${((session.currentIndex + 1) / questions.length) * 100}%` }} />
          </div>
        </div>
      )}

      <div>
        <div className="space-y-4">
          {(session.phase === 'question'
            ? [questions[session.currentIndex]]
            : questions
          ).map((question, renderedIndex) => {
            const index = session.phase === 'question' ? session.currentIndex : renderedIndex;
            const selectedId = session.attempt.answers[question.id];
            const selectedOption = question.options.find((option) => option.id === selectedId);
            const correctOption = question.options.find((option) => option.id === question.correct);
            const isCorrect = selectedId === question.correct;
            return (
              <section key={question.id} className="rounded-2xl border border-[#F1E5D8] bg-white p-5 shadow-xs sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide text-[#C2410C]">Soal {index + 1}</span>
                  {session.phase === 'result' && <span className={`text-xs font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>{isCorrect ? 'Benar' : 'Salah'}</span>}
                </div>
                <h2 className="text-base font-bold leading-6 text-[#172033]">{question.prompt}</h2>
                <div role="radiogroup" aria-label={`Pilihan jawaban soal ${index + 1}`} className="mt-4 grid gap-2">
                  {question.options.map((option) => {
                    const selected = selectedId === option.id;
                    const correct = session.phase === 'result' && option.id === question.correct;
                    const incorrect = session.phase === 'result' && selected && !isCorrect;
                    const style = correct
                      ? 'border-green-500 bg-green-50 text-green-950'
                      : incorrect
                        ? 'border-red-300 bg-red-50 text-red-950'
                        : selected
                          ? 'border-[#C2410C] bg-[#FFF8F0]'
                          : 'border-[#F1E5D8] text-[#475569] hover:border-orange-300 hover:bg-orange-50';
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={session.phase === 'result'}
                        onClick={() => chooseAnswer(question.id, option.id)}
                        className={`flex min-h-12 items-start gap-3 rounded-lg border px-3 py-3 text-left text-sm leading-5 transition-colors disabled:cursor-default ${style}`}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold uppercase">{option.id}</span>
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
                {session.phase === 'result' && (
                  <div className={`mt-4 rounded-lg p-4 text-sm leading-6 ${isCorrect ? 'bg-green-50 text-green-950' : 'bg-red-50 text-red-950'}`}>
                    {isCorrect ? (
                      <p><strong>Tepat.</strong> {question.explanation}</p>
                    ) : (
                      <>
                        <p><strong>Mengapa salah:</strong> {question.wrongFeedback[selectedId] ?? 'Pilihan ini tidak sesuai konsep pada materi.'}</p>
                        <p className="mt-2"><strong>Jawaban benar ({correctOption?.id.toUpperCase()}):</strong> {correctOption?.label}</p>
                        <p className="mt-1">{question.explanation}</p>
                      </>
                    )}
                    <p className="mt-2 text-xs">Jawabanmu: {selectedOption ? `${selectedOption.id.toUpperCase()}. ${selectedOption.label}` : 'Belum dijawab'}</p>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {session.phase === 'question' && (
        <div className="flex flex-col-reverse gap-3 border-t border-[#F1E5D8] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" disabled={session.currentIndex === 0} onClick={() => persist({ ...session, currentIndex: session.currentIndex - 1 })} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#F1E5D8] bg-white px-4 py-2 text-sm font-semibold text-[#475569] disabled:cursor-not-allowed disabled:opacity-40">
            <ArrowLeft className="h-4 w-4" /> Sebelumnya
          </button>
          {session.currentIndex < questions.length - 1 ? (
            <button type="button" onClick={() => persist({ ...session, currentIndex: session.currentIndex + 1 })} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-5 py-2 text-sm font-semibold text-white hover:bg-[#9A3412]">
              Berikutnya <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" disabled={answeredCount !== questions.length} onClick={() => setConfirmSubmit(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-5 py-2 text-sm font-semibold text-white hover:bg-[#9A3412] disabled:cursor-not-allowed disabled:bg-slate-300">
              <Send className="h-4 w-4" /> Kumpulkan
            </button>
          )}
        </div>
      )}

      {session.phase === 'question' && answeredCount !== questions.length && (
        <p className="text-center text-xs text-[#64748B]">Lengkapi {questions.length - answeredCount} soal lagi sebelum mengumpulkan.</p>
      )}

      {session.phase === 'result' && <HistoryPanel history={history} />}

      {!storageAvailable && <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Penyimpanan browser tidak tersedia. Hasil hanya aktif selama halaman terbuka.</p>}

      {confirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="w-full max-w-md rounded-2xl border border-[#F1E5D8] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="confirm-title" className="text-lg font-bold text-[#172033]">Kumpulkan kuis?</h2>
                <p className="mt-2 text-sm leading-6 text-[#475569]">Semua {questions.length} soal sudah dijawab. Setelah dikumpulkan, jawaban tidak dapat diubah pada percobaan ini.</p>
              </div>
              <button type="button" aria-label="Tutup konfirmasi" onClick={() => setConfirmSubmit(false)} className="rounded-lg p-2 text-[#64748B] hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setConfirmSubmit(false)} className="min-h-11 flex-1 rounded-lg border border-[#F1E5D8] text-sm font-semibold text-[#475569]">Periksa lagi</button>
              <button type="button" onClick={submitQuiz} className="min-h-11 flex-1 rounded-lg bg-[#C2410C] text-sm font-semibold text-white hover:bg-[#9A3412]">Ya, kumpulkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function createInitialAttempt(topicId: TopicId, profile: ReturnType<typeof useAccess>['profile']): QuizAttemptRecord {
  return {
    id: createAttemptId(),
    topicId,
    studentIdentity: profile?.role === 'student'
      ? {
          uid: profile.uid,
          name: profile.name,
          className: profile.className,
          institutionId: profile.institutionId || DEFAULT_INSTITUTION_ID,
        }
      : profile?.role === 'teacher'
        ? { uid: profile.uid, name: profile.name, className: '', institutionId: profile.institutionId || DEFAULT_INSTITUTION_ID }
        : { uid: null, name: 'Siswa anonim', className: '', institutionId: DEFAULT_INSTITUTION_ID },
    answers: {},
    questionVersion: 'v1',
    score: 0,
    maxScore: 5,
    percent: 0,
    startedAt: new Date().toISOString(),
    submittedAt: null,
    elapsedSeconds: 0,
    status: 'in_progress',
  };
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

function resultElapsed(seconds: number) {
  return seconds;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#F1E5D8] bg-[#FFF8F0] p-4">
      <p className="text-xs text-[#64748B]">{label}</p>
      <p className="mt-1 font-bold text-[#172033]">{value}</p>
    </div>
  );
}

function HistoryPanel({ history }: { history: QuizAttemptRecord[] }) {
  if (history.length === 0) return null;
  return (
    <section className="mt-6 rounded-2xl border border-[#F1E5D8] bg-white p-5">
      <h2 className="flex items-center gap-2 font-bold text-[#172033]"><UserRound className="h-4 w-4 text-[#F97316]" /> Riwayat percobaan</h2>
      <div className="mt-3 space-y-2">
        {history.map((attempt, index) => (
          <div key={attempt.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#FFF8F0] px-3 py-2 text-sm">
            <span className="text-[#475569]">Percobaan {history.length - index} · {attempt.score}/{attempt.maxScore} benar · {formatDuration(attempt.elapsedSeconds)}</span>
            <strong className="text-[#C2410C]">{attempt.percent}%</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
