import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  History,
  UserRound,
} from 'lucide-react';
import { useAccess } from '../lib/access-context';
import {
  getJakartaDateParts,
  submitStudentAttendance,
  subscribeAttendanceHistory,
  type FirestoreAttendanceRecord,
} from '../lib/firebase-db';
import { isFirebaseConfigured } from '../lib/firebase';
import { SkeletonBlock } from '../components/Skeleton';

const jakartaDateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'full',
  timeZone: 'Asia/Jakarta',
});

const jakartaTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Asia/Jakarta',
});

function formatAttendanceTime(record: FirestoreAttendanceRecord): string {
  return jakartaTimeFormatter.format(record.attendedAt.toDate());
}

function getAttendanceDateKey(record: FirestoreAttendanceRecord): string {
  return getJakartaDateParts(record.attendedAt.toDate()).dateKey;
}

export function PresencePage() {
  const { profile } = useAccess();
  const [records, setRecords] = useState<FirestoreAttendanceRecord[]>([]);
  const [loadedUid, setLoadedUid] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [justCheckedInFor, setJustCheckedInFor] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    if (profile?.role !== 'student' || !isFirebaseConfigured) {
      return;
    }

    return subscribeAttendanceHistory(
      profile.uid,
      (nextRecords) => {
        setRecords(nextRecords);
        setLoadedUid(profile.uid);
        setError('');
      },
      (caught: Error) => {
        console.error('Gagal memuat riwayat presensi:', caught);
        setRecords([]);
        setError('Riwayat presensi belum dapat dimuat. Silakan coba lagi beberapa saat.');
        setLoadedUid(profile.uid);
      },
    );
  }, [profile]);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const loading = profile?.role === 'student' && isFirebaseConfigured && loadedUid !== profile.uid;
  const visibleRecords = loadedUid === profile?.uid ? records : [];
  const todayKey = getJakartaDateParts(currentTime).dateKey;
  const todayRecord = visibleRecords.find((record) => getAttendanceDateKey(record) === todayKey);
  const hasCheckedInToday = Boolean(todayRecord || justCheckedInFor === `${profile?.uid}:${todayKey}`);

  const handleAttendance = async () => {
    if (profile?.role !== 'student' || submitting || hasCheckedInToday) return;
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      await submitStudentAttendance(profile);
      setJustCheckedInFor(`${profile.uid}:${getJakartaDateParts().dateKey}`);
      setNotice('Presensi berhasil dicatat. Data tersimpan pada akun Anda.');
    } catch (caught: unknown) {
      const message = caught instanceof Error ? caught.message : 'Presensi gagal disimpan. Silakan coba lagi.';
      if (message === 'Presensi hari ini sudah tercatat.') {
        setJustCheckedInFor(`${profile.uid}:${getJakartaDateParts().dateKey}`);
        setNotice(message);
      } else {
        console.error('Gagal menyimpan presensi:', caught);
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (profile?.role === 'teacher') {
    return (
      <section className="mx-auto max-w-2xl rounded-3xl border border-[#F1E5D8] bg-white p-6 text-center shadow-sm sm:p-9">
        <ClipboardCheck className="mx-auto h-10 w-10 text-[#C2410C]" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-extrabold text-[#172033]">Presensi Murid</h1>
        <p className="mt-2 text-sm leading-6 text-[#475569]">Presensi harian hanya dapat dilakukan melalui akun murid.</p>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7 pb-16">
      <header>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#FFEDD5] px-3 py-1 text-xs font-bold text-[#9A3412]">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          <span>Presensi Pembelajaran</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#172033] sm:text-4xl">Presensi</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
          Catat kehadiran dengan akun ATOMIKA Anda. Waktu disimpan otomatis menggunakan waktu server dan zona WIB.
        </p>
      </header>

      {!isFirebaseConfigured && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>Presensi memerlukan koneksi Firebase. Layanan penyimpanan belum dikonfigurasi.</p>
        </div>
      )}
      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}
      {notice && (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{notice}</p>
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-[#F1E5D8] bg-white shadow-sm">
        <div className="border-b border-[#F1E5D8] bg-gradient-to-r from-[#FFF8F0] to-[#FFEDD5]/60 p-5 sm:p-7">
          <h2 className="text-xl font-extrabold text-[#172033]">Presensi Hari Ini</h2>
          <p className="mt-1 text-sm text-[#64748B]">Tanggal dan waktu menggunakan zona waktu Asia/Jakarta (WIB).</p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
          <div className="flex items-center gap-3 rounded-2xl border border-[#F1E5D8] bg-[#FFF8F0]/70 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFEDD5] text-[#C2410C]">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#64748B]">Nama Murid</p>
              <p className="truncate font-bold text-[#172033]">{profile?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#F1E5D8] bg-[#FFF8F0]/70 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFEDD5] text-[#C2410C]">
              <CalendarDays className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold text-[#64748B]">Tanggal</p>
              <p className="font-bold capitalize text-[#172033]">{jakartaDateFormatter.format(currentTime)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#F1E5D8] bg-[#FFF8F0]/70 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFEDD5] text-[#C2410C]">
              <Clock3 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold text-[#64748B]">Waktu Presensi</p>
              <p className="font-bold text-[#172033]">
                {todayRecord ? `${formatAttendanceTime(todayRecord)} WIB` : 'Dicatat otomatis saat presensi'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#F1E5D8] bg-[#FFF8F0]/70 p-4">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              hasCheckedInToday ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}>
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold text-[#64748B]">Status Kehadiran</p>
              <p className="font-bold text-[#172033]">{hasCheckedInToday ? 'Hadir' : 'Belum presensi'}</p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-6 sm:px-7 sm:pb-7">
          <button
            type="button"
            onClick={() => void handleAttendance()}
            disabled={!isFirebaseConfigured || loading || submitting || hasCheckedInToday}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#C2410C] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#9A3412] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none sm:w-auto"
          >
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
            {submitting ? 'Menyimpan...' : hasCheckedInToday ? 'Presensi Tercatat' : 'Lakukan Presensi'}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-[#F1E5D8] bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFEDD5] text-[#C2410C]">
            <History className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-[#172033]">Riwayat Presensi</h2>
            <p className="text-sm text-[#64748B]">Riwayat akun Anda, maksimal 100 catatan terbaru.</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3" aria-label="Memuat riwayat presensi">
            <SkeletonBlock className="h-16 w-full rounded-2xl" />
            <SkeletonBlock className="h-16 w-full rounded-2xl" />
          </div>
        ) : visibleRecords.length ? (
          <ul className="space-y-3">
            {visibleRecords.map((record) => (
              <li key={`${record.attendedAt.toMillis()}-${record.uid}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F1E5D8] bg-[#FFF8F0]/60 p-4">
                <div>
                  <p className="font-bold capitalize text-[#172033]">{jakartaDateFormatter.format(record.attendedAt.toDate())}</p>
                  <p className="mt-1 text-xs text-[#64748B]">{record.name} · {record.className}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Hadir · {formatAttendanceTime(record)} WIB
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-[#E8D8C8] bg-[#FFF8F0]/60 px-4 py-8 text-center text-sm text-[#64748B]">
            Belum ada riwayat presensi.
          </p>
        )}
      </section>
    </div>
  );
}
