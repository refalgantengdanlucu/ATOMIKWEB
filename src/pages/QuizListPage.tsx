import { Link } from 'react-router-dom';
import { TOPICS } from '../data/topics';
import { HelpCircle, Award, CheckCircle2, ArrowRight, Lock } from 'lucide-react';
import { useProgress } from '../lib/progress';
import { useAccess } from '../lib/access-context';

export function QuizListPage() {
  const { progress, isQuizUnlocked, areQuizzesUnlocked } = useProgress();
  const { profile } = useAccess();
  const isTeacher = profile?.role === 'teacher';

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#C2410C] mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
          <span>Evaluasi Pemahaman Terbimbing</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#172033] tracking-tight">
          Kuis Berumpan Balik
        </h1>
        <p className="mt-2 text-[#475569] text-base max-w-2xl">
          Selesaikan kuis secara berurutan. Paket berikutnya terbuka setelah kuis sebelumnya dikirim.
          Nilai terakhir dan terbaik tersimpan di progres belajar.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#172033] mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
          <span>Aturan Penilaian Kuis</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#475569]">
          <div className="p-3 rounded-xl bg-[#FFF8F0] border border-[#F1E5D8]">
            <div className="font-bold text-[#172033] text-sm">5 Soal per Paket</div>
            <p className="mt-1">Setiap topik memiliki 5 soal pilihan ganda dengan opsi A, B, C, D, dan E.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#FFF8F0] border border-[#F1E5D8]">
            <div className="font-bold text-[#172033] text-sm">Rumus Nilai</div>
            <p className="mt-1">Nilai = (jawaban benar ÷ 5) × 100. Nilai terakhir dan terbaik tersimpan di progres.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#FFF8F0] border border-[#F1E5D8]">
            <div className="font-bold text-[#172033] text-sm">Umpan Balik Instan</div>
            <p className="mt-1">Jawaban dan pembahasan muncul setelah semua soal dijawab dan kuis dikirim.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TOPICS.map((topic, index) => {
          const unlocked = isTeacher || isQuizUnlocked(topic.id);
          const result = progress.quizResults[topic.id];
          const completed = (result?.attempts ?? 0) > 0;
          const lockedMessage = !isTeacher && !areQuizzesUnlocked()
            ? 'Selesaikan semua mode Laboratorium terlebih dahulu.'
            : `Kirim Kuis ${index} untuk membuka paket ini.`;

          return (
            <div
              key={topic.id}
              data-card-hover={unlocked ? '' : undefined}
              className={`flex flex-col justify-between p-6 rounded-2xl border shadow-xs transition-shadow ${
                unlocked ? 'bg-white border-[#F1E5D8]' : 'bg-slate-50 border-slate-200 opacity-85'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    unlocked ? 'text-[#C2410C] bg-[#FFEDD5]' : 'text-slate-500 bg-slate-100'
                  }`}>
                    {unlocked ? `Paket ${index + 1}` : 'Terkunci'}
                  </span>
                  <span className="text-xs text-[#64748B]">5 Soal</span>
                </div>
                <h3 className={`font-bold text-lg mb-2 ${unlocked ? 'text-[#172033]' : 'text-slate-500'}`}>
                  {topic.title}
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed mb-4">{topic.description}</p>

                <div className="space-y-1.5 text-xs text-[#475569] pt-2 border-t border-[#F1E5D8]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
                    <span>Termasuk soal prediksi & konseptual</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
                    <span>Dapat diulang kapan saja</span>
                  </div>
                </div>

                {completed && (
                  <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm font-bold text-green-900">
                    Nilai terakhir: {result?.lastScore}% · Terbaik: {result?.bestScore}% ({result?.attempts} percobaan)
                  </p>
                )}
                {!unlocked && (
                  <p className="mt-4 flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
                    <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {lockedMessage}
                  </p>
                )}
              </div>

              {unlocked ? (
                <Link
                  to={`/kuis/${topic.id}`}
                  className="mt-6 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold text-sm shadow-sm transition-colors min-h-[44px]"
                >
                  <span>{completed ? `Ulangi Paket ${index + 1}` : `Mulai Paket ${index + 1}`}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-6 inline-flex min-h-[44px] w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400"
                >
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  Terkunci
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
