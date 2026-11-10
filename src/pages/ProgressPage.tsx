import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TOPICS } from '../data/topics';
import { Award, RotateCcw, BookOpen, Atom, HelpCircle, Info, CheckCircle2, Lock } from 'lucide-react';
import { useProgress, resetAllProgress } from '../lib/progress';
import { useAccess } from '../lib/access-context';
import type { TopicId } from '../types';

export function ProgressPage() {
  const { progress, getTopicCompletion, isTopicUnlocked } = useProgress();
  const { profile } = useAccess();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    if (confirmReset) {
      resetAllProgress();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
    }
  };

  const totalSections = TOPICS.reduce((sum, t) => sum + t.sectionIds.length, 0);
  const totalVisited = progress.visitedSectionIds.length;
  const globalPercent = totalSections === 0 ? 0 : Math.round((totalVisited / totalSections) * 100);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#C2410C] mb-3">
          <Award className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
          <span>Progres Belajar Anonim</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#172033] tracking-tight">
          Capaian &amp; Progres Belajar
        </h1>
        <p className="mt-2 text-[#475569] text-base max-w-2xl">
          Pantau penyelesaian materi, eksperimen laboratorium, dan hasil kuis secara mandiri tanpa
          perlu membuat akun.
        </p>
      </div>

      {/* Global Progress Bar */}
      <div className="p-5 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-[#172033]">Progress Keseluruhan</span>
          <span className="text-sm font-bold text-[#C2410C]">{globalPercent}%</span>
        </div>
        <div className="h-3 bg-[#FFF8F0] rounded-full border border-[#F1E5D8] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#F97316] to-[#C2410C] transition-all duration-700"
            style={{ width: `${globalPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-[#475569]">
          {totalVisited} dari {totalSections} bagian materi telah dibaca
        </p>
      </div>

      {/* Progress Cards per Topik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TOPICS.map((topic, index) => {
          const topicId = topic.id as TopicId;
          const unlocked = profile?.role === 'teacher' || isTopicUnlocked(topicId);
          const { completedCount, totalCount, percent, isCompleted } = getTopicCompletion(topicId);

          return (
            <div
              key={topic.id}
              className={`p-6 rounded-2xl border shadow-xs flex flex-col justify-between
                ${unlocked ? 'bg-white border-[#F1E5D8]' : 'bg-slate-50 border-slate-200 opacity-75'}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full
                    ${unlocked ? 'text-[#C2410C] bg-[#FFEDD5]' : 'text-slate-500 bg-slate-100'}`}>
                    Topik {index + 1}
                  </span>
                  {!unlocked ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                      <Lock className="w-3 h-3" />
                      Terkunci
                    </span>
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
                  ) : null}
                </div>

                <h2 className={`font-bold text-base mb-3 leading-snug
                  ${unlocked ? 'text-[#172033]' : 'text-slate-500'}`}>
                  {topic.title}
                </h2>

                {/* Progress Bar per Topik */}
                {unlocked && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="text-[#475569]">Materi dibaca</span>
                      <span className="font-bold text-[#C2410C]">
                        {completedCount}/{totalCount}
                      </span>
                    </div>
                    <div className="h-2 bg-[#FFF8F0] rounded-full border border-[#F1E5D8] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isCompleted ? 'bg-[#15803D]' : 'bg-gradient-to-r from-[#F97316] to-[#C2410C]'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Activity Checklist */}
                <div className="space-y-2.5 text-xs text-[#475569]">
                  <div className={`flex items-center gap-2 p-2 rounded-lg border
                    ${unlocked && isCompleted
                      ? 'bg-green-50 border-green-200 text-[#15803D]'
                      : 'bg-[#FFF8F0] border-[#F1E5D8]'}`}>
                    {unlocked && isCompleted
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
                      : <BookOpen className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />}
                    <span>
                      {unlocked
                        ? `Materi (${completedCount}/${totalCount} bagian dibaca)`
                        : `Materi (${totalCount} bagian — terkunci)`}
                    </span>
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

              {unlocked ? (
                <Link
                  to={`/materi/${topic.id}`}
                  className="mt-6 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#FFF8F0] hover:bg-[#FFEDD5] text-[#C2410C] font-semibold text-xs border border-[#F1E5D8] transition-colors min-h-[44px]"
                >
                  <span>{isCompleted ? 'Ulangi Topik' : `Lanjutkan Topik ${index + 1}`}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-6 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-semibold text-xs border border-slate-200 cursor-not-allowed min-h-[44px]"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Selesaikan Topik Sebelumnya</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Info & Reset */}
      <div className="p-6 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-orange-100 text-[#C2410C] shrink-0 mt-0.5">
            <Info className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#172033]">Keterangan Penyimpanan Peramban</h3>
            <p className="text-xs text-[#475569] mt-1 max-w-xl leading-relaxed">
              Progres hanya tersimpan di peramban dan perangkat ini (kunci{' '}
              <code>atomika-progress-v1</code>). Data tidak dikirim ke server mana pun.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {confirmReset && (
            <p className="text-xs font-semibold text-[#B91C1C] text-right max-w-[200px]">
              Klik sekali lagi untuk konfirmasi reset. Tindakan ini tidak dapat dibatalkan!
            </p>
          )}
          <button
            type="button"
            onClick={handleReset}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors min-h-[40px]
              ${confirmReset
                ? 'bg-red-100 border-2 border-red-400 text-[#B91C1C]'
                : 'border border-red-200 text-[#B91C1C] bg-red-50/50 hover:bg-red-100'}`}
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>{confirmReset ? 'Ya, Reset Semua Progres' : 'Reset Progres'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
