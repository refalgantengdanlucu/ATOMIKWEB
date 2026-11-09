import { Link } from 'react-router-dom';
import type { Topic } from '../types';
import type { TopicId } from '../types';
import { ArrowRight, BookOpen, CheckCircle2, Lock } from 'lucide-react';

interface TopicCardProps {
  topic: Topic;
  /** Apakah topik ini dapat dibuka? */
  unlocked: boolean;
  /** Status progres */
  status?: 'not_started' | 'in_progress' | 'completed';
  /** Pesan yang menjelaskan mengapa terkunci (opsional) */
  lockedMessage?: string;
}

export function TopicCard({
  topic,
  unlocked,
  status = 'not_started',
  lockedMessage,
}: TopicCardProps) {
  const statusLabel = {
    not_started: 'Belum Mulai',
    in_progress: 'Sedang Belajar',
    completed: 'Selesai',
  }[status];

  const statusStyle = {
    not_started: 'bg-slate-100 text-slate-600 border-slate-200',
    in_progress: 'bg-amber-50 text-[#B45309] border-amber-200',
    completed: 'bg-green-50 text-[#15803D] border-green-200',
  }[status];

  const isLocked = !unlocked;

  return (
    <article
      className={`flex flex-col justify-between rounded-2xl border p-6 shadow-xs transition-shadow
        ${
          isLocked
            ? 'bg-slate-50 border-slate-200 opacity-80'
            : 'bg-white border-[#F1E5D8] hover:shadow-md'
        }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full
              ${isLocked ? 'bg-slate-100 text-slate-500' : 'bg-[#FFEDD5] text-[#C2410C]'}`}
          >
            {isLocked ? (
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <BookOpen className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
            )}
            <span>{topic.sectionIds.length} Bagian</span>
          </div>

          {isLocked ? (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-500 border-slate-200 flex items-center gap-1">
              <Lock className="w-3 h-3" aria-hidden="true" />
              Terkunci
            </span>
          ) : (
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusStyle}`}
            >
              {status === 'completed' && (
                <CheckCircle2 className="w-3 h-3 inline mr-1" aria-hidden="true" />
              )}
              {statusLabel}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h2
          className={`text-xl font-bold tracking-tight mb-2 ${
            isLocked ? 'text-slate-500' : 'text-[#172033]'
          }`}
        >
          {topic.title}
        </h2>
        <p
          className={`text-sm leading-relaxed mb-4 ${
            isLocked ? 'text-slate-400' : 'text-[#475569]'
          }`}
        >
          {topic.description}
        </p>

        {/* Learning Objectives */}
        {!isLocked && (
          <div className="mb-6">
            <div className="text-xs font-semibold text-[#172033] uppercase tracking-wider mb-2">
              Target Capaian:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topic.learningObjectives.map((tp) => (
                <span
                  key={tp}
                  className="px-2 py-0.5 rounded-md text-xs font-medium bg-[#FFF8F0] border border-[#F1E5D8] text-[#475569]"
                >
                  {tp}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Locked message */}
        {isLocked && lockedMessage && (
          <div className="mb-5 p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 leading-relaxed flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{lockedMessage}</span>
          </div>
        )}
      </div>

      {/* CTA Button */}
      {isLocked ? (
        <button
          type="button"
          disabled
          aria-label={`Topik ${topic.title} masih terkunci. ${lockedMessage ?? ''}`}
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-semibold text-sm border border-slate-200 cursor-not-allowed min-h-[44px]"
        >
          <Lock className="w-4 h-4" aria-hidden="true" />
          <span>Terkunci</span>
        </button>
      ) : (
        <Link
          to={`/materi/${topic.id as TopicId}`}
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#FFF8F0] hover:bg-[#FFEDD5] text-[#C2410C] font-semibold text-sm border border-[#F1E5D8] transition-colors min-h-[44px]"
        >
          <span>{status === 'in_progress' ? 'Lanjutkan Membaca' : 'Buka Materi'}</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      )}
    </article>
  );
}
