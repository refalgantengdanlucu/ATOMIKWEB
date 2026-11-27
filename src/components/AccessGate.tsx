import { useCallback, useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { useAccess, DEFAULT_INSTITUTION_ID } from '../lib/access-context';
import { CLASSROOM_STORAGE_KEYS, getStudentActivityKey, getUserClassroomStorageKey, readClassroomData, writeClassroomData } from '../lib/classroom';
import type { StudentActivity } from '../lib/classroom';
import { saveStudentActivity } from '../lib/firebase-db';
import { TOPICS } from '../data/topics';
import { SECTIONS } from '../data/sections';
import type { AccessProfile } from '../lib/access-context';
import { recordActivityForKey, useProgress } from '../lib/progress';
import { SkeletonBlock } from './Skeleton';

export function AccessGate({ children }: { children: ReactNode }) {
  const { profile } = useAccess();

  return (
    <>
      {profile && <StudentActivityReporter profile={profile} />}
      {children}
    </>
  );
}

export function LoginRequiredGate({ children }: { children: ReactNode }) {
  const { profile, status } = useAccess();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <section className="mx-auto max-w-md rounded-3xl border border-[#F1E5D8] bg-white p-6 shadow-sm sm:p-9" role="status" aria-live="polite" aria-busy="true">
        <span className="sr-only">Memulihkan sesi...</span>
        <div className="mb-5 flex items-center gap-3">
          <SkeletonBlock className="h-12 w-12 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-5 w-36 rounded" />
            <SkeletonBlock className="h-3 w-48 max-w-full rounded" />
          </div>
        </div>
        <SkeletonBlock className="mb-3 h-6 w-3/4 rounded" />
        <SkeletonBlock className="mb-2 h-4 w-full rounded" />
        <SkeletonBlock className="h-11 w-32 rounded-xl" />
      </section>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-[55vh] items-center justify-center py-10 text-[#172033]">
        <section className="w-full max-w-xl rounded-3xl border border-[#F1E5D8] bg-white p-6 text-center shadow-sm sm:p-9">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-[#C2410C]">
            <LockKeyhole className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-extrabold">Masuk untuk melanjutkan</h1>
          <p className="mt-2 text-sm leading-6 text-[#475569]">
            Silakan masuk ke akun ATOMIKA untuk melihat progres belajar dan melakukan presensi.
          </p>
          <Link
            to="/login"
            state={{ from: `${location.pathname}${location.search}` }}
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#C2410C] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#9A3412]"
          >
            Masuk
          </Link>
        </section>
      </main>
    );
  }

  return children;
}

export function StudentActivityReporter({ profile }: { profile: AccessProfile }) {
  const location = useLocation();
  const { storageKey } = useProgress({ uid: profile.uid });

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
            : location.pathname === '/presensi'
              ? 'Presensi'
            : location.pathname === '/kelas'
              ? location.search.startsWith('?aktivitas=') ? 'Kegiatan kelas · ' + location.search.slice(11) : 'Kegiatan kelas'
              : 'Beranda';
    const currentActivity = activity;

    const visitKey = `atomika-student-visits-v1:${profile.uid}`;
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
    recordActivityForKey(storageKey, {
      activity: sectionId ? `${currentActivity} · Bagian ${sectionId}` : currentActivity,
      path: `${location.pathname}${location.search}`,
    });
    const record: StudentActivity = {
      uid: profile.uid,
      institutionId: profile.institutionId || DEFAULT_INSTITUTION_ID,
      name: profile.name,
      className: profile.className,
      activity: currentActivity,
      path: `${location.pathname}${location.search}`,
      progressSummary,
      lastSeen: new Date().toISOString(),
    };
    const activityStorageKey = getUserClassroomStorageKey(CLASSROOM_STORAGE_KEYS.activity, profile.uid);
    const activities = readClassroomData<StudentActivity[]>(activityStorageKey, []);
    const nextActivities = [
      ...activities.filter((item) => getStudentActivityKey(item) !== getStudentActivityKey(record)),
      record,
    ];
    writeClassroomData(activityStorageKey, nextActivities);
    void saveStudentActivity(record).catch((error: unknown) => {
      console.error('Gagal mengirim aktivitas siswa ke Firestore:', error);
    });
  }, [location.pathname, location.search, profile, storageKey]);

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
