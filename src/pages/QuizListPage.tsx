import { Link } from 'react-router-dom';
import { TOPICS } from '../data/topics';
import { HelpCircle, Award, CheckCircle2, ArrowRight, Lock } from 'lucide-react';
import { useProgress } from '../lib/progress';
import { useAccess } from '../lib/access-context';
import type { TopicId } from '../types';

export function QuizListPage() {
  const { isQuizTopicUnlocked } = useProgress();
  const { profile } = useAccess();
  const isTeacher = profile?.role === 'teacher';

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

      {/* Komposisi dan aturan nilai */}
      <div className="p-6 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#172033] mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
          <span>Komposisi Paket Kuis</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#475569]">
          <div className="p-3 rounded-xl bg-[#FFF8F0] border border-[#F1E5D8]">
            <div className="font-bold text-[#172033] text-sm">7 Soal per Paket</div>
            <p className="mt-1">
              Tiap paket berisi 5 soal pilihan ganda dan 2 soal esai.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#FFF8F0] border border-[#F1E5D8]">
            <div className="font-bold text-[#172033] text-sm">Nilai Pilihan Ganda</div>
            <p className="mt-1">
              Nilai = (jawaban benar ÷ 5) × 100. Jawaban esai tidak dinilai otomatis.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#FFF8F0] border border-[#F1E5D8]">
            <div className="font-bold text-[#172033] text-sm">Simpan Jawaban</div>
            <p className="mt-1">
              Jawaban pilihan ganda dan esai tersimpan di browser ini. Pembahasan pilihan ganda muncul setelah dikirim.
            </p>
          </div>
        </div>
      </div>

      {/* Quiz Packages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TOPICS.map((topic, index) => {
          const isUnlocked = isTeacher || isQuizTopicUnlocked(topic.id as TopicId);

          return (
            <div
              key={topic.id}
              className={`flex flex-col justify-between p-6 rounded-2xl border shadow-xs transition-shadow ${
                isUnlocked
                  ? 'bg-white border-[#F1E5D8]'
                  : 'bg-slate-50 border-slate-200 opacity-85'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  {isUnlocked ? (
                    <span className="text-xs font-bold text-[#C2410C] bg-[#FFEDD5] px-2.5 py-0.5 rounded-full">
                      Paket {index + 1}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                      <Lock className="w-3 h-3" aria-hidden="true" />
                      Terkunci
                    </span>
                  )}
                  <span className="text-xs text-[#64748B]">5 PG · 2 Esai</span>
                </div>
                <h3 className={`font-bold text-lg mb-2 ${isUnlocked ? 'text-[#172033]' : 'text-slate-500'}`}>
                  {topic.title}
                </h3>
                <p className={`text-xs leading-relaxed mb-4 ${isUnlocked ? 'text-[#475569]' : 'text-slate-400'}`}>
                  {topic.description}
                </p>

                <div className="space-y-1.5 text-xs text-[#475569] pt-2 border-t border-[#F1E5D8]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isUnlocked ? 'text-[#15803D]' : 'text-slate-400'}`} aria-hidden="true" />
                    <span>Termasuk soal prediksi & konseptual</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isUnlocked ? 'text-[#15803D]' : 'text-slate-400'}`} aria-hidden="true" />
                    <span>Dapat diulang kapan saja</span>
                  </div>
                </div>
              </div>

              {isUnlocked ? (
                <Link
                  to={`/kuis/${topic.id}`}
                  className="mt-6 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold text-sm shadow-sm transition-colors min-h-[44px]"
                >
                  <span>Mulai Paket {index + 1}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              ) : (
                <Link
                  to={`/materi/${topic.id}`}
                  className="mt-6 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#FFF8F0] hover:bg-[#FFEDD5] text-[#C2410C] font-semibold text-xs border border-[#F1E5D8] transition-colors min-h-[44px]"
                >
                  <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Selesaikan Materi Topik {index + 1}</span>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

