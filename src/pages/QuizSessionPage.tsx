import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TOPICS } from '../data/topics';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { useAccess } from '../lib/access-context';
import { isTopicCompleted, saveProgressForKey, getProgressForKey, useProgress } from '../lib/progress';
import { saveTopicQuizAttempt } from '../panel-guru/quizAttempts';
import type { Topic, TopicId } from '../types';
import { ArrowLeft, HelpCircle, AlertCircle, CheckCircle2, RotateCcw, Send, Lock, ArrowRight } from 'lucide-react';

interface SavedQuizSession {
  answers: Record<string, string>;
  submitted: boolean;
}

type SubmissionSyncStatus = 'idle' | 'pending' | 'saved' | 'failed';

function quizStorageKey(storageKey: string, topicId: TopicId) {
  return `${storageKey}:quiz-${topicId}-v1`;
}

function readQuizSession(storageKey: string, topicId: TopicId): SavedQuizSession {
  try {
    const raw = window.localStorage.getItem(quizStorageKey(storageKey, topicId));
    if (!raw) return { answers: {}, submitted: false };

    const saved = JSON.parse(raw) as Partial<SavedQuizSession>;
    return {
      answers: saved.answers && typeof saved.answers === 'object' ? saved.answers : {},
      submitted: saved.submitted === true,
    };
  } catch (error) {
    console.error('Gagal membaca jawaban kuis:', error);
    return { answers: {}, submitted: false };
  }
}

function writeQuizSession(storageKey: string, topicId: TopicId, session: SavedQuizSession): boolean {
  try {
    window.localStorage.setItem(quizStorageKey(storageKey, topicId), JSON.stringify(session));
    return true;
  } catch (error) {
    console.error('Gagal menyimpan jawaban kuis:', error);
    return false;
  }
}

export function QuizSessionPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const topic = TOPICS.find((t) => t.id === topicId);
  const { profile } = useAccess();
  const { progress, storageKey } = useProgress();

  if (!topic) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-red-100 text-[#B91C1C] flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-[#172033]">Paket Kuis Tidak Ditemukan</h1>
        <p className="mt-2 text-sm text-[#475569]">
          Paket kuis untuk topik "{topicId}" tidak tersedia.
        </p>
        <Link
          to="/kuis"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C2410C] text-white font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Daftar Kuis</span>
        </Link>
      </div>
    );
  }

  const isTeacher = profile?.role === 'teacher';
  const isUnlocked = isTeacher || isTopicCompleted(topic.id as TopicId, progress.visitedSectionIds);

  if (!isUnlocked) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-full bg-amber-100 text-[#C2410C] flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-[#172033]">Paket Kuis Masih Terkunci</h1>
        <p className="mt-2 text-sm text-[#475569] leading-relaxed max-w-md mx-auto">
          Kamu perlu membaca dan menyelesaikan seluruh bagian materi pada <strong>{topic.title}</strong> terlebih dahulu sebelum mengerjakan kuis evaluasi ini.
        </p>
        <Link
          to={`/materi/${topic.id}`}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold text-sm shadow-sm transition-colors"
        >
          <span>Buka Materi {topic.title}</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return <QuizSession key={`${storageKey}:${topic.id}`} topic={topic} storageKey={storageKey} />;
}

