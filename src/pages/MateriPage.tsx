import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TOPICS } from '../data/topics';
import { SECTIONS } from '../data/sections';
import { TopicCard } from '../components/TopicCard';
import { Search, BookOpen, X, ArrowRight, Sparkles } from 'lucide-react';
import { useProgress } from '../lib/progress';
import type { TopicId, TopicStatus } from '../types';

export function MateriPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { progress, isTopicUnlocked, isSectionUnlocked, getTopicCompletion } = useProgress();
  const visited = progress.visitedSectionIds;

  // Algoritma pencarian berbobot sisi klien (PRD Bagian 7.1)
  const searchResults = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (trimmed.length < 2) return [];

    const tokens = trimmed.split(/\s+/).filter(Boolean);

    return SECTIONS.map((sec) => {
      let score = 0;
      const titleLower = sec.title.toLowerCase();
      const bodyLower = sec.body.toLowerCase();
      const keywordsLower = sec.keywords.map((k) => k.toLowerCase());

      const matchesAllTokens = tokens.every((token) => {
        const inTitle = titleLower.includes(token);
        const inKeywords = keywordsLower.some((k) => k.includes(token));
        const inBody = bodyLower.includes(token);

        if (inTitle) score += 3;
        if (inKeywords) score += 2;
        if (inBody) score += 1;

        return inTitle || inKeywords || inBody;
      });

      return { section: sec, score, matches: matchesAllTokens };
    })
      .filter((item) => item.matches && item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((item) => item.section);
  }, [searchQuery]);

  const hasQuery = searchQuery.trim().length >= 2;

  /** Hitung status tiap topik untuk TopicCard */
  const getTopicStatus = (topicId: TopicId): TopicStatus => {
    const { completedCount, isCompleted } = getTopicCompletion(topicId);
    if (isCompleted) return 'completed';
    if (completedCount > 0) return 'in_progress';
    return 'not_started';
  };

  /** Pesan kunci per topik */
  const getLockedMessage = (topicId: TopicId): string => {
    if (topicId === 't2') {
      return 'Selesaikan seluruh bagian Topik 1 (Struktur Atom & Partikel Penyusunnya) terlebih dahulu.';
    }
    if (topicId === 't3') {
      return 'Selesaikan seluruh bagian Topik 1 dan Topik 2 terlebih dahulu.';
    }
    return '';
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#C2410C] mb-3">
          <BookOpen className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
          <span>Kurikulum Kemendikbud KD 3.2 — Struktur Atom</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#172033] tracking-tight">
          Buku Materi Pembelajaran
        </h1>
        <p className="mt-2 text-[#475569] text-base max-w-2xl">
          Eksplorasi konsep struktur atom secara mendalam. Materi harus dibaca secara berurutan —
          topik berikutnya terbuka setelah topik sebelumnya selesai dibaca.
        </p>
      </div>

      {/* Search Bar Fungsional */}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari konsep materi (misal: neutron, kation, Dalton, sinar katoda)..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white border border-[#F1E5D8] focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 text-sm text-[#172033] shadow-xs outline-hidden placeholder:text-[#64748B] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#172033] p-1 rounded-full hover:bg-orange-50"
              aria-label="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tampilan Hasil Pencarian atau Daftar 3 Topik */}
      {hasQuery ? (
        <section aria-label="Hasil Pencarian Materi" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#172033]">
              Hasil Pencarian untuk "{searchQuery}" ({searchResults.length})
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-[#C2410C] hover:underline"
            >
              Tampilkan Semua Topik
            </button>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {searchResults.map((sec) => {
                const parentTopic = TOPICS.find((t) => t.id === sec.topicId);
                const sectionUnlocked = isSectionUnlocked(sec.topicId as TopicId, sec.id);
                return (
                  <div key={sec.id} className="relative">
                    {sectionUnlocked ? (
                      <Link
                        to={`/materi/${sec.topicId}?s=${sec.id}`}
                        className="p-5 rounded-2xl bg-white border border-[#F1E5D8] hover:border-[#F97316] shadow-xs transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-[#C2410C] font-semibold mb-1">
                            <Sparkles className="w-3 h-3 text-[#F97316]" />
                            <span>{parentTopic?.title}</span>
                          </div>
                          <h3 className="font-bold text-base text-[#172033] group-hover:text-[#C2410C] transition-colors">
                            {sec.title}
                          </h3>
                          <p className="text-xs text-[#475569] mt-2 line-clamp-2">
                            {sec.body.replace(/[#*`>|]/g, '').trim()}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#F1E5D8] text-xs font-semibold text-[#C2410C] flex items-center justify-between">
                          <span>Buka Bagian Ini</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </Link>
                    ) : (
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex flex-col justify-between opacity-70">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                            <Sparkles className="w-3 h-3 text-slate-400" />
                            <span>{parentTopic?.title}</span>
                          </div>
                          <h3 className="font-bold text-base text-slate-500">{sec.title}</h3>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                          <span>🔒 Selesaikan topik sebelumnya dulu</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-[#F1E5D8] text-center max-w-md mx-auto">
              <p className="text-sm font-bold text-[#172033]">Materi tidak ditemukan</p>
              <p className="text-xs text-[#475569] mt-1">
                Coba gunakan kata kunci lain seperti: <strong>neutron</strong>,{' '}
                <strong>kation</strong>, <strong>Dalton</strong>, <strong>nomor massa</strong>, atau{' '}
                <strong>Thomson</strong>.
              </p>
            </div>
          )}
        </section>
      ) : (
        /* Tiga Kartu Topik Utama dengan status kunci */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {TOPICS.map((topic) => {
            const unlocked = isTopicUnlocked(topic.id as TopicId);
            const status = getTopicStatus(topic.id as TopicId);
            const lockedMessage = unlocked ? undefined : getLockedMessage(topic.id as TopicId);
            return (
              <TopicCard
                key={topic.id}
                topic={topic}
                unlocked={unlocked}
                status={status}
                lockedMessage={lockedMessage}
              />
            );
          })}
        </div>
      )}

      {/* Petunjuk Progres Global */}
      <div className="p-4 rounded-2xl bg-[#FFF8F0] border border-[#F97316]/20 text-xs text-[#475569] flex items-start gap-2.5">
        <span className="text-base shrink-0">📖</span>
        <span>
          <strong className="text-[#172033]">Cara Membaca:</strong> Buka setiap bagian secara
          berurutan dari nomor 1. Topik berikutnya otomatis terbuka setelah semua bagian topik
          sebelumnya selesai dibaca.{' '}
          <span className="font-semibold text-[#C2410C]">
            {visited.length} bagian telah dibaca
          </span>
          {' '}dari total{' '}
          {TOPICS.reduce((sum, t) => sum + t.sectionIds.length, 0)} bagian.
        </span>
      </div>
    </div>
  );
}
