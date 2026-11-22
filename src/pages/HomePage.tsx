import { Link } from 'react-router-dom';
import { ArrowRight, Atom, Award, BookOpen, HelpCircle, Users } from 'lucide-react';
import { useAccess } from '../lib/access-context';
import { StudentActivityReporter } from '../components/AccessGate';

const HOME_LINKS = [
  {
    to: '/materi',
    label: 'Materi',
    description: 'Pelajari konsep struktur atom secara bertahap.',
    icon: BookOpen,
  },
  {
    to: '/laboratorium',
    label: 'Laboratorium',
    description: 'Jelajahi simulasi partikel dan atom.',
    icon: Atom,
  },
  {
    to: '/kuis',
    label: 'Kuis',
    description: 'Latih pemahaman dengan soal interaktif.',
    icon: HelpCircle,
  },
  {
    to: '/progres',
    label: 'Progres',
    description: 'Lihat perkembangan belajar kamu.',
    icon: Award,
  },
  {
    to: '/kelas',
    label: 'Kegiatan Kelas',
    description: 'Akses aktivitas dan informasi kelas.',
    icon: Users,
  },
];

export function HomePage() {
  const { profile } = useAccess();

  return (
    <div className="space-y-8 pb-12">
      {profile && <StudentActivityReporter profile={profile} />}

      <section className="overflow-hidden rounded-3xl border border-[#F1E5D8] bg-white px-6 py-12 text-center shadow-sm sm:px-10 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFEDD5] text-[#C2410C]">
            <Atom className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#C2410C]">
            Media Pembelajaran Kimia · Fase E
          </p>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#172033] sm:text-5xl">
            Selamat datang di ATOMIKA
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#475569] sm:text-lg">
            Website pembelajaran struktur atom untuk membantu kamu memahami konsep kimia
            melalui materi, simulasi laboratorium, dan latihan yang interaktif.
          </p>
          <Link
            to="/materi"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#C2410C] px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-[#9A3412]"
          >
            Mulai Belajar
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <nav aria-label="Jelajahi fitur ATOMIKA" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {HOME_LINKS.map(({ to, label, description, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group flex min-h-28 items-center gap-4 rounded-2xl border border-[#F1E5D8] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#F97316]/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF8F0] text-[#C2410C]">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-[#172033]">{label}</span>
              <span className="mt-1 block text-sm leading-relaxed text-[#64748B]">{description}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-[#C2410C] transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        ))}
      </nav>
    </div>
  );
}