function QuizSession({ topic, storageKey }: { topic: Topic; storageKey: string }) {
  const { profile } = useAccess();
  const questions = QUIZ_QUESTIONS[topic.id];
  const [session, setSession] = useState(() => readQuizSession(storageKey, topic.id));
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [submissionSyncStatus, setSubmissionSyncStatus] = useState<SubmissionSyncStatus>('idle');
  const answeredCount = questions.filter((question) => session.answers[question.id]).length;
  const correctCount = questions.filter(
    (question) => session.answers[question.id] === question.correct
  ).length;

  const chooseAnswer = (questionId: string, optionId: string) => {
    if (session.submitted) return;
    const nextSession = {
      ...session,
      answers: { ...session.answers, [questionId]: optionId },
    };
    setSession(nextSession);
    setStorageAvailable(writeQuizSession(storageKey, topic.id, nextSession));
  };

  const submitQuiz = () => {
    if (answeredCount !== questions.length || session.submitted) return;

    const completedSession = { ...session, submitted: true };
    setStorageAvailable(writeQuizSession(storageKey, topic.id, completedSession));
    setSession(completedSession);

    const score = Math.round((correctCount / questions.length) * 100);

    if (profile?.role === 'student') {
      setSubmissionSyncStatus('pending');
      void saveTopicQuizAttempt({
        moduleId: topic.id,
        activityName: `Kuis pemahaman materi · ${topic.title}`,
        answers: session.answers,
        score: correctCount,
        maxScore: questions.length,
        percent: score,
      }).then(() => {
        setSubmissionSyncStatus('saved');
      }).catch((error: unknown) => {
        console.error('Gagal mengirim hasil kuis ke Firestore:', error);
        setSubmissionSyncStatus('failed');
      });
    }

    const progress = getProgressForKey(storageKey);
    const previousResult = progress.quizResults[topic.id];
    saveProgressForKey(storageKey, {
      ...progress,
      quizResults: {
        ...progress.quizResults,
        [topic.id]: {
          attempts: (previousResult?.attempts ?? 0) + 1,
          lastScore: score,
          bestScore: Math.max(previousResult?.bestScore ?? 0, score),
          lastCompletedAt: new Date().toISOString(),
        },
      },
    });
  };

  const restartQuiz = () => {
    const freshSession = { answers: {}, submitted: false };
    setSession(freshSession);
    setSubmissionSyncStatus('idle');
    setStorageAvailable(writeQuizSession(storageKey, topic.id, freshSession));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <div className="flex items-center justify-between gap-4">
        <Link to="/kuis" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#C2410C] hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Daftar Kuis</span>
        </Link>
        <span className="rounded-full bg-[#FFEDD5] px-3 py-1 text-xs font-semibold text-[#C2410C]">
          {questions.length} Soal · Pilihan A–E
        </span>
      </div>

      <header>
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C2410C]">
          <HelpCircle className="h-4 w-4 text-[#F97316]" aria-hidden="true" />
          <span>Kuis Pemahaman Materi</span>
        </div>
        <h1 className="text-2xl font-bold text-[#172033] sm:text-3xl">{topic.title}</h1>
        <p className="mt-2 text-sm leading-6 text-[#475569]">{topic.description}</p>
      </header>

      {session.submitted && (
        <section aria-live="polite" className="flex flex-col gap-4 rounded-xl border border-green-200 bg-green-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-green-900">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              Kuis selesai
            </p>
            <p className="mt-1 text-sm text-green-900">
              {correctCount} dari {questions.length} benar · Nilai {Math.round((correctCount / questions.length) * 100)}%
            </p>
            <p className="mt-1 text-xs text-green-800">Jawaban benar, jawabanmu, dan pembahasan tersedia di setiap soal.</p>
            {profile?.role === 'student' && (
              <p role="status" className="mt-2 text-xs font-semibold text-green-900">
                {submissionSyncStatus === 'pending' && 'Mengirim hasil ke server; hasil belum masuk rekap guru.'}
                {submissionSyncStatus === 'saved' && 'Hasil berhasil diterima server.'}
                {submissionSyncStatus === 'failed' && 'Hasil hanya tersimpan di perangkat ini; pengiriman ke server gagal.'}
                {submissionSyncStatus === 'idle' && 'Progres lokal tersimpan di perangkat ini.'}
              </p>
            )}
          </div>
          <button type="button" onClick={restartQuiz} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9A3412]">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Ulangi kuis
          </button>
        </section>
      )}

      {!session.submitted && (
        <p className="rounded-lg border border-[#F1E5D8] bg-white px-4 py-3 text-sm text-[#475569]" role="status">
          {storageAvailable
            ? `Pilihan tersimpan di perangkat ini. Jawaban dinilai setelah kuis dikirim. (${answeredCount}/${questions.length} terjawab)`
            : 'Penyimpanan browser tidak tersedia. Pilihan tetap aktif selama halaman ini terbuka.'}
        </p>
      )}

      <div className="space-y-4">
        {questions.map((question, index) => {
          const selectedId = session.answers[question.id];
          const selectedOption = question.options.find((option) => option.id === selectedId);
          const correctOption = question.options.find((option) => option.id === question.correct);
          const isCorrect = selectedId === question.correct;

          return (
            <section key={question.id} className="rounded-xl border border-[#F1E5D8] bg-white p-5 shadow-xs sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wide text-[#C2410C]">Soal {index + 1}</span>
                {session.submitted && (
                  <span className={`text-xs font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {isCorrect ? 'Benar' : 'Salah'}
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold leading-6 text-[#172033]">{question.prompt}</h2>
              <div role="radiogroup" aria-label={`Pilihan jawaban soal ${index + 1}`} className="mt-4 grid gap-2">
                {question.options.map((option) => {
                  const selected = selectedId === option.id;
                  const correct = session.submitted && question.correct === option.id;
                  const incorrectSelection = session.submitted && selected && !isCorrect;
                  const optionStyle = correct
                    ? 'border-green-500 bg-green-50 text-green-950'
                    : incorrectSelection
                      ? 'border-red-300 bg-red-50 text-red-950'
                      : selected
                        ? 'border-[#C2410C] bg-[#FFF8F0] text-[#172033]'
                        : 'border-[#F1E5D8] text-[#475569] hover:border-orange-300 hover:bg-orange-50';

                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={session.submitted}
                      onClick={() => chooseAnswer(question.id, option.id)}
                      className={`flex min-h-12 items-start gap-3 rounded-lg border px-3 py-3 text-left text-sm leading-5 transition-colors disabled:cursor-default ${optionStyle}`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold uppercase">{option.id}</span>
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>

              {session.submitted && (
                <div className={`mt-4 rounded-lg p-4 text-sm leading-6 ${isCorrect ? 'bg-green-50 text-green-950' : 'bg-red-50 text-red-950'}`}>
                  {isCorrect ? (
                    <p><strong>Tepat.</strong> {question.explanation}</p>
                  ) : (
                    <>
                      <p><strong>Mengapa jawabanmu salah:</strong> {question.wrongFeedback[selectedId] ?? 'Pilihan ini tidak sesuai dengan konsep pada materi.'}</p>
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

      {!session.submitted && (
        <div className="flex flex-col items-start gap-3 border-t border-[#F1E5D8] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#475569]">
            {answeredCount === questions.length
              ? 'Semua pilihan tersimpan. Kirim kuis untuk melihat hasil dan pembahasan.'
              : `Lengkapi ${questions.length - answeredCount} soal lagi sebelum mengirim.`}
          </p>
          <button
            type="button"
            disabled={answeredCount !== questions.length}
            onClick={submitQuiz}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9A3412] disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Kirim dan lihat hasil
          </button>
        </div>
      )}

      <p className="border-t border-[#F1E5D8] pt-4 text-xs text-[#64748B]">
        Nilai dan jawaban tersimpan secara lokal di browser pada perangkat ini.
      </p>
    </div>
  );
}

