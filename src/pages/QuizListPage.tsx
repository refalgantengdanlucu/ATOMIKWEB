import { Link } from 'react-router-dom';
import { TOPICS } from '../data/topics';
import { HelpCircle, Award, CheckCircle2, ArrowRight } from 'lucide-react';

export function QuizListPage() {
  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#C2410C] mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
          <span>Evaluasi Pemahaman Terbimbing</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#172033] tracking-tight">
          Kuis Berumpan Balik
        </h1>
        <p className="mt-2 text-[#475569] text-base max-w-2xl">
          Uji pemahamanmu setelah mempelajari materi. Setiap jawaban salah disertai pembahasan dan petunjuk miskonsepsi untuk membantumu belajar lebih baik.
        </p>
      </div>

      {/* Aturan Nilai Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#172033] mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
          <span>Aturan Penilaian Kuis</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#475569]">
          <div className="p-3 rounded-xl bg-[#FFF8F0] border border-[#F1E5D8]">
            <div className="font-bold text-[#172033] text-sm">5 Soal per Paket</div>
            <p className="mt-1">
              Setiap topik memiliki 5 butir soal pilihan ganda, benar/salah, atau isian angka.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#FFF8F0] border border-[#F1E5D8]">
            <div className="font-bold text-[#172033] text-sm">Rumus Nilai</div>
            <p className="mt-1">
              Nilai = (Benar ÷ 5) × 100. Nilai tertinggi (best) dan terakhir (last) akan disimpan.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#FFF8F0] border border-[#F1E5D8]">
            <div className="font-bold text-[#172033] text-sm">Umpan Balik Instan</div>
            <p className="mt-1">
              Setiap nomor langsung menampilkan pembahasan konsep dan tautan ke bagian terkait.
            </p>
          </div>
        </div>
      </div>

      {/* Quiz Packages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TOPICS.map((topic, index) => (
          <div
            key={topic.id}
            className="flex flex-col justify-between p-6 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#C2410C] bg-[#FFEDD5] px-2.5 py-0.5 rounded-full">
                  Paket {index + 1}
                </span>
                <span className="text-xs text-[#64748B]">5 Soal</span>
              </div>
              <h3 className="font-bold text-lg text-[#172033] mb-2">
                {topic.title}
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed mb-4">
                Menguji pemahaman partikel, notasi atom, atau konsep muatan ion.
              </p>

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
            </div>

            <Link
              to={`/kuis/${topic.id}`}
              className="mt-6 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold text-sm shadow-sm transition-colors min-h-[44px]"
            >
              <span>Mulai Paket {index + 1}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

