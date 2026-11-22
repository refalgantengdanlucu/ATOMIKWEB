import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TOPICS } from '../data/topics';
import { ESSAY_QUESTIONS, QUIZ_QUESTIONS } from '../data/quizQuestions';
import { useAccess } from '../lib/access-context';
import { saveQuizAttempt, saveStudentActivity } from '../lib/firebase-db';
import { recordClassroomQuiz, recordStudentActivity, type TrackedQuizResult, type StudentActivity } from '../lib/classroom';
import { getProgress, saveProgress, isTopicCompleted } from '../lib/progress';
import type { Topic, TopicId } from '../types';
import { ArrowLeft, HelpCircle, AlertCircle, CheckCircle2, RotateCcw, Send, Lock, ArrowRight } from 'lucide-react';

interface SavedQuizSession {
  answers: Record<string, string>;
  essayAnswers: Record<string, string>;
  submitted: boolean;
}

function quizStorageKey(topicId: TopicId) {
  return `atomika-quiz-${topicId}-v1`;
}

function readStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
  );
}

function readQuizSession(topicId: TopicId): SavedQuizSession {
  try {
    const raw = window.localStorage.getItem(quizStorageKey(topicId));
    if (!raw) return { answers: {}, essayAnswers: {}, submitted: false };

    const saved = JSON.parse(raw) as Partial<SavedQuizSession>;
    const answers = readStringRecord(saved.answers);
    const essayAnswers = readStringRecord(saved.essayAnswers);
    return {
      answers,
      essayAnswers,
      submitted:
        saved.submitted === true &&
        ESSAY_QUESTIONS[topicId].every((question) => essayAnswers[question.id]?.trim()),
    };
  } catch (error) {
    console.error('Gagal membaca jawaban kuis:', error);
    return { answers: {}, essayAnswers: {}, submitted: false };
  }
}

