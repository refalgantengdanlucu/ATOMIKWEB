import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  calculateVerifiedScore,
  groupAcceptedAttempts,
  recommendNextActivity,
  selectAttemptsForRecap,
  summarizeQuestion,
} from './analytics';
import { getQuestionsForAttempt } from './questionBank';
import {
  subscribeAcceptedAttempts,
  type AttemptFeed,
  type TeacherQuizAttempt,
} from './quizAttempts';
import { SkeletonBlock } from '../components/Skeleton';

const EMPTY_FEED: AttemptFeed = {
  status: 'loading',
  attempts: [],
  updatedAt: null,
};

function formatServerTime(date: Date | null) {
  if (!date) return 'Waktu server tidak direkam';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function attemptTypeLabel(type: TeacherQuizAttempt['attemptType']) {
  if (type === 'diagnostic') return 'Diagnostik';
  if (type === 'practice') return 'Latihan';
  return 'Tidak diketahui';
}

function moduleLabel(moduleId: string | null) {
  return moduleId ? moduleId.toUpperCase() : 'Modul tidak tercatat';
}

function AttemptDetails({ attempt, onClose }: { attempt: TeacherQuizAttempt; onClose: () => void }) {
  const questions = getQuestionsForAttempt(attempt.questionVersion, attempt.moduleId);

  return (
    <section
      className="min-w-0 rounded-2xl border border-[#F1E5D8] bg-white p-4 shadow-sm sm:p-6"
      aria-labelledby="attempt-details-title"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[#C2410C]">Rincian percobaan</p>
          <h2 id="attempt-details-title" className="mt-1 break-words text-lg font-bold text-[#172033]">
            {attempt.activityName}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-[#CBD5E1] text-[#172033] hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C]"
          aria-label="Tutup rincian percobaan"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-2 break-words text-sm text-[#475569]">
        {attempt.alias} · {attemptTypeLabel(attempt.attemptType)} · {attempt.questionVersion ?? 'Versi tidak tercatat'}
      </p>

      {!questions ? (
        <p role="status" className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Bank soal versi {attempt.questionVersion ?? 'tidak tercatat'} untuk modul {moduleLabel(attempt.moduleId)} tidak tersedia. Jawaban ini tidak dinilai ulang dengan bank soal lain.
        </p>
      ) : !attempt.answers ? (
        <p role="status" className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Jawaban per butir tidak tersimpan pada percobaan ini. Rincian dan rekap butir tidak dapat dihitung.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {questions.map((question, index) => {
            const selectedId = attempt.answers?.[question.id];
            const selectedOption = question.options.find((option) => option.id === selectedId);
            const correctOption = question.options.find((option) => option.id === question.correct);
            const isCorrect = selectedId === question.correct;

            return (
              <article key={question.id} className="min-w-0 rounded-xl border border-[#E2E8F0] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#475569]">Soal {index + 1}</p>
                <h3 className="mt-2 break-words text-sm font-bold leading-6 text-[#172033]">{question.prompt}</h3>
                <ul className="mt-3 space-y-2">
                  {question.options.map((option) => (
                    <li key={option.id} className="break-words rounded-lg bg-[#F8FAFC] p-3 text-sm leading-6 text-[#172033]">
                      <span className="font-bold uppercase">{option.id}. </span>
                      {option.label}
                      {option.id === selectedId && <span className="ml-1 font-semibold">— Pilihan siswa</span>}
                      {option.id === question.correct && <span className="ml-1 font-semibold">— Kunci jawaban</span>}
                    </li>
                  ))}
                </ul>
                <p className={`mt-3 text-sm font-bold ${
                  selectedOption ? isCorrect ? 'text-green-800' : 'text-red-800' : 'text-amber-900'
                }`}>
                  {selectedOption ? isCorrect ? 'Benar' : 'Belum tepat' : 'Jawaban tidak tersedia; belum dinilai'}
                </p>
                <p className="mt-1 break-words text-sm leading-6 text-[#334155]">
                  Kunci: {correctOption ? `${correctOption.id.toUpperCase()}. ${correctOption.label}` : 'tidak tersedia'}
                </p>
                <p className="mt-2 break-words text-sm leading-6 text-[#334155]">
                  Pembahasan: {question.explanation}
                </p>
                {!selectedOption && (
                  <p className="mt-2 text-sm font-semibold text-amber-900">Jawaban siswa tidak tersedia; butir ini tidak masuk frekuensi jawaban.</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function TeacherDashboard({ institutionId }: { institutionId: string }) {
  const [feed, setFeed] = useState<AttemptFeed>(EMPTY_FEED);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [versionFilter, setVersionFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => subscribeAcceptedAttempts(setFeed, institutionId), [institutionId]);

  const filteredAttempts = useMemo(
    () => feed.attempts.filter((attempt) =>
      (moduleFilter === 'all' || attempt.moduleId === moduleFilter) &&
      (activityFilter === 'all' || attempt.activityName === activityFilter) &&
      (typeFilter === 'all' || attempt.attemptType === typeFilter) &&
      (versionFilter === 'all' || attempt.questionVersion === versionFilter)
    ),
    [feed.attempts, moduleFilter, activityFilter, typeFilter, versionFilter]
  );
  const selectedAttempt = filteredAttempts.find((attempt) => attempt.id === selectedId) ?? null;
  const groups = useMemo(() => groupAcceptedAttempts(filteredAttempts), [filteredAttempts]);

  const modules = [...new Set(feed.attempts.map((attempt) => attempt.moduleId).filter((value): value is string => Boolean(value)))].sort();
  const activities = [...new Set(feed.attempts.map((attempt) => attempt.activityName))].sort();
  const types = [...new Set(feed.attempts.map((attempt) => attempt.attemptType))].sort();
  const versions = [...new Set(feed.attempts.map((attempt) => attempt.questionVersion).filter((value): value is string => Boolean(value)))].sort();

  return (
    <main className="mx-auto min-w-0 max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <header className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-[#C2410C] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C]">
            Kembali ke beranda
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/kelas?aktivitas=quiz_curriculum"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-100/70 hover:bg-orange-100 text-xs font-bold text-[#C2410C] transition-colors"
            >
              <span>Rekap Kuis 1, 2, 3</span>
            </Link>
            <Link
              to="/kelas?aktivitas=essay"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-100/70 hover:bg-orange-100 text-xs font-bold text-[#C2410C] transition-colors"
            >
              <span>Latihan Essay</span>
            </Link>
            <Link
              to="/kelas?aktivitas=activity"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              <span>Aktivitas Siswa</span>
            </Link>
          </div>
        </div>
        <p className="text-sm font-bold uppercase tracking-wide text-[#C2410C] mt-2">Ruang pengajar</p>
        <h1 className="mt-1 break-words text-3xl font-extrabold text-[#172033]">Panel Guru</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569]">
          Tinjau hasil yang sudah diterima Firestore. Pengiriman yang masih tertunda tidak ditampilkan dan tidak dihitung sebagai nilai nol.
        </p>
      </header>

      <section className="rounded-2xl border border-[#F1E5D8] bg-white p-4 sm:p-6" aria-labelledby="data-status-title">
        <h2 id="data-status-title" className="text-lg font-bold text-[#172033]">Status data</h2>
        {feed.status === 'loading' && (
          <div className="mt-3 space-y-2" role="status" aria-busy="true">
            <span className="sr-only">Memuat hasil yang telah diterima server...</span>
            <SkeletonBlock className="h-4 w-48 rounded" />
            <SkeletonBlock className="h-3 w-32 rounded" />
          </div>
        )}
        {feed.status === 'empty' && (
          <p className="mt-2 text-sm leading-6 text-[#475569]" role="status">
            Belum ada hasil kuis yang diterima server. Panel kosong tidak berarti siswa belum belajar.
          </p>
        )}
        {feed.status === 'error' && (
          <p className="mt-2 text-sm leading-6 text-red-800" role="alert">
            {feed.error ?? 'Hasil gagal dimuat.'}
          </p>
        )}
        {feed.status === 'ready' && (
          <p className="mt-2 break-words text-sm leading-6 text-[#334155]" role="status">
            {feed.attempts.length} hasil diterima · Diperbarui {feed.updatedAt?.toLocaleString('id-ID') ?? 'waktu tidak tersedia'}.
          </p>
        )}
      </section>

      <section className="min-w-0 space-y-4" aria-labelledby="filters-title">
        <h2 id="filters-title" className="text-xl font-bold text-[#172033]">Filter hasil</h2>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="min-w-0 text-sm font-semibold text-[#334155]">
            Modul
            <select value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-[#94A3B8] bg-white px-3 text-sm text-[#172033] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C]">
              <option value="all">Semua modul</option>
              {modules.map((module) => <option key={module} value={module}>{moduleLabel(module)}</option>)}
            </select>
          </label>
          <label className="min-w-0 text-sm font-semibold text-[#334155]">
            Aktivitas
            <select value={activityFilter} onChange={(event) => setActivityFilter(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-[#94A3B8] bg-white px-3 text-sm text-[#172033] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C]">
              <option value="all">Semua aktivitas</option>
              {activities.map((activity) => <option key={activity} value={activity}>{activity}</option>)}
            </select>
          </label>
          <label className="min-w-0 text-sm font-semibold text-[#334155]">
            Jenis percobaan
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-[#94A3B8] bg-white px-3 text-sm text-[#172033] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C]">
              <option value="all">Semua jenis</option>
              {types.map((type) => <option key={type} value={type}>{attemptTypeLabel(type)}</option>)}
            </select>
          </label>
          <label className="min-w-0 text-sm font-semibold text-[#334155]">
            Versi soal
            <select value={versionFilter} onChange={(event) => setVersionFilter(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-[#94A3B8] bg-white px-3 text-sm text-[#172033] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C]">
              <option value="all">Semua versi</option>
              {versions.map((version) => <option key={version} value={version}>{version}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="min-w-0 space-y-4" aria-labelledby="attempts-title">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="attempts-title" className="text-xl font-bold text-[#172033]">Hasil siswa</h2>
          <p className="text-sm text-[#475569]">{filteredAttempts.length} hasil pada filter ini</p>
        </div>

        {feed.status === 'ready' && filteredAttempts.length === 0 && (
          <p className="rounded-xl border border-[#CBD5E1] bg-white p-4 text-sm text-[#475569]">Tidak ada hasil yang sesuai dengan filter.</p>
        )}

        <div className="grid min-w-0 gap-3">
          {feed.status === 'loading' && (
            <div className="space-y-3" role="status" aria-busy="true">
              <span className="sr-only">Memuat daftar hasil...</span>
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="rounded-xl border border-[#F1E5D8] bg-white p-4 sm:p-5">
                  <SkeletonBlock className="h-4 w-40 max-w-full rounded" />
                  <SkeletonBlock className="mt-3 h-3.5 w-3/4 rounded" />
                  <SkeletonBlock className="mt-2 h-3.5 w-1/2 rounded" />
                </div>
              ))}
            </div>
          )}
          {filteredAttempts.map((attempt) => {
            const verifiedScore = calculateVerifiedScore(attempt);
            return (
              <button
                key={attempt.id}
                type="button"
                data-card-hover
                onClick={() => setSelectedId(attempt.id)}
                aria-pressed={selectedId === attempt.id}
                className={`min-w-0 rounded-xl border bg-white p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C] sm:p-5 ${
                  selectedId === attempt.id ? 'border-[#C2410C] ring-2 ring-orange-200' : 'border-[#F1E5D8] hover:border-orange-300'
                }`}
              >
                <span className="block break-words font-bold text-[#172033]">{attempt.alias}</span>
                <span className="mt-1 block break-words text-sm font-semibold text-[#334155]">{attempt.activityName}</span>
                <span className="mt-2 block break-words text-sm leading-6 text-[#475569]">
                  {moduleLabel(attempt.moduleId)} · {attemptTypeLabel(attempt.attemptType)} · Versi {attempt.questionVersion ?? 'tidak tercatat'}
                </span>
                <span className="mt-1 block break-words text-sm leading-6 text-[#475569]">
                  {verifiedScore
                    ? `Skor terverifikasi dari jawaban: ${verifiedScore.score}/${verifiedScore.maxScore} (${verifiedScore.percent}%)`
                    : `Skor tercatat, belum terverifikasi: ${attempt.score === null ? 'tidak tersedia' : `${attempt.score}${attempt.maxScore === null ? '' : `/${attempt.maxScore}`}`}${attempt.percent === null ? '' : ` (${attempt.percent}%)`}`}
                </span>
                <span className="mt-1 block break-words text-xs text-[#475569]">Waktu server: {formatServerTime(attempt.serverReceivedAt)}</span>
              </button>
            );
          })}
        </div>

        {selectedAttempt && (
          <AttemptDetails attempt={selectedAttempt} onClose={() => setSelectedId(null)} />
        )}
      </section>

      <section className="min-w-0 space-y-5" aria-labelledby="recap-title">
        <header>
          <h2 id="recap-title" className="text-2xl font-bold text-[#172033]">Rekap per butir</h2>
          <p className="mt-1 text-sm leading-6 text-[#475569]">
            Diagnostik memakai percobaan pertama per siswa; latihan memakai percobaan terakhir. Setiap siswa dihitung satu kali per kelompok.
          </p>
        </header>

        {groups.length === 0 && feed.status === 'ready' && (
          <p className="rounded-xl border border-[#CBD5E1] bg-white p-4 text-sm leading-6 text-[#475569]">
            Belum ada hasil dengan metadata modul untuk dikelompokkan. Hasil tetap tersedia pada daftar di atas.
          </p>
        )}

        {groups.map((group) => {
          const selection = selectAttemptsForRecap(group);
          const questions = getQuestionsForAttempt(group.questionVersion, group.moduleId);
          const summaries = questions && group.attemptType !== 'unknown'
            ? questions.map((question) => summarizeQuestion(question, selection.attempts))
            : [];
          const groupId = `${group.moduleId}-${group.activityName}-${group.attemptType}-${group.questionVersion ?? 'unversioned'}`;

          return (
            <article data-card-hover key={groupId} className="min-w-0 rounded-2xl border border-[#F1E5D8] bg-white p-4 sm:p-6">
              <h3 className="break-words text-lg font-bold text-[#172033]">{group.activityName}</h3>
              <p className="mt-1 break-words text-sm leading-6 text-[#475569]">
                {moduleLabel(group.moduleId)} · {attemptTypeLabel(group.attemptType)} · Versi {group.questionVersion ?? 'tidak tercatat'}
              </p>
              <p className="mt-2 text-sm font-semibold text-[#172033]">
                n = {selection.attempts.length} siswa dengan hasil diterima
              </p>

              {group.attemptType === 'unknown' ? (
                <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                  Jenis percobaan tidak tercatat. Hasil ini tidak dimasukkan ke rekap agar aturan pemilihan percobaan tidak ditebak.
                </p>
              ) : !questions ? (
                <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                  Bank soal versi {group.questionVersion ?? 'tidak tercatat'} untuk modul ini tidak ditemukan. Hasil tidak dinilai dengan versi bank lain.
                </p>
              ) : (
                <>
                  {selection.ignoredWithoutUid > 0 && (
                    <p className="mt-3 text-sm leading-6 text-amber-900">
                      {selection.ignoredWithoutUid} percobaan tanpa UID siswa tidak dihitung dalam rekap.
                    </p>
                  )}
                  {selection.ignoredWithoutServerTime > 0 && (
                    <p className="mt-2 text-sm leading-6 text-amber-900">
                      {selection.ignoredWithoutServerTime} percobaan tanpa waktu server tidak dihitung karena urutan pertama/terakhir tidak dapat dipastikan.
                    </p>
                  )}
                  <div className="mt-4 space-y-4">
                    {summaries.map((summary, index) => {
                      const mostChosenDistractor = summary.question.options
                        .filter((option) => option.id !== summary.question.correct)
                        .sort((left, right) => summary.counts[right.id] - summary.counts[left.id])[0];

                      return (
                        <section key={summary.question.id} className="min-w-0 rounded-xl bg-[#FFF8F0] p-4">
                          <h4 className="break-words text-sm font-bold leading-6 text-[#172033]">
                            Butir {index + 1}: {summary.question.prompt}
                          </h4>
                          <p className="mt-2 text-xs leading-5 text-[#475569]">
                            Jawaban tersedia n = {summary.responseCount} dari {summary.studentCount} siswa; benar {summary.correctCount}, belum tepat {summary.incorrectCount}.
                          </p>
                          <ul className="mt-3 space-y-2">
                            {summary.question.options.map((option) => (
                              <li key={option.id} className="break-words text-sm leading-6 text-[#334155]">
                                <span className="font-semibold">{option.id.toUpperCase()}. {option.label}</span>
                                <span> — {summary.counts[option.id]} pilihan</span>
                                {option.id === summary.question.correct && <span className="font-semibold"> · Kunci jawaban</span>}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-3 break-words text-sm leading-6 text-[#334155]">
                            Pengecoh terbanyak: {mostChosenDistractor
                              ? `${mostChosenDistractor.id.toUpperCase()}. ${mostChosenDistractor.label} (${summary.counts[mostChosenDistractor.id]} pilihan)`
                              : 'tidak tersedia'}
                          </p>
                        </section>
                      );
                    })}
                  </div>
                  <p className="mt-4 break-words rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 text-sm leading-6 text-[#172033]">
                    <strong>Rekomendasi kegiatan berikutnya:</strong> {recommendNextActivity(summaries)}
                  </p>
                </>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
