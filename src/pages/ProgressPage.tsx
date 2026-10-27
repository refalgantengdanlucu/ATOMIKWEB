import { Link } from 'react-router-dom';
import { TOPICS } from '../data/topics';
import {
  Award,
  RotateCcw,
  BookOpen,
  Atom,
  HelpCircle,
  Info,
} from 'lucide-react';

export function ProgressPage() {
  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#C2410C] mb-3">
          <Award className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
          <span>Progres Belajar Anonim</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#172033] tracking-tight">
          Capaian & Progres Belajar
        </h1>
        <p className="mt-2 text-[#475569] text-base max-w-2xl">
          Pantau penyelesaian materi, eksperimen laboratorium, dan hasil kuis berumpan balik Anda secara mandiri tanpa perlu membuat akun.
        </p>
      </div>

      {/* Progress Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TOPICS.map((topic, index) => (
          <div
            key={topic.id}
            className="p-6 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#C2410C] bg-[#FFEDD5] px-2.5 py-0.5 rounded-full">
                  Topik {index + 1}
                </span>
                <span className="text-xs font-semibold text-[#64748B]">
                  0 / 3 Aktivitas
                </span>
              </div>
              <h2 className="font-bold text-base text-[#172033] mb-4">
                {topic.title}
              </h2>

              {/* 3 Activity items checklist per topic */}
              <div className="space-y-2.5 text-xs text-[#475569]">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FFF8F0] border border-[#F1E5D8]">
                  <BookOpen className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
                  <span>Materi ({topic.sectionIds.length} bagian dibaca)</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FFF8F0] border border-[#F1E5D8]">
                  <Atom className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
                  <span>Praktik Lab Topik {index + 1}</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FFF8F0] border border-[#F1E5D8]">
                  <HelpCircle className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
                  <span>Kuis Berumpan Balik</span>
                </div>
              </div>
            </div>

            <Link
              to={`/materi/${topic.id}`}
              className="mt-6 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#FFF8F0] hover:bg-[#FFEDD5] text-[#C2410C] font-semibold text-xs border border-[#F1E5D8] transition-colors min-h-[44px]"
            >
              <span>Lanjutkan Topik {index + 1}</span>
            </Link>
          </div>
        ))}
      </div>

      {/* Info & Reset Actions */}
      <div className="p-6 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-orange-100 text-[#C2410C] shrink-0 mt-0.5">
            <Info className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#172033]">
              Keterangan Penyimpanan Peramban
            </h3>
            <p className="text-xs text-[#475569] mt-1 max-w-xl leading-relaxed">
              Progres hanya tersimpan di peramban dan perangkat ini (kunci <code>atomika-progress-v1</code>). Fitur kalkulasi progres dan dialog reset dengan konfirmasi akan aktif di <strong>Milestone M6</strong>.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-[#B91C1C] bg-red-50/50 text-xs font-semibold opacity-70 cursor-not-allowed shrink-0"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>Reset Progres</span>
        </button>
      </div>
    </div>
  );
}

