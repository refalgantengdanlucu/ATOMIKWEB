import { TOPICS } from '../data/topics';
import { TopicCard } from '../components/TopicCard';
import { Search, BookOpen } from 'lucide-react';

export function MateriPage() {
  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#C2410C] mb-3">
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Kurikulum Merdeka — Kimia Fase E</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#172033] tracking-tight">
          Daftar Materi Pembelajaran
        </h1>
        <p className="mt-2 text-[#475569] text-base max-w-2xl">
          Pilih topik pembelajaran di bawah ini atau gunakan pencarian untuk menemukan konsep partikel, rumus, dan model atom tertentu.
        </p>
      </div>

      {/* Search Bar Placeholder (Siap untuk Milestone M3) */}
      <div className="relative max-w-2xl">
        <label htmlFor="materi-search" className="sr-only">
          Cari materi kimia...
        </label>
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]"
            aria-hidden="true"
          />
          <input
            id="materi-search"
            type="text"
            disabled
            placeholder="Cari materi (misal: neutron, kation, Dalton, nomor massa)... [Akan aktif di M3]"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-[#F1E5D8] text-sm text-[#172033] shadow-xs cursor-not-allowed opacity-75 placeholder:text-[#64748B]"
          />
        </div>
        <p className="text-xs text-[#64748B] mt-2">
          Fitur pencarian instan sisi klien akan dihubungkan secara penuh di Milestone M3.
        </p>
      </div>

      {/* Topic List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {TOPICS.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  );
}

