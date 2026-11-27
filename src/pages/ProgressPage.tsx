import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TOPICS } from '../data/topics';
import { Award, RotateCcw, BookOpen, Atom, HelpCircle, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { LAB_MODES, useProgress } from '../lib/progress';

export function ProgressPage() {
  const {
    progress,
    getTopicCompletion,
    isTopicUnlocked,
    isTopicCompleted,
    isLaboratoryUnlocked,
    areAllLabModesCompleted,
    areQuizzesUnlocked,
    isQuizUnlocked,
    resetProgress,
  } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    if (confirmReset) {
      resetProgress();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
    }
  };

  const completedMilestones =
    TOPICS.filter((topic) => isTopicCompleted(topic.id)).length +
    LAB_MODES.filter(({ topicId }) => progress.labDone[topicId]).length +
    TOPICS.filter((topic) => (progress.quizResults[topic.id]?.attempts ?? 0) > 0).length;
  const totalMilestones = TOPICS.length * 3;
  const globalPercent = Math.round((completedMilestones / totalMilestones) * 100);
  const laboratoryUnlocked = isLaboratoryUnlocked();
  const laboratoryCompleted = laboratoryUnlocked && areAllLabModesCompleted();
  const quizzesUnlocked = areQuizzesUnlocked();

  return (
    <div className="space-y-8 pb-16">
      <header>
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#FFEDD5] px-3 py-1 text-xs font-semibold text-[#C2410C]">
          <Award className="h-3.5 w-3.5 text-[#F97316]" aria-hidden="true" />
          <span>Roadmap Belajar</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#172033]">Capaian &amp; Progres Belajar</h1>
        <p className="mt-2 max-w-2xl text-base text-[#475569]">
          Ikuti tahapan materi, laboratorium, lalu kuis. Tahap yang terkunci akan terbuka setelah prasyaratnya selesai.
        </p>
      </header>

      <section aria-label="Ringkasan progres" className="rounded-2xl border border-[#F1E5D8] bg-white p-5 shadow-xs">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-[#172033]">Progres keseluruhan</span>
          <span className="text-sm font-bold text-[#C2410C]">{globalPercent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full border border-[#F1E5D8] bg-[#FFF8F0]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#F97316] to-[#C2410C] transition-all duration-700"
            style={{ width: `${globalPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-[#475569]">
          {completedMilestones} dari {totalMilestones} tahapan selesai
        </p>
      </section>

      <section aria-labelledby="materials-roadmap">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#F97316]" aria-hidden="true" />
          <h2 id="materials-roadmap" className="text-xl font-extrabold text-[#172033]">1. Materi</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {TOPICS.map((topic, index) => {
            const unlocked = isTopicUnlocked(topic.id);
            const completed = isTopicCompleted(topic.id);
            const { completedCount, totalCount, percent } = getTopicCompletion(topic.id);

            return (
              <article key={topic.id} data-card-hover={unlocked ? '' : undefined} className={`flex flex-col rounded-2xl border p-5 shadow-xs ${
                unlocked ? 'border-[#F1E5D8] bg-white' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wide text-[#C2410C]">Topik {index + 1}</span>
                    <h3 className="mt-1 font-bold leading-snug text-[#172033]">{topic.title}</h3>
                  </div>
                  {completed
                    ? <CheckCircle2 className="h-5 w-5 shrink-0 text-green-700" aria-label="Selesai" />
                    : unlocked
                      ? <BookOpen className="h-5 w-5 shrink-0 text-[#F97316]" aria-hidden="true" />
                      : <Lock className="h-4 w-4 shrink-0 text-slate-400" aria-label="Terkunci" />}
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-[#475569]">Bagian dibaca</span>
                    <span className="font-bold text-[#C2410C]">{completedCount}/{totalCount}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#FFF8F0]">
                    <div className={`h-full rounded-full ${completed ? 'bg-green-600' : 'bg-[#F97316]'}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
                {unlocked ? (
                  <Link to={`/materi/${topic.id}`} className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#F1E5D8] bg-[#FFF8F0] px-3 text-xs font-semibold text-[#C2410C] hover:bg-[#FFEDD5]">
                    {completed ? 'Buka materi kembali' : 'Lanjutkan materi'}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                ) : (
                  <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    Selesaikan topik sebelumnya
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="laboratory-roadmap">
        <div className="mb-4 flex items-center gap-2">
          <Atom className="h-5 w-5 text-[#F97316]" aria-hidden="true" />
          <h2 id="laboratory-roadmap" className="text-xl font-extrabold text-[#172033]">2. Laboratorium</h2>
          <span className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${
            laboratoryCompleted ? 'bg-green-50 text-green-800' : 'bg-[#FFF8F0] text-[#9A3412]'
          }`}>
            {laboratoryCompleted ? 'Semua mode selesai' : laboratoryUnlocked ? 'Sedang berlangsung' : 'Terkunci'}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {LAB_MODES.map((mode) => {
            const completed = progress.labDone[mode.topicId];
            const href = `/laboratorium/${mode.id}`;

            return (
              <article key={mode.id} data-card-hover={laboratoryUnlocked ? '' : undefined} className={`flex flex-col rounded-2xl border p-5 ${
                laboratoryUnlocked ? 'border-[#F1E5D8] bg-white' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-[#172033]">{mode.label}</h3>
                  {completed
                    ? <CheckCircle2 className="h-5 w-5 shrink-0 text-green-700" aria-label="Selesai" />
                    : laboratoryUnlocked
                      ? <Atom className="h-5 w-5 shrink-0 text-[#F97316]" aria-hidden="true" />
                      : <Lock className="h-4 w-4 shrink-0 text-slate-400" aria-label="Terkunci" />}
                </div>
                <p className="mt-2 text-xs leading-5 text-[#64748B]">
                  {completed ? 'Mode ini sudah dibuka.' : laboratoryUnlocked ? 'Buka mode ini untuk menandai tahap selesai.' : 'Selesaikan semua materi Topik 1–3 terlebih dahulu.'}
                </p>
                {laboratoryUnlocked ? (
                  <Link to={href} className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#F1E5D8] bg-[#FFF8F0] px-3 text-xs font-semibold text-[#C2410C] hover:bg-[#FFEDD5]">
                    {completed ? 'Buka kembali' : 'Buka laboratorium'}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                ) : (
                  <span className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 text-xs font-semibold text-slate-400">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    Belum terbuka
                  </span>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="quiz-roadmap">
        <div className="mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-[#F97316]" aria-hidden="true" />
          <h2 id="quiz-roadmap" className="text-xl font-extrabold text-[#172033]">3. Kuis</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {TOPICS.map((topic, index) => {
            const unlocked = isQuizUnlocked(topic.id);
            const result = progress.quizResults[topic.id];
            const completed = (result?.attempts ?? 0) > 0;
            const lockedMessage = !quizzesUnlocked
              ? 'Selesaikan semua mode Laboratorium terlebih dahulu.'
              : `Kirim Kuis ${index} untuk membuka tahap ini.`;

            return (
              <article key={topic.id} data-card-hover={unlocked ? '' : undefined} className={`flex flex-col rounded-2xl border p-5 ${
                unlocked ? 'border-[#F1E5D8] bg-white' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wide text-[#C2410C]">Kuis {index + 1}</span>
                    <h3 className="mt-1 font-bold leading-snug text-[#172033]">{topic.title}</h3>
                  </div>
                  {completed
                    ? <CheckCircle2 className="h-5 w-5 shrink-0 text-green-700" aria-label="Selesai" />
                    : unlocked
                      ? <HelpCircle className="h-5 w-5 shrink-0 text-[#F97316]" aria-hidden="true" />
                      : <Lock className="h-4 w-4 shrink-0 text-slate-400" aria-label="Terkunci" />}
                </div>
                {completed ? (
                  <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-950">
                    <p className="font-bold">Nilai terakhir: {result?.lastScore}%</p>
                    <p className="mt-1 text-xs">Nilai terbaik: {result?.bestScore}% · {result?.attempts} percobaan</p>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-[#64748B]">
                    {unlocked ? 'Siap dikerjakan.' : lockedMessage}
                  </p>
                )}
                {unlocked ? (
                  <Link to={`/kuis/${topic.id}`} className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#F1E5D8] bg-[#FFF8F0] px-3 text-xs font-semibold text-[#C2410C] hover:bg-[#FFEDD5]">
                    {completed ? 'Ulangi kuis' : 'Mulai kuis'}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                ) : (
                  <span className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 text-xs font-semibold text-slate-400">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    Belum terbuka
                  </span>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="classroom-roadmap">
        <div className="mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-[#F97316]" aria-hidden="true" />
          <h2 id="classroom-roadmap" className="text-xl font-extrabold text-[#172033]">
            4. Penguatan Konsep &amp; Latihan Essay
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="flex flex-col justify-between rounded-2xl border border-[#F1E5D8] bg-white p-5 shadow-xs">
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-[#C2410C]">
                Kuis Penguatan
              </span>
              <h3 className="mt-1 font-bold leading-snug text-[#172033]">
                Kuis Penguatan Struktur Atom
              </h3>
              <p className="mt-2 text-xs text-[#475569]">
                10 soal pilihan ganda (mudah, sedang, sukar) mencakup partikel subatom, isotop, dan ion untuk menguji pemahaman kelas.
              </p>
            </div>
            <Link
              to="/kelas?aktivitas=quiz"
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#F1E5D8] bg-[#FFF8F0] px-4 text-xs font-semibold text-[#C2410C] hover:bg-[#FFEDD5] transition-colors"
            >
              <span>Buka Kuis Penguatan</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </article>

          <article className="flex flex-col justify-between rounded-2xl border border-[#F1E5D8] bg-white p-5 shadow-xs">
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-[#C2410C]">
                Latihan Menulis
              </span>
              <h3 className="mt-1 font-bold leading-snug text-[#172033]">
                Latihan Soal Essay Struktur Atom
              </h3>
              <p className="mt-2 text-xs text-[#475569]">
                6 soal essay terbagi dalam 3 subtopik dengan penjelasan konsep mendalam. Jawaban Anda tersimpan dan dinilai oleh guru.
              </p>
            </div>
            <Link
              to="/materi/essay"
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#F1E5D8] bg-[#FFF8F0] px-4 text-xs font-semibold text-[#C2410C] hover:bg-[#FFEDD5] transition-colors"
            >
              <span>Kerjakan Soal Essay</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </article>
        </div>
      </section>

      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#F1E5D8] bg-white p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-bold text-[#172033]">Progres tersimpan di perangkat ini</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-[#475569]">
            Materi yang dibaca, mode lab yang dibuka, dan nilai kuis disimpan secara lokal pada browser ini.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {confirmReset && (
            <p className="max-w-[200px] text-right text-xs font-semibold text-[#B91C1C]">
              Klik sekali lagi untuk konfirmasi reset. Tindakan ini tidak dapat dibatalkan!
            </p>
          )}
          <button
            type="button"
            onClick={handleReset}
            className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${
              confirmReset
                ? 'border-2 border-red-400 bg-red-100 text-[#B91C1C]'
                : 'border border-red-200 bg-red-50/50 text-[#B91C1C] hover:bg-red-100'
            }`}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>{confirmReset ? 'Ya, Reset Semua Progres' : 'Reset Progres'}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
