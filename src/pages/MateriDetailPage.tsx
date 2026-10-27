import { useParams, useSearchParams, Link } from 'react-router-dom';
import { TOPICS } from '../data/topics';
import { ArrowLeft, BookOpen, Clock, AlertCircle } from 'lucide-react';

export function MateriDetailPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const [searchParams] = useSearchParams();
  const sectionId = searchParams.get('s');

  const topic = TOPICS.find((t) => t.id === topicId);

  if (!topic) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-red-100 text-[#B91C1C] flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-[#172033]">Topik Tidak Ditemukan</h1>
        <p className="mt-2 text-sm text-[#475569]">
          Topik materi dengan ID "{topicId}" tidak tersedia.
        </p>
        <Link
          to="/materi"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C2410C] text-white font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Daftar Materi</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/materi"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#C2410C] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Daftar Topik</span>
        </Link>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FFEDD5] text-[#C2410C]">
          {topic.sectionIds.length} Bagian Materi
        </span>
      </div>

      {/* Header Topic */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#F1E5D8] shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          {topic.title}
        </h1>
        <p className="mt-3 text-base text-[#475569] leading-relaxed">
          {topic.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2 items-center">
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

      {/* Main Content Shell Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar list of sections */}
        <div className="lg:col-span-4 space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#172033] mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
            <span>Daftar Bagian</span>
          </h2>
          <div className="space-y-1.5">
            {topic.sectionIds.map((sId, index) => {
              const isSelected = sectionId === sId || (!sectionId && index === 0);
              return (
                <div
                  key={sId}
                  className={`p-3.5 rounded-xl border text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-[#FFEDD5] border-[#F97316]/30 text-[#C2410C] font-semibold'
                      : 'bg-white border-[#F1E5D8] text-[#475569]'
                  }`}
                >
                  <div className="text-xs text-[#64748B]">Bagian {index + 1}</div>
                  <div className="truncate font-semibold">{sId}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section View Pane */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-[#B45309] border border-amber-200 mb-4">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Placeholder Milestone M1</span>
            </div>
            <h2 className="text-xl font-bold text-[#172033]">
              Bagian: {sectionId || topic.sectionIds[0]}
            </h2>
            <p className="mt-3 text-sm text-[#475569] leading-relaxed">
              Teks materi interaktif, visualisasi skematis, dan contoh bertahap untuk topik ini telah dirancang di spesifikasi PRD dan akan dimuat secara utuh pada <strong>Milestone M3</strong> (Data Konten & Halaman Materi).
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-[#F1E5D8] flex items-center justify-between text-xs text-[#64748B]">
            <span>Satu bagian materi per layar</span>
            <span>ATOMIKA Kimia Kelas X</span>
          </div>
        </div>
      </div>
    </div>
  );
}

