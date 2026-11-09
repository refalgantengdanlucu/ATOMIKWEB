import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { TOPICS } from '../data/topics';
import { SECTIONS } from '../data/sections';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Atom,
  AlertCircle,
  ExternalLink,
  Lock,
  Menu,
  X,
} from 'lucide-react';
import { useProgress, isSectionUnlocked, isTopicUnlocked } from '../lib/progress';
import { useAccess } from '../lib/access-context';
import type { TopicId } from '../types';

export function MateriDetailPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { progress, markAsRead } = useProgress();
  const { profile } = useAccess();
  const visited = progress.visitedSectionIds;

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const topic = TOPICS.find((t) => t.id === topicId);
  const topicSections = SECTIONS.filter((s) => s.topicId === topicId).sort(
    (a, b) => a.order - b.order
  );

  const isTeacher = profile?.role === 'teacher';
  const topicUnlocked =
    isTeacher ||
    (topicId === 't1' && isTopicUnlocked(topicId as TopicId, visited));

  // --- Tentukan bagian aktif ---
  const requestedSectionId = searchParams.get('s');
  const firstUnlockedSection = isTeacher
    ? topicSections[0]
    : topicSections.find((s) => isSectionUnlocked(topicId as TopicId, s.id, visited));

  // Jika bagian yang diminta masih terkunci, fallback ke bagian pertama yang terbuka
  const requestedSection = topicSections.find((s) => s.id === requestedSectionId);
  const canAccessRequested = Boolean(
    requestedSection &&
    (isTeacher || isSectionUnlocked(topicId as TopicId, requestedSection.id, visited))
  );

  const activeSection = canAccessRequested
    ? requestedSection
    : firstUnlockedSection ?? topicSections[0];

  const currentIndex = topicSections.findIndex((s) => s.id === activeSection?.id);
  const prevSection = currentIndex > 0 ? topicSections[currentIndex - 1] : null;
  const nextSection =
    currentIndex >= 0 && currentIndex < topicSections.length - 1
      ? topicSections[currentIndex + 1]
      : null;

  // --- Auto-tandai sebagai telah dibaca setiap kali bagian aktif berubah ---
  const prevActiveSectionIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (activeSection && activeSection.id !== prevActiveSectionIdRef.current) {
      prevActiveSectionIdRef.current = activeSection.id;
      markAsRead(activeSection.id);
    }
  }, [activeSection, markAsRead]);

  if (!topic || topicSections.length === 0) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-red-100 text-[#B91C1C] flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-[#172033]">Topik Tidak Ditemukan</h1>
        <p className="mt-2 text-sm text-[#475569]">
          Topik materi dengan ID "{topicId}" tidak tersedia dalam kurikulum ATOMIKA.
        </p>
        <Link to="/materi" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C2410C] text-white font-semibold text-sm">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Daftar Materi</span>
        </Link>
      </div>
    );
  }

  if (!topicUnlocked) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#FFEDD5] text-[#C2410C] flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-[#172033]">Topik Masih Terkunci</h1>
        <p className="mt-3 text-sm text-[#475569] leading-relaxed max-w-sm mx-auto">
          Topik ini terkunci untuk akses siswa. Minta guru membuka akses melalui Dashboard Guru.
        </p>
        <Link to="/materi" className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C2410C] text-white font-semibold text-sm">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Daftar Topik</span>
        </Link>
      </div>
    );
  }

  const handleSectionClick = (sectionId: string) => {
    const unlocked =
      isTeacher || isSectionUnlocked(topicId as TopicId, sectionId, visited);
    if (unlocked) {
      setSearchParams({ s: sectionId });
      setSidebarOpen(false);
    }
  };

  const handleNextSection = () => {
    if (nextSection) {
      setSearchParams({ s: nextSection.id });
      setSidebarOpen(false);
    }
  };

  const handlePrevSection = () => {
    if (prevSection) {
      setSearchParams({ s: prevSection.id });
      setSidebarOpen(false);
    }
  };

  // Helper: apakah bagian sudah dibaca
  const isSectionRead = (sectionId: string) => visited.includes(sectionId);

  // Helper render body
  const renderFormattedBody = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let tableBuffer: string[] = [];
    let inTable = false;

    const flushTable = (keyPrefix: number) => {
      if (tableBuffer.length < 2) {
        tableBuffer = [];
        inTable = false;
        return;
      }
      const headerLine = tableBuffer[0];
      const dataLines = tableBuffer.slice(2);
      const headers = headerLine
        .split('|')
        .map((h) => h.trim())
        .filter((h) => h.length > 0);

      elements.push(
        <div
          key={`table-${keyPrefix}`}
          className="my-6 overflow-x-auto rounded-xl border border-[#F1E5D8] bg-white shadow-xs"
        >
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[#FFEDD5]/50 border-b border-[#F1E5D8]">
                {headers.map((h, hIdx) => (
                  <th key={hIdx} className="py-2.5 px-3.5 font-bold text-[#172033]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1E5D8]/70">
              {dataLines.map((rowLine, rIdx) => {
                const cells = rowLine
                  .split('|')
                  .map((c) => c.trim())
                  .filter((c) => c.length > 0);
                return (
                  <tr key={rIdx} className="hover:bg-orange-50/30 transition-colors">
                    {cells.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-3.5 text-[#475569]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      tableBuffer = [];
      inTable = false;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        tableBuffer.push(trimmed);
        return;
      } else if (inTable) {
        flushTable(index);
      }

      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3
            key={index}
            className="text-lg sm:text-xl font-bold text-[#172033] mt-6 mb-2 tracking-tight flex items-center gap-2 border-b border-[#F1E5D8] pb-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-[#F97316]" />
            <span>{trimmed.replace('### ', '')}</span>
          </h3>
        );
      } else if (trimmed.startsWith('> ')) {
        elements.push(
          <div
            key={index}
            className="my-4 p-4 rounded-xl bg-[#FFF8F0] border-l-4 border-[#C2410C] text-xs sm:text-sm text-[#172033] leading-relaxed shadow-xs"
          >
            {trimmed.replace('> ', '')}
          </div>
        );
      } else if (trimmed.startsWith('---')) {
        elements.push(<hr key={index} className="my-6 border-t border-[#F1E5D8]" />);
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <li key={index} className="ml-5 list-disc text-sm text-[#475569] my-1 leading-relaxed">
            {trimmed.substring(2)}
          </li>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        elements.push(
          <li
            key={index}
            className="ml-5 list-decimal text-sm text-[#475569] my-1 leading-relaxed"
          >
            {trimmed.replace(/^\d+\.\s/, '')}
          </li>
        );
      } else if (trimmed.length > 0) {
        elements.push(
          <p key={index} className="text-sm sm:text-base text-[#475569] my-3 leading-relaxed">
            {trimmed}
          </p>
        );
      }
    });

    if (inTable) flushTable(lines.length);
    return elements;
  };

  const isLastSection = !nextSection;
  const allTopicSectionsRead = topicSections.every((s) => isSectionRead(s.id));

  return (
    <div className="pb-16">
      {/* Breadcrumb & Progress Badge */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/materi"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#C2410C] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Daftar Topik</span>
        </Link>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FFEDD5] text-[#C2410C] border border-[#F97316]/30">
          {visited.filter((id) => topicSections.some((s) => s.id === id)).length} /{' '}
          {topicSections.length} dibaca
        </span>
      </div>

      {/* Header Topik */}
      <div className="p-5 sm:p-8 rounded-3xl bg-white border border-[#F1E5D8] shadow-xs mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#C2410C] mb-3">
          <BookOpen className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
          <span>Materi Kurikulum Kemendikbud KD 3.2</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          {topic.title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#475569] leading-relaxed">
          {topic.description}
        </p>
        <div className="mt-4 pt-4 border-t border-[#F1E5D8] flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-[#172033]">Target Capaian:</span>
          {topic.learningObjectives.map((tp) => (
            <span
              key={tp}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-[#FFF8F0] border border-[#F1E5D8] text-[#475569]"
            >
              {tp}
            </span>
          ))}
        </div>
      </div>

      {/* Mobile: tombol buka daftar bagian */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#F1E5D8] bg-white text-[#172033] text-sm font-semibold shadow-xs"
        >
          <Menu className="w-4 h-4 text-[#F97316]" />
          <span>Daftar Bagian Materi</span>
          <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFEDD5] text-[#C2410C]">
            {currentIndex + 1} / {topicSections.length}
          </span>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#F1E5D8]">
              <h2 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#F97316]" />
                <span>Daftar Bagian ({topicSections.length})</span>
              </h2>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-orange-50 text-[#64748B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
              <SectionNavList
                sections={topicSections}
                activeSection={activeSection}
                topicId={topicId as TopicId}
                visited={visited}
                isTeacher={isTeacher}
                onSelect={handleSectionClick}
                isSectionRead={isSectionRead}
              />
            </nav>
            <div className="p-3 border-t border-[#F1E5D8]">
              <Link
                to="/laboratorium"
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF8F0] hover:bg-[#FFEDD5] text-[#C2410C] text-xs font-semibold border border-[#F1E5D8] transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Atom className="w-4 h-4 text-[#F97316]" />
                  Praktik di Laboratorium
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop: Grid Layout Sidebar + Artikel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Sidebar */}
        <aside
          aria-label="Daftar Bagian Materi"
          className="hidden lg:block lg:col-span-4 bg-white rounded-2xl border border-[#F1E5D8] shadow-xs sticky top-20 overflow-hidden"
        >
          <div className="p-4 border-b border-[#F1E5D8]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
              <span>Daftar Bagian ({topicSections.length})</span>
            </h2>
          </div>

          {/* Scrollable nav — max height agar tidak menutupi artikel */}
          <nav
            className="overflow-y-auto p-3 space-y-1.5"
            style={{ maxHeight: 'calc(100vh - 14rem)' }}
          >
            <SectionNavList
              sections={topicSections}
              activeSection={activeSection}
              topicId={topicId as TopicId}
              visited={visited}
              isTeacher={isTeacher}
              onSelect={handleSectionClick}
              isSectionRead={isSectionRead}
            />
          </nav>

          <div className="p-3 border-t border-[#F1E5D8]">
            <Link
              to="/laboratorium"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF8F0] hover:bg-[#FFEDD5] text-[#C2410C] text-xs font-semibold border border-[#F1E5D8] transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Atom className="w-4 h-4 text-[#F97316]" />
                Praktik di Laboratorium
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>

        {/* Artikel Konten — TIDAK tertutup sidebar */}
        <article className="lg:col-span-8 p-5 sm:p-10 rounded-3xl bg-white border border-[#F1E5D8] shadow-xs flex flex-col min-h-[520px]">
          {/* Bagian Header */}
          <div className="border-b border-[#F1E5D8] pb-4 mb-6">
            <span className="text-xs font-bold text-[#C2410C] uppercase tracking-wider">
              Bagian {currentIndex + 1} dari {topicSections.length}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#172033] mt-1 tracking-tight">
              {activeSection?.title}
            </h2>
          </div>

          {/* Konten Materi */}
          <div className="prose prose-orange max-w-none flex-1">
            {activeSection && renderFormattedBody(activeSection.body)}
          </div>

          {/* Navigasi Sebelumnya / Berikutnya */}
          <div className="mt-10 pt-6 border-t border-[#F1E5D8] flex flex-wrap items-center justify-between gap-4">
            {prevSection ? (
              <button
                type="button"
                onClick={handlePrevSection}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFF8F0] hover:bg-[#FFEDD5] text-[#C2410C] text-xs sm:text-sm font-semibold border border-[#F1E5D8] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Bagian Sebelumnya</span>
              </button>
            ) : (
              <div />
            )}

            {!isLastSection ? (
              <button
                type="button"
                onClick={handleNextSection}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <span>Bagian Berikutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : allTopicSectionsRead ? (
              <button
                type="button"
                onClick={() => navigate('/materi')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#15803D] hover:bg-green-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>✓ Topik Selesai — Kembali ke Daftar</span>
              </button>
            ) : (
              <div className="text-xs text-[#C2410C] font-semibold bg-[#FFEDD5] px-4 py-2 rounded-xl border border-[#F97316]/30">
                Baca semua bagian sebelumnya terlebih dahulu
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Komponen Pembantu: Daftar Navigasi Bagian (reusable)
// ─────────────────────────────────────────────────────────
interface SectionNavListProps {
  sections: { id: string; title: string; order: number }[];
  activeSection: { id: string } | null | undefined;
  topicId: TopicId;
  visited: string[];
  isTeacher: boolean;
  onSelect: (id: string) => void;
  isSectionRead: (id: string) => boolean;
}

function SectionNavList({
  sections,
  activeSection,
  topicId,
  visited,
  isTeacher,
  onSelect,
  isSectionRead,
}: SectionNavListProps) {
  return (
    <>
      {sections.map((sec, index) => {
        const isSelected = activeSection?.id === sec.id;
        const unlocked = isTeacher || isSectionUnlocked(topicId, sec.id, visited);
        const read = isSectionRead(sec.id);

        return (
          <button
            key={sec.id}
            type="button"
            disabled={!unlocked}
            onClick={() => onSelect(sec.id)}
            title={!unlocked ? 'Selesaikan bagian sebelumnya terlebih dahulu' : sec.title}
            className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all duration-150 flex items-start gap-2.5
              ${
                isSelected
                  ? 'bg-[#FFEDD5] border-[#F97316]/40 text-[#C2410C] font-bold shadow-xs'
                  : unlocked
                  ? 'bg-white border-[#F1E5D8] text-[#475569] hover:bg-orange-50/50 hover:text-[#172033] cursor-pointer'
                  : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-70'
              }`}
          >
            {/* Nomor / Status icon */}
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold
                ${
                  isSelected
                    ? 'bg-[#C2410C] text-white'
                    : read
                    ? 'bg-green-100 text-[#15803D] border border-green-200'
                    : unlocked
                    ? 'bg-[#FFF8F0] text-[#64748B] border border-[#F1E5D8]'
                    : 'bg-slate-200 text-slate-400'
                }`}
            >
              {read && !isSelected ? (
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              ) : !unlocked ? (
                <Lock className="w-3 h-3" aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>

            {/* Judul bagian */}
            <div className="flex-1 min-w-0 leading-snug">
              <div className="truncate">{sec.title}</div>
              {!unlocked && (
                <div className="text-[10px] text-slate-400 mt-0.5">Terkunci</div>
              )}
            </div>
          </button>
        );
      })}
    </>
  );
}
