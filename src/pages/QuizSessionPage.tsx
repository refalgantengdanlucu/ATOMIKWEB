import { useParams, Link } from 'react-router-dom';
import { TOPICS } from '../data/topics';
import { ArrowLeft, HelpCircle, Clock, AlertCircle } from 'lucide-react';

export function QuizSessionPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const topic = TOPICS.find((t) => t.id === topicId);

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

  return (
    <div className="space-y-8 pb-16 max-w-3xl mx-auto">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/kuis"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#C2410C] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Pilih Paket Kuis Lain</span>
        </Link>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FFEDD5] text-[#C2410C]">
          Total 5 Soal
        </span>
      </div>

      {/* Quiz Session Shell (Placeholder Milestone M1) */}
      <div className="rounded-3xl bg-white border border-[#F1E5D8] p-6 sm:p-10 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C2410C] mb-2">
          <HelpCircle className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
          <span>Sesi Kuis Berumpan Balik</span>
        </div>
        <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
          {topic.title}
        </h1>
        <p className="mt-2 text-sm text-[#475569]">
          {topic.description}
        </p>

        <div className="my-8 p-6 rounded-2xl bg-[#FFF8F0] border border-[#F1E5D8] text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-[#B45309] border border-amber-200 mb-3">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Placeholder Milestone M1</span>
          </div>
          <h2 className="text-base font-bold text-[#172033]">
            Sistem Kuis & Pembahasan Siap Dihubungkan di M5
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#475569] max-w-md mx-auto leading-relaxed">
            Bank 15 soal kurasi dengan kunci jawaban terverifikasi, umpan balik miskonsepsi spesifik, dan kalkulasi skor otomatis akan diaktifkan di <strong>Milestone M5</strong>.
          </p>
        </div>

        <div className="pt-4 border-t border-[#F1E5D8] flex items-center justify-between text-xs text-[#64748B]">
          <span>Penilaian: Nilai = (Benar ÷ 5) × 100</span>
          <span>Tersimpan di Progres Lokal</span>
        </div>
      </div>
    </div>
  );
}