function writeQuizSession(topicId: TopicId, session: SavedQuizSession): boolean {
  try {
    window.localStorage.setItem(quizStorageKey(topicId), JSON.stringify(session));
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
  const isUnlocked = isTeacher || isTopicCompleted(topic.id as TopicId, getProgress().visitedSectionIds);

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

  return <QuizSession key={topic.id} topic={topic} />;
}

function QuizSession({ topic }: { topic: Topic }) {
  const { profile } = useAccess();
  const questions = QUIZ_QUESTIONS[topic.id];
  const essayQuestions = ESSAY_QUESTIONS[topic.id];
  const [session, setSession] = useState(() => readQuizSession(topic.id));
  const [storageAvailable, setStorageAvailable] = useState(true);
  const answeredCount = questions.filter((question) => session.answers[question.id]).length;
  const answeredEssayCount = essayQuestions.filter(
    (question) => session.essayAnswers[question.id]?.trim()
  ).length;
  const allQuestionsAnswered =
    answeredCount === questions.length && answeredEssayCount === essayQuestions.length;
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
    setStorageAvailable(writeQuizSession(topic.id, nextSession));
  };

  const writeEssayAnswer = (questionId: string, value: string) => {
    if (session.submitted) return;
    const nextSession = {
      ...session,
      essayAnswers: { ...session.essayAnswers, [questionId]: value },
    };
    setSession(nextSession);
    setStorageAvailable(writeQuizSession(topic.id, nextSession));
  };

  const submitQuiz = () => {
    if (!allQuestionsAnswered || session.submitted) return;

    const completedSession = { ...session, submitted: true };
    setStorageAvailable(writeQuizSession(topic.id, completedSession));
    setSession(completedSession);

    const score = Math.round((correctCount / questions.length) * 100);

    if (profile) {
      const attempt: TrackedQuizResult = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: profile.name,
        className: profile.role === 'student' ? profile.className : '',
        quizTitle: topic.title,
        score: correctCount,
        maxScore: questions.length,
        percent: score,
        submittedAt: new Date().toISOString(),
      };

      // 1. Simpan ke database Firestore
      void saveQuizAttempt(attempt);

      // 2. Simpan ke rekapan kuis kelas agar langsung terbaca di akun guru
      recordClassroomQuiz(attempt);

      // 3. Catat aktivitas belajar siswa
      const activityRecord: StudentActivity = {
        name: profile.name,
        className: profile.role === 'student' ? profile.className : '',
        activity: `Menyelesaikan ${topic.title} (Nilai: ${score}%)`,
        path: `/kuis/${topic.id}`,
        progressSummary: `Skor: ${correctCount}/${questions.length} (${score}%)`,
        lastSeen: attempt.submittedAt,
      };
      recordStudentActivity(activityRecord);
      void saveStudentActivity(activityRecord);
    }

    const progress = getProgress();
    const previousResult = progress.quizResults[topic.id];
    saveProgress({
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
    const freshSession = { answers: {}, essayAnswers: {}, submitted: false };
    setSession(freshSession);
    setStorageAvailable(writeQuizSession(topic.id, freshSession));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <div className="flex items-center justify-between gap-4">
        <Link to="/kuis" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#C2410C] hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Daftar Kuis</span>
        </Link>
        <span className="rounded-full bg-[#FFEDD5] px-3 py-1 text-xs font-semibold text-[#C2410C]">
          {questions.length} Pilihan Ganda · {essayQuestions.length} Esai
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
              {correctCount} dari {questions.length} pilihan ganda benar · Nilai pilihan ganda {Math.round((correctCount / questions.length) * 100)}%
            </p>
            <p className="mt-1 text-xs text-green-800">Jawaban dan pembahasan pilihan ganda tersedia di setiap soal. Jawaban esai tersimpan di perangkat ini dan tidak dinilai otomatis.</p>
            <p className="mt-1 text-xs font-semibold text-emerald-800">✓ Nilai pilihan ganda masuk ke rekap akun guru.</p>
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
            ? `Jawaban tersimpan di perangkat ini. (Pilihan ganda ${answeredCount}/${questions.length} · Esai ${answeredEssayCount}/${essayQuestions.length} terjawab)`
            : 'Penyimpanan browser tidak tersedia. Jawaban tetap tersedia selama halaman ini terbuka.'}
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

      <section aria-labelledby="essay-heading" className="space-y-4">
        <div>
          <h2 id="essay-heading" className="text-xl font-bold text-[#172033]">Soal Esai</h2>
          <p className="mt-1 text-sm leading-6 text-[#475569]">
            Jawaban esai disimpan di browser ini dan tidak dinilai otomatis.
          </p>
        </div>
        {essayQuestions.map((question) => {
          const answered = Boolean(session.essayAnswers[question.id]?.trim());
          return (
            <section key={question.id} className="rounded-xl border border-[#F1E5D8] bg-white p-5 shadow-xs sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label htmlFor={question.id} className="text-xs font-bold uppercase tracking-wide text-[#C2410C]">
                  Soal Esai {question.number}
                </label>
                <span className={`text-xs font-semibold ${answered ? 'text-green-700' : 'text-[#64748B]'}`}>
                  {answered ? 'Sudah dijawab' : 'Belum dijawab'}
                </span>
              </div>
              <p className="whitespace-pre-line text-sm font-medium leading-6 text-[#172033]">{question.prompt}</p>
              <textarea
                id={question.id}
                value={session.essayAnswers[question.id] ?? ''}
                onChange={(event) => writeEssayAnswer(question.id, event.target.value)}
                disabled={session.submitted}
                rows={6}
                placeholder="Tuliskan jawabanmu di sini..."
                className="mt-4 min-h-36 w-full resize-y rounded-lg border border-[#F1E5D8] bg-[#FFFDFC] px-3 py-3 text-sm leading-6 text-[#172033] placeholder:text-[#94A3B8] focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20 disabled:bg-slate-50"
              />
            </section>
          );
        })}
      </section>

      {!session.submitted && (
        <div className="flex flex-col items-start gap-3 border-t border-[#F1E5D8] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#475569]">
            {allQuestionsAnswered
              ? 'Semua pilihan ganda dan esai terjawab. Kirim kuis untuk melihat hasil pilihan ganda.'
              : `Lengkapi ${questions.length - answeredCount} pilihan ganda dan ${essayQuestions.length - answeredEssayCount} esai lagi sebelum mengirim.`}
          </p>
          <button
            type="button"
            disabled={!allQuestionsAnswered}
            onClick={submitQuiz}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9A3412] disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Kirim dan lihat hasil
          </button>
        </div>
      )}

      <p className="border-t border-[#F1E5D8] pt-4 text-xs text-[#64748B]">
        Nilai dan jawaban pilihan ganda serta esai tersimpan secara lokal di browser pada perangkat ini.
      </p>
    </div>
  );
}

