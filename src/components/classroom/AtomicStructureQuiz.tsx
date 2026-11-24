import { useState } from 'react';
import { CheckCircle2, RotateCw, Sparkles, Trophy } from 'lucide-react';
import {
  ATOMIC_STRUCTURE_QUESTIONS,
  CLASSROOM_STORAGE_KEYS,
  type QuizAttempt,
  type TrackedQuizResult,
} from '../../lib/classroom';
import { saveQuizAttempt } from '../../lib/firebase-db';

const panelClass = 'rounded-3xl border border-[#F1E5D8] bg-white p-5 shadow-sm sm:p-8';
const buttonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#C2410C] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#9A3412] disabled:cursor-not-allowed disabled:opacity-50';

interface AtomicStructureQuizProps {
  initialName: string;
  className: string;
  onSave: (key: string, value: unknown) => boolean;
  attempts: QuizAttempt[];
}

export function AtomicStructureQuiz({
  initialName,
  className,
  onSave,
  attempts,
}: AtomicStructureQuizProps) {
  const [name] = useState(initialName);
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [savedScore, setSavedScore] = useState<number | null>(null);
  const [syncMessage, setSyncMessage] = useState('');

  const question = ATOMIC_STRUCTURE_QUESTIONS[questionIndex];

  const finishQuiz = (nextAnswers: boolean[]) => {
    const score = nextAnswers.filter(Boolean).length;
    const attemptId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const studentClean = name.trim().replace(/\s+/g, ' ') || 'Siswa ATOMIKA';
    const submittedAt = new Date().toISOString();

    const attempt: QuizAttempt = {
      id: attemptId,
      name: studentClean,
      className,
      quizTitle: 'Kuis Penguatan Struktur Atom',
      score,
      submittedAt,
    };

    if (onSave(CLASSROOM_STORAGE_KEYS.quiz, [...attempts, attempt])) {
      setSavedScore(score);
      setFinished(true);

      const tracked: TrackedQuizResult = {
        ...attempt,
        className,
        quizTitle: 'Kuis Penguatan Struktur Atom',
        maxScore: 10,
        percent: Math.round((score / 10) * 100),
      };

      void saveQuizAttempt(tracked).catch((error: unknown) => {
        console.error('Gagal mengirim hasil kuis struktur atom ke Firestore:', error);
        setSyncMessage('Nilai tersimpan di browser, tetapi sinkronisasi ke Firebase sedang offline.');
      });
      setSyncMessage('Hasil pengerjaan berhasil tersimpan di akun Anda dan terekap di akun guru.');
    }
  };

  const handleRestart = () => {
    setQuestionIndex(-1);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
    setSavedScore(null);
    setSyncMessage('');
  };

  if (finished) {
    const percent = Math.round(((savedScore ?? 0) / 10) * 100);
    return (
      <section className={`${panelClass} mx-auto max-w-2xl text-center`} aria-live="polite">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-[#15803D]">
          <Trophy className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
          Kuis Penguatan Selesai
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-[#172033]">
          Kerja bagus, {name.trim()}!
        </h2>
        <div className="my-5 inline-block rounded-2xl bg-[#FFF8F0] border border-[#F97316]/20 px-8 py-5">
          <p className="text-xs font-semibold text-[#64748B]">Skor Akhir</p>
          <div className="text-4xl font-black text-[#C2410C]">
            {savedScore ?? 0}
            <span className="text-xl font-bold text-[#64748B]"> / 10</span>
          </div>
          <p className="mt-1 text-sm font-bold text-[#15803D]">Nilai: {percent}%</p>
        </div>
        <p className="text-sm text-[#475569] max-w-md mx-auto">
          {percent >= 80
            ? 'Pemahaman Anda mengenai struktur atom, partikel subatom, isotop, dan ion sudah sangat matang!'
            : percent >= 60
            ? 'Pemahaman Anda sudah baik. Terus perdalam materi mengenai isotop dan pembentukan ion.'
            : 'Perlu latihan lebih lanjut. Silakan baca kembali buku materi pembelajaran struktur atom.'}
        </p>
        <p role="status" className="mt-4 text-xs font-medium text-[#15803D]">
          {syncMessage || 'Menyimpan hasil kuis ke akun Anda...'}
        </p>
        <button type="button" className={`${buttonClass} mt-6`} onClick={handleRestart}>
          <RotateCw className="w-4 h-4" />
          <span>Coba Kuis Lagi</span>
        </button>
      </section>
    );
  }

  if (questionIndex === -1) {
    return (
      <section className={`${panelClass} mx-auto max-w-2xl`}>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFEDD5] text-[#C2410C] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Kuis Kegiatan Kelas</span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#172033]">
          Kuis Penguatan Konsep Struktur Atom
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#475569]">
          Uji pemahaman Anda melalui 10 butir soal pilihan ganda dengan variasi tingkat kesulitan
          mudah, sedang, dan sukar. Materi mencakup partikel subatom, notasi nuklida, nomor atom,
          nomor massa, isotop/isobar/isoton, serta ion.
        </p>
        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-[#FFF8F0] border border-[#F1E5D8] px-4 py-3 text-sm text-[#475569] flex items-center justify-between">
            <span>Nama Siswa:</span>
            <strong className="text-[#172033]">{name}</strong>
          </div>
          {className && (
            <div className="rounded-xl bg-[#FFF8F0] border border-[#F1E5D8] px-4 py-3 text-sm text-[#475569] flex items-center justify-between">
              <span>Kelas:</span>
              <strong className="text-[#172033]">{className}</strong>
            </div>
          )}
          <button
            type="button"
            className={buttonClass}
            onClick={() => setQuestionIndex(0)}
          >
            Mulai Kuis Penguatan
          </button>
        </div>
      </section>
    );
  }

  const isCorrect = selected === question.correct;
  const difficultyBadge = {
    mudah: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    sedang: 'bg-amber-100 text-amber-800 border-amber-200',
    sukar: 'bg-rose-100 text-rose-800 border-rose-200',
  }[question.difficulty];

  return (
    <section className={`${panelClass} mx-auto max-w-2xl`}>
      {/* Header Soal & Progres */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
            Soal {questionIndex + 1} dari 10
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${difficultyBadge}`}>
            {question.difficulty}
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {question.topic}
          </span>
        </div>
        <span className="text-xs font-semibold text-[#64748B]">
          {answers.filter(Boolean).length} benar sejauh ini
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-orange-100">
        <div
          className="h-full rounded-full bg-[#F97316] transition-all duration-300"
          style={{ width: `${((questionIndex + 1) / ATOMIC_STRUCTURE_QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Pertanyaan */}
      <h3 className="mt-6 text-base sm:text-lg font-bold leading-relaxed text-[#172033]">
        {question.prompt}
      </h3>

      {/* Pilihan Jawaban A, B, C, D */}
      <div className="mt-5 space-y-2.5">
        {question.options.map((option) => {
          const isSelected = selected === option.id;
          const isCorrectOption = option.id === question.correct;

          let btnColor = 'border-[#F1E5D8] bg-white hover:border-orange-300 hover:bg-orange-50/50 text-[#172033]';
          if (selected) {
            if (isSelected) {
              btnColor = isCorrect
                ? 'border-green-500 bg-green-50 text-green-900 font-bold'
                : 'border-red-400 bg-red-50 text-red-900 font-bold';
            } else if (isCorrectOption) {
              btnColor = 'border-green-500 bg-green-50/80 text-green-900 font-bold';
            } else {
              btnColor = 'border-[#F1E5D8] bg-slate-50 text-slate-400 opacity-60';
            }
          }

          return (
            <button
              type="button"
              key={option.id}
              disabled={selected !== null}
              onClick={() => {
                setSelected(option.id);
                setAnswers((prev) => [...prev, option.id === question.correct]);
              }}
              className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all duration-150 flex items-start gap-3 ${btnColor}`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border ${
                  isSelected && isCorrect
                    ? 'bg-green-600 text-white border-green-600'
                    : isSelected && !isCorrect
                    ? 'bg-red-600 text-white border-red-600'
                    : isCorrectOption && selected
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-slate-100 text-[#475569] border-slate-200'
                }`}
              >
                {option.id}
              </span>
              <span className="flex-1 min-w-0 pt-0.5">{option.text}</span>
            </button>
          );
        })}
      </div>

      {/* Pembahasan & Tombol Selanjutnya */}
      {selected && (
        <div
          role="status"
          className={`mt-5 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
            isCorrect ? 'bg-green-50 border border-green-200 text-green-950' : 'bg-amber-50 border border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5 font-bold">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>Jawaban Tepat!</span>
              </>
            ) : (
              <span>Belum tepat. Jawaban yang benar adalah pilihan {question.correct}.</span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-[#334155] mt-1">
            <strong className="text-[#172033]">Pembahasan:</strong> {question.explanation}
          </p>

          <button
            type="button"
            className={`${buttonClass} mt-4`}
            onClick={() => {
              if (questionIndex === ATOMIC_STRUCTURE_QUESTIONS.length - 1) {
                finishQuiz(answers);
              } else {
                setQuestionIndex((prev) => prev + 1);
                setSelected(null);
              }
            }}
          >
            {questionIndex === ATOMIC_STRUCTURE_QUESTIONS.length - 1 ? 'Lihat Skor Saya' : 'Soal Berikutnya'}
          </button>
        </div>
      )}
    </section>
  );
}
