import { useCallback, useEffect, type ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { useAccess } from '../lib/access-context';
import { CLASSROOM_STORAGE_KEYS, readClassroomData, writeClassroomData } from '../lib/classroom';
import type { StudentActivity } from '../lib/classroom';
import { sendActivityToSheets } from '../lib/classroom-sync';
import { TOPICS } from '../data/topics';
import { SECTIONS } from '../data/sections';
import type { AccessProfile } from '../lib/access-context';

export function AccessGate({ children }: { children: ReactNode }) {
  const { profile, status } = useAccess();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8F0] text-[#475569]" aria-live="polite">
        Memulihkan sesi...
      </main>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  const blockedForStudent = profile.role === 'student' && (
    location.pathname.startsWith('/laboratorium') ||
    location.pathname.startsWith('/lab') ||
    location.pathname.startsWith('/kuis') ||
    location.pathname.startsWith('/progres')
  );

  if (blockedForStudent) {
    return (
      <>
        <StudentActivityReporter profile={profile} blocked />
        <main className="flex min-h-screen items-center justify-center bg-[#FFF8F0] px-4 py-10 text-[#172033]">
          <section className="w-full max-w-xl rounded-3xl border border-[#F1E5D8] bg-white p-6 text-center shadow-sm sm:p-9">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-[#C2410C]">
              <LockKeyhole className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-extrabold">Modul ini masih terkunci</h1>
            <p className="mt-2 text-sm leading-6 text-[#475569]">
              Laboratorium Virtual dan Evaluasi hanya dapat dibuka oleh akun guru.
            </p>
            <Link to="/materi" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#C2410C] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#9A3412]">
              Kembali ke materi
            </Link>
          </section>
        </main>
      </>
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
