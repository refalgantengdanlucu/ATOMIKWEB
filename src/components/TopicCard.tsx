import { Link } from 'react-router-dom';
import type { Topic } from '../types';
import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';

interface TopicCardProps {
  topic: Topic;
  status?: 'not_started' | 'in_progress' | 'completed';
}

export function TopicCard({ topic, status = 'not_started' }: TopicCardProps) {
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

  return (
    <article className="flex flex-col justify-between rounded-2xl bg-white border border-[#F1E5D8] p-6 shadow-xs hover:shadow-md transition-shadow">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C2410C] bg-[#FFEDD5] px-2.5 py-1 rounded-full">
            <BookOpen className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
            <span>{topic.sectionIds.length} Bagian</span>
          </div>

          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusStyle}`}
          >
            {status === 'completed' && (
              <CheckCircle2 className="w-3 h-3 inline mr-1" aria-hidden="true" />
            )}
            {statusLabel}
          </span>
        </div>

        {/* Title & Description */}
        <h2 className="text-xl font-bold text-[#172033] tracking-tight mb-2">
          {topic.title}
        </h2>
        <p className="text-sm text-[#475569] leading-relaxed mb-4">
          {topic.description}
        </p>

        {/* Learning Objectives tags */}
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
      </div>

      {/* Button to topic */}
      <Link
        to={`/materi/${topic.id}`}
        className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#FFF8F0] hover:bg-[#FFEDD5] text-[#C2410C] font-semibold text-sm border border-[#F1E5D8] transition-colors min-h-[44px]"
      >
        <span>Buka Materi</span>
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </article>
  );
}

