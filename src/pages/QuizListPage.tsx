import { Link } from 'react-router-dom';
import { TOPICS } from '../data/topics';
import { HelpCircle, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { useProgress } from '../lib/progress';

export function QuizListPage() {
  const { progress } = useProgress();

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
          Pilih paket kuis mana pun untuk mulai. Nilai terakhir dan terbaik tersimpan di progres belajar.
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
          const result = progress.quizResults[topic.id];
          const completed = (result?.attempts ?? 0) > 0;

          return (
            <div
              key={topic.id}
              data-card-hover
              className="flex flex-col justify-between rounded-2xl border border-[#F1E5D8] bg-white p-6 shadow-xs transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-full bg-[#FFEDD5] px-2.5 py-0.5 text-xs font-bold text-[#C2410C]">
                    Paket {index + 1}
                  </span>
                  <span className="text-xs text-[#64748B]">5 Soal</span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#172033]">
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
              </div>

              <Link
                to={`/kuis/${topic.id}`}
                className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#C2410C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9A3412]"
              >
                <span>{completed ? `Ulangi Paket ${index + 1}` : `Mulai Paket ${index + 1}`}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
