import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Atom, GraduationCap, LockKeyhole, UserRound } from 'lucide-react';
import { TEACHER_NAMES, TEACHER_PIN } from '../lib/classroom';
import { useAccess } from '../lib/access-context';
import { CLASSROOM_STORAGE_KEYS, readClassroomData, writeClassroomData } from '../lib/classroom';
import type { StudentActivity } from '../lib/classroom';
import { sendActivityToSheets } from '../lib/classroom-sync';
import { TOPICS } from '../data/topics';
import { SECTIONS } from '../data/sections';
import type { AccessProfile } from '../lib/access-context';
import { Layout } from './Layout';

const panelClass = 'rounded-3xl border border-[#F1E5D8] bg-white p-6 shadow-sm sm:p-9';
const inputClass = 'min-h-12 w-full rounded-xl border border-[#E8D8C8] bg-white px-4 text-base text-[#172033] outline-none focus:border-[#C2410C] focus:ring-2 focus:ring-orange-100';
const primaryButtonClass = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#C2410C] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#9A3412] disabled:cursor-not-allowed disabled:opacity-50';

type SelectedRole = 'student' | 'teacher' | null;

export function AccessGate({ children }: { children: ReactNode }) {
  const { profile } = useAccess();
  const location = useLocation();

  if (!profile) return <AccessLanding />;

  const blockedForStudent = profile.role === 'student' && (
    location.pathname.startsWith('/laboratorium') ||
    location.pathname.startsWith('/lab') ||
    location.pathname.startsWith('/kuis') ||
    location.pathname.startsWith('/progres')
  );

  if (blockedForStudent) {
    return (
      <Layout>
        <StudentActivityReporter profile={profile} blocked />
        <section className={`${panelClass} mx-auto max-w-xl text-center`}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-[#C2410C]">
            <LockKeyhole className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#172033]">Modul ini masih terkunci</h1>
          <p className="mt-2 text-sm leading-6 text-[#475569]">
            Akses siswa dimulai dari Topik 1. Laboratorium Virtual dan Evaluasi hanya dapat dibuka melalui Akses Guru.
          </p>
          <Link to="/materi" className={`${primaryButtonClass} mt-6`}>Kembali ke Topik 1</Link>
        </section>
      </Layout>
    );
  }

  return (
    <>
      <StudentActivityReporter profile={profile} />
      {children}
    </>
  );
}

function StudentActivityReporter({ profile, blocked = false }: { profile: AccessProfile; blocked?: boolean }) {
  const location = useLocation();

  const reportActivity = useCallback((sectionId?: string) => {
    if (profile.role !== 'student') return;

    const section = TOPICS.find((topic) => location.pathname === `/materi/${topic.id}`);
    const labMode = location.pathname.match(/^\/(?:laboratorium|lab)\/(partikel|kalkulator|ion)$/)?.[1];
    const quiz = location.pathname.match(/^\/kuis\/(t[123])$/)?.[1];
    const activity = section
      ? `Materi · ${section.title}`
      : location.pathname === '/materi'
        ? 'Materi · daftar topik'
        : labMode
          ? `Laboratorium · ${labMode === 'partikel' ? 'Lab Partikel' : labMode === 'kalkulator' ? 'Kalkulator Partikel' : 'Simulator Ion'}`
          : quiz
            ? `Evaluasi · Kuis ${quiz.toUpperCase()}`
            : location.pathname === '/kelas'
              ? location.search.startsWith('?aktivitas=') ? 'Kegiatan kelas · ' + location.search.slice(11) : 'Kegiatan kelas'
              : 'Beranda';
    const currentActivity = blocked ? `${activity} · akses terkunci` : activity;

    const visitKey = `atomika-student-visits-v1:${profile.name.trim().toLocaleLowerCase('id-ID')}|${profile.className.trim().toLocaleLowerCase('id-ID')}`;
    let visitedSectionIds: string[] = [];
    try {
      const savedVisits = window.localStorage.getItem(visitKey);
      visitedSectionIds = savedVisits ? JSON.parse(savedVisits) as string[] : [];
    } catch (error) {
      console.error('Gagal membaca progres topik siswa:', error);
    }
    if (sectionId && SECTIONS.some((item) => item.id === sectionId) && !visitedSectionIds.includes(sectionId)) {
      visitedSectionIds = [...visitedSectionIds, sectionId];
      try {
        window.localStorage.setItem(visitKey, JSON.stringify(visitedSectionIds));
      } catch (error) {
        console.error('Gagal menyimpan progres topik siswa:', error);
      }
    }
    const progressSummary = TOPICS.map((topic, index) => {
      const count = topic.sectionIds.filter((id) => visitedSectionIds.includes(id)).length;
      return `T${index + 1} ${count}/${topic.sectionIds.length}`;
    }).join(' · ');
    const record: StudentActivity = {
      name: profile.name,
      className: profile.className,
      activity: currentActivity,
      path: `${location.pathname}${location.search}`,
      progressSummary,
      lastSeen: new Date().toISOString(),
    };
    const activities = readClassroomData<StudentActivity[]>(CLASSROOM_STORAGE_KEYS.activity, []);
    const studentKey = `${profile.name.trim().toLocaleLowerCase('id-ID')}|${profile.className.trim().toLocaleLowerCase('id-ID')}`;
    const nextActivities = [
      ...activities.filter((item) => `${item.name.trim().toLocaleLowerCase('id-ID')}|${item.className.trim().toLocaleLowerCase('id-ID')}` !== studentKey),
      record,
    ];
    writeClassroomData(CLASSROOM_STORAGE_KEYS.activity, nextActivities);
    void sendActivityToSheets(profile, record);
  }, [blocked, location.pathname, location.search, profile]);

  useEffect(() => {
    reportActivity();
    const onSectionRead = (event: Event) => {
      const detail = (event as CustomEvent<{ sectionId: string }>).detail;
      if (detail?.sectionId) reportActivity(detail.sectionId);
    };
    window.addEventListener('atomika-student-section-read', onSectionRead);
    return () => window.removeEventListener('atomika-student-section-read', onSectionRead);
  }, [reportActivity]);

  return null;
}

function AccessLanding() {
  const { enter } = useAccess();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null);
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('');
  const [teacherName, setTeacherName] = useState<string>(TEACHER_NAMES[0]);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const startStudent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = studentName.trim().replace(/\s+/g, ' ');
    const studentClass = className.trim().replace(/\s+/g, ' ');
    if (!name || !studentClass) {
      setError('Nama lengkap dan kelas wajib diisi.');
      return;
    }
    enter({ role: 'student', name, className: studentClass });
    navigate('/materi', { replace: true });
  };

  const startTeacher = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pin !== TEACHER_PIN) {
      setError('PIN Guru Tidak Valid');
      return;
    }
    enter({ role: 'teacher', name: teacherName });
    navigate('/kelas', { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF8F0] px-4 py-10 text-[#172033]">
      <div className="w-full max-w-3xl">
        <header className="mb-7 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F97316] to-[#C2410C] text-white shadow-sm">
            <Atom className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C2410C]">ATOMIKA · Kimia SMA</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Selamat datang</h1>
          <p className="mt-2 text-sm text-[#64748B]">Pilih akses untuk mulai menggunakan aplikasi.</p>
        </header>

        {selectedRole === null ? (
          <section className={panelClass}>
            <div className="grid gap-4 sm:grid-cols-2">
              <button type="button" onClick={() => { setSelectedRole('student'); setError(''); }} className="group rounded-2xl border-2 border-[#F1E5D8] p-6 text-left transition hover:border-[#F97316] hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-[#C2410C]">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[#C2410C]"><UserRound className="h-6 w-6" aria-hidden="true" /></span>
                <span className="block text-xl font-extrabold">Akses Siswa</span>
                <span className="mt-2 block text-sm leading-6 text-[#64748B]">Masuk dengan nama dan kelas untuk mulai belajar.</span>
              </button>
              <button type="button" onClick={() => { setSelectedRole('teacher'); setError(''); }} className="group rounded-2xl border-2 border-[#F1E5D8] p-6 text-left transition hover:border-[#F97316] hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-[#C2410C]">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[#C2410C]"><GraduationCap className="h-6 w-6" aria-hidden="true" /></span>
                <span className="block text-xl font-extrabold">Akses Guru</span>
                <span className="mt-2 block text-sm leading-6 text-[#64748B]">Buka semua modul dan Dashboard Guru dengan PIN.</span>
              </button>
            </div>
            <p className="mt-6 rounded-xl bg-[#FFF8F0] px-4 py-3 text-xs leading-5 text-[#64748B]">
              Siswa memulai dari Topik 1. Topik 2, Topik 3, Laboratorium Virtual, dan Evaluasi terkunci sampai guru masuk.
            </p>
          </section>
        ) : selectedRole === 'student' ? (
          <form onSubmit={startStudent} className={`${panelClass} mx-auto max-w-lg`}>
            <button type="button" onClick={() => { setSelectedRole(null); setError(''); }} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#C2410C] hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Pilih akses lain</button>
            <h2 className="text-2xl font-extrabold">Akses Siswa</h2>
            <p className="mt-1 text-sm text-[#64748B]">Isi identitasmu untuk memulai belajar.</p>
            <label className="mt-5 block space-y-2 text-sm font-semibold">
              Nama Lengkap
              <input autoComplete="name" maxLength={80} required className={inputClass} placeholder="Contoh: Anisa Putri" value={studentName} onChange={(event) => setStudentName(event.target.value)} />
            </label>
            <label className="mt-4 block space-y-2 text-sm font-semibold">
              Kelas
              <input maxLength={40} required className={inputClass} placeholder="Contoh: X-IPA 1" value={className} onChange={(event) => setClassName(event.target.value)} />
            </label>
            {error && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{error}</p>}
            <button type="submit" className={`${primaryButtonClass} mt-6 w-full`}>Mulai Belajar</button>
            <p className="mt-4 text-xs leading-5 text-[#64748B]">Topik 1 terbuka sebagai materi awal. Modul lainnya dikelola melalui Akses Guru.</p>
          </form>
        ) : (
          <form onSubmit={startTeacher} className={`${panelClass} mx-auto max-w-lg`}>
            <button type="button" onClick={() => { setSelectedRole(null); setError(''); }} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#C2410C] hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Pilih akses lain</button>
            <h2 className="text-2xl font-extrabold">Akses Guru</h2>
            <p className="mt-1 text-sm text-[#64748B]">Masuk untuk membuka seluruh modul dan dashboard.</p>
            <label className="mt-5 block space-y-2 text-sm font-semibold">
              Nama Guru
              <select className={inputClass} value={teacherName} onChange={(event) => setTeacherName(event.target.value)}>
                {TEACHER_NAMES.map((name) => <option key={name}>{name}</option>)}
              </select>
            </label>
            <label className="mt-4 block space-y-2 text-sm font-semibold">
              PIN Akses
              <input type="password" inputMode="numeric" autoComplete="one-time-code" maxLength={12} required className={inputClass} value={pin} onChange={(event) => setPin(event.target.value)} />
            </label>
            {error && <p role="alert" className="mt-3 text-sm font-bold text-red-700">{error}</p>}
            <button type="submit" className={`${primaryButtonClass} mt-6 w-full`}>Masuk sebagai Guru</button>
            <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950">
              PIN di sisi klien hanya penghalang kasual, bukan keamanan tingkat tinggi.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
