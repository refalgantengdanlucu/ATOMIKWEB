import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  Filter,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import {
  subscribeAcceptedAttempts,
  type AttemptFeed,
  type TeacherQuizAttempt,
} from '../../panel-guru/quizAttempts';
import { getQuestionsForAttempt } from '../../panel-guru/questionBank';
import { subscribeStudentActivities } from '../../lib/firebase-db';
import type { StudentActivity } from '../../lib/classroom';
import { SkeletonTable } from '../Skeleton';

const MODULE_TITLES: Record<string, string> = {
  t1: 'Kuis 1: Struktur Atom & Partikel',
  t2: 'Kuis 2: Nomor Atom & Nomor Massa',
  t3: 'Kuis 3: Ion & Perubahan Elektron',
};

interface TeacherCurriculumQuizRecapProps {
  institutionId: string;
}

export function TeacherCurriculumQuizRecap({ institutionId }: TeacherCurriculumQuizRecapProps) {
  const [feed, setFeed] = useState<AttemptFeed>({
    status: 'loading',
    attempts: [],
    updatedAt: null,
  });
  const [activities, setActivities] = useState<StudentActivity[]>([]);
  const [moduleFilter, setModuleFilter] = useState<'all' | 't1' | 't2' | 't3'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'list' | 'missing'>('matrix');
  const [inspectAttempt, setInspectAttempt] = useState<TeacherQuizAttempt | null>(null);

  useEffect(() => {
    if (!institutionId) return;
    const unsubAttempts = subscribeAcceptedAttempts(setFeed, institutionId);
    const unsubActivities = subscribeStudentActivities(setActivities, institutionId);
    return () => {
      unsubAttempts();
      unsubActivities();
    };
  }, [institutionId]);

  // Filter percobaan Kuis 1, 2, 3 kurikulum
  const curriculumAttempts = useMemo(() => {
    return feed.attempts.filter(
      (a) => a.moduleId === 't1' || a.moduleId === 't2' || a.moduleId === 't3'
    );
  }, [feed.attempts]);

  // Roster siswa unik dari aktivitas + pengerjaan kuis
  const studentRoster = useMemo(() => {
    const map = new Map<string, { uid: string; name: string; className: string }>();

    activities.forEach((act) => {
      const key = act.uid || `${act.name}|${act.className}`;
      if (!map.has(key)) {
        map.set(key, { uid: act.uid || key, name: act.name, className: act.className || '—' });
      }
    });

    curriculumAttempts.forEach((att) => {
      const key = att.uid || `${att.alias}|${att.className || ''}`;
      if (!map.has(key)) {
        map.set(key, { uid: att.uid || key, name: att.alias, className: att.className || '—' });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'id'));
  }, [activities, curriculumAttempts]);

  // Perhitungan matriks perbandingan nilai Kuis 1, 2, 3 per siswa
  const studentMatrix = useMemo(() => {
    return studentRoster.map((student) => {
      const studentAttempts = curriculumAttempts.filter(
        (att) =>
          (att.uid && att.uid === student.uid) ||
          att.alias.trim().toLowerCase() === student.name.trim().toLowerCase()
      );

      // Ambil nilai tertinggi per modul
      const getBestPercent = (mod: 't1' | 't2' | 't3'): number | null => {
        const matching = studentAttempts.filter((a) => a.moduleId === mod);
        if (matching.length === 0) return null;
        return Math.max(...matching.map((a) => a.percent ?? 0));
      };

      const q1 = getBestPercent('t1');
      const q2 = getBestPercent('t2');
      const q3 = getBestPercent('t3');

      const completedCount = [q1, q2, q3].filter((val) => val !== null).length;
      const validScores = [q1, q2, q3].filter((v): v is number => v !== null);
      const avg = validScores.length
        ? Math.round(validScores.reduce((sum, n) => sum + n, 0) / validScores.length)
        : null;

      return {
        ...student,
        q1,
        q2,
        q3,
        completedCount,
        avg,
      };
    });
  }, [studentRoster, curriculumAttempts]);

  // Filter daftar percobaan berdasarkan kuis & nama
  const filteredAttempts = useMemo(() => {
    return curriculumAttempts.filter((att) => {
      const matchesMod = moduleFilter === 'all' || att.moduleId === moduleFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        att.alias.toLowerCase().includes(q) ||
        (att.className && att.className.toLowerCase().includes(q));
      return matchesMod && matchesQuery;
    });
  }, [curriculumAttempts, moduleFilter, searchQuery]);

  // Filter matriks berdasarkan search query
  const filteredMatrix = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return studentMatrix;
    return studentMatrix.filter(
      (s) => s.name.toLowerCase().includes(q) || s.className.toLowerCase().includes(q)
    );
  }, [studentMatrix, searchQuery]);

  // Siswa yang belum mengerjakan kuis yang dipilih
  const missingStudents = useMemo(() => {
    return studentMatrix.filter((student) => {
      if (moduleFilter === 't1') return student.q1 === null;
      if (moduleFilter === 't2') return student.q2 === null;
      if (moduleFilter === 't3') return student.q3 === null;
      // Jika 'all', cari yang belum menyelesaikan semua (kurang dari 3 kuis)
      return student.completedCount < 3;
    });
  }, [studentMatrix, moduleFilter]);

  // Download CSV
  const handleDownloadCSV = () => {
    const rows = [
      ['Nama Siswa', 'Kelas', 'Modul Kuis', 'Skor', 'Skor Maksimal', 'Nilai (%)', 'Waktu Pengerjaan'],
      ...curriculumAttempts.map((att) => [
        att.alias,
        att.className || '—',
        MODULE_TITLES[att.moduleId || ''] || att.activityName,
        String(att.score ?? 0),
        String(att.maxScore ?? 10),
        String(att.percent ?? 0),
        att.serverReceivedAt?.toLocaleString('id-ID') || '—',
      ]),
    ];
    const csvContent = `\uFEFF${rows.map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\r\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rekap-kuis-1-2-3-atomika-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFEDD5] text-[#C2410C] mb-2">
            <BookOpen className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Rekap Evaluasi Kurikulum</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#172033]">
            Rekap Pengerjaan Kuis 1, Kuis 2, dan Kuis 3
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            Pantau hasil evaluasi materi per subtopik, perbandingan nilai antar kuis, serta rincian butir jawaban siswa secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadCSV}
            disabled={curriculumAttempts.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#F1E5D8] bg-white hover:bg-orange-50/50 text-xs sm:text-sm font-semibold text-[#172033] shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-[#C2410C]" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Metrik Singkat */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs">
          <span className="text-xs font-medium text-[#64748B]">Total Pengerjaan</span>
          <div className="text-2xl font-black text-[#172033] mt-1">{curriculumAttempts.length}</div>
          <span className="text-[11px] text-[#C2410C]">Kuis 1, 2, & 3</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs">
          <span className="text-xs font-medium text-[#64748B]">Siswa Terdata</span>
          <div className="text-2xl font-black text-[#172033] mt-1">{studentRoster.length}</div>
          <span className="text-[11px] text-green-700">Akun terdaftar</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs">
          <span className="text-xs font-medium text-[#64748B]">Tuntas 3 Kuis</span>
          <div className="text-2xl font-black text-[#15803D] mt-1">
            {studentMatrix.filter((s) => s.completedCount === 3).length}
          </div>
          <span className="text-[11px] text-[#64748B]">Siswa tuntas semua</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs">
          <span className="text-xs font-medium text-[#64748B]">Belum Lengkap</span>
          <div className="text-2xl font-black text-[#C2410C] mt-1">
            {studentMatrix.filter((s) => s.completedCount < 3).length}
          </div>
          <span className="text-[11px] text-[#C2410C]">Perlu tindak lanjut</span>
        </div>
      </div>

      {/* Kontrol Filter & Pencarian */}
      <div className="p-4 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Sub-tab view toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-orange-50/60 rounded-xl border border-orange-100 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeSubTab === 'matrix'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#172033]'
            }`}
          >
            Matriks Perbandingan Nilai
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeSubTab === 'list'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#172033]'
            }`}
          >
            Daftar Percobaan & Rincian
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('missing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeSubTab === 'missing'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#172033]'
            }`}
          >
            Siswa Belum Mengerjakan ({missingStudents.length})
          </button>
        </div>

        {/* Filter Kuis & Input Pencarian */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value as any)}
              className="rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-medium text-[#172033] outline-none focus:border-[#C2410C]"
            >
              <option value="all">Semua Kuis (Kuis 1, 2, 3)</option>
              <option value="t1">Kuis 1: Struktur Atom & Partikel</option>
              <option value="t2">Kuis 2: Nomor Atom & Nomor Massa</option>
              <option value="t3">Kuis 3: Ion & Perubahan Elektron</option>
            </select>
          </div>

          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa/kelas..."
              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs text-[#172033] outline-none focus:border-[#C2410C]"
            />
          </div>
        </div>
      </div>

      {/* Tampilan Konten Berdasarkan Sub-tab */}
      {feed.status === 'loading' && studentMatrix.length === 0 ? (
        <SkeletonTable columns={6} minWidthClassName="min-w-[650px]" />
      ) : activeSubTab === 'matrix' ? (
        /* TAB 1: MATRIKS PERBANDINGAN NILAI KUIS 1, 2, 3 */
        <div className="rounded-3xl border border-[#F1E5D8] bg-white p-5 shadow-xs overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#172033]">
              Matriks Perbandingan Nilai Kuis Siswa
            </h3>
            <span className="text-xs text-[#64748B]">
              {filteredMatrix.length} siswa ditemukan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs sm:text-sm">
              <thead className="border-b border-[#F1E5D8] text-xs uppercase text-[#64748B] bg-[#FFF8F0]/60">
                <tr>
                  <th className="px-4 py-3">Nama Siswa</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3 text-center">Kuis 1 (Struktur Atom)</th>
                  <th className="px-4 py-3 text-center">Kuis 2 (Nomor Atom & Massa)</th>
                  <th className="px-4 py-3 text-center">Kuis 3 (Ion & Elektron)</th>
                  <th className="px-4 py-3 text-center">Rata-rata</th>
                  <th className="px-4 py-3 text-center">Status Pengerjaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1E5D8]/70">
                {filteredMatrix.map((student) => {
                  return (
                    <tr key={student.uid} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-[#172033]">{student.name}</td>
                      <td className="px-4 py-3.5 text-[#64748B]">{student.className}</td>
                      <td className="px-4 py-3.5 text-center">
                        {student.q1 !== null ? (
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg font-bold text-xs ${
                              student.q1 >= 75
                                ? 'bg-green-100 text-green-800'
                                : student.q1 >= 50
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {student.q1}%
                          </span>
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {student.q2 !== null ? (
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg font-bold text-xs ${
                              student.q2 >= 75
                                ? 'bg-green-100 text-green-800'
                                : student.q2 >= 50
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {student.q2}%
                          </span>
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {student.q3 !== null ? (
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg font-bold text-xs ${
                              student.q3 >= 75
                                ? 'bg-green-100 text-green-800'
                                : student.q3 >= 50
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {student.q3}%
                          </span>
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold">
                        {student.avg !== null ? (
                          <span className="text-[#C2410C] font-extrabold">{student.avg}%</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {student.completedCount === 3 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            <span>Tuntas (3/3)</span>
                          </span>
                        ) : student.completedCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            <span>Sebagian ({student.completedCount}/3)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                            <span>Belum mengerjakan</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeSubTab === 'list' ? (
        /* TAB 2: DAFTAR PERCOBAAN & RINCIAN BUTIR */
        <div className="rounded-3xl border border-[#F1E5D8] bg-white p-5 shadow-xs overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#172033]">
              Daftar Seluruh Pengerjaan Kuis
            </h3>
            <span className="text-xs text-[#64748B]">
              {filteredAttempts.length} percobaan tercatat
            </span>
          </div>

          {filteredAttempts.length === 0 ? (
            <p className="rounded-2xl bg-[#FFF8F0] p-8 text-center text-sm text-[#64748B]">
              Belum ada data percobaan kuis yang sesuai dengan filter.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs sm:text-sm">
                <thead className="border-b border-[#F1E5D8] text-xs uppercase text-[#64748B] bg-[#FFF8F0]/60">
                  <tr>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-4 py-3">Kelas</th>
                    <th className="px-4 py-3">Kuis</th>
                    <th className="px-4 py-3 text-center">Skor / Nilai</th>
                    <th className="px-4 py-3">Waktu Selesai</th>
                    <th className="px-4 py-3 text-center">Rincian Butir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1E5D8]/70">
                  {filteredAttempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-[#172033]">{attempt.alias}</td>
                      <td className="px-4 py-3.5 text-[#64748B]">{attempt.className || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-[#172033]">
                          {MODULE_TITLES[attempt.moduleId || ''] || attempt.activityName}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-bold text-[#C2410C]">
                          {attempt.score ?? 0}/{attempt.maxScore ?? 10}
                        </span>{' '}
                        <span className="text-xs text-[#64748B]">({attempt.percent ?? 0}%)</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#64748B]">
                        {attempt.serverReceivedAt?.toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }) || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setInspectAttempt(attempt)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#F1E5D8] hover:border-[#C2410C] hover:bg-orange-50 text-xs font-semibold text-[#C2410C] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Rincian</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* TAB 3: SISWA BELUM MENGERJAKAN */
        <div className="rounded-3xl border border-[#F1E5D8] bg-white p-5 shadow-xs overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#172033]">
                Daftar Siswa Belum Mengerjakan
              </h3>
              <p className="text-xs text-[#64748B]">
                {moduleFilter === 'all'
                  ? 'Menampilkan siswa yang belum menyelesaikan seluruh 3 kuis'
                  : `Menampilkan siswa yang belum mengerjakan ${MODULE_TITLES[moduleFilter]}`}
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-800">
              {missingStudents.length} siswa
            </span>
          </div>

          {missingStudents.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-green-50 border border-green-200 text-green-900">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-bold text-sm">Semua siswa sudah mengerjakan!</p>
              <p className="text-xs text-green-700 mt-1">
                Seluruh siswa terdata telah mengumpulkan kuis yang dipilih.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-xs sm:text-sm">
                <thead className="border-b border-[#F1E5D8] text-xs uppercase text-[#64748B] bg-[#FFF8F0]/60">
                  <tr>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-4 py-3">Kelas</th>
                    <th className="px-4 py-3 text-center">Status Kuis 1</th>
                    <th className="px-4 py-3 text-center">Status Kuis 2</th>
                    <th className="px-4 py-3 text-center">Status Kuis 3</th>
                    <th className="px-4 py-3 text-center">Kuis Belum Dikerjakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1E5D8]/70">
                  {missingStudents.map((s) => {
                    const missingList = [];
                    if (s.q1 === null) missingList.push('Kuis 1');
                    if (s.q2 === null) missingList.push('Kuis 2');
                    if (s.q3 === null) missingList.push('Kuis 3');

                    return (
                      <tr key={s.uid} className="hover:bg-red-50/30 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-[#172033]">{s.name}</td>
                        <td className="px-4 py-3.5 text-[#64748B]">{s.className}</td>
                        <td className="px-4 py-3.5 text-center">
                          {s.q1 !== null ? (
                            <span className="text-green-700 font-bold">✓ ({s.q1}%)</span>
                          ) : (
                            <span className="text-red-600 font-bold">Belum</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {s.q2 !== null ? (
                            <span className="text-green-700 font-bold">✓ ({s.q2}%)</span>
                          ) : (
                            <span className="text-red-600 font-bold">Belum</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {s.q3 !== null ? (
                            <span className="text-green-700 font-bold">✓ ({s.q3}%)</span>
                          ) : (
                            <span className="text-red-600 font-bold">Belum</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-red-700">
                          {missingList.join(', ')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL RINCIAN BUTIR SOAL PERCOBAAN SISWA */}
      {inspectAttempt && (
        <AttemptInspectionModal
          attempt={inspectAttempt}
          onClose={() => setInspectAttempt(null)}
        />
      )}
    </div>
  );
}

function AttemptInspectionModal({
  attempt,
  onClose,
}: {
  attempt: TeacherQuizAttempt;
  onClose: () => void;
}) {
  const questions = getQuestionsForAttempt(attempt.questionVersion || 'v1', attempt.moduleId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspect-attempt-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-[#F1E5D8] overflow-hidden my-auto">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-[#F1E5D8] bg-[#FFF8F0]/80 flex items-start justify-between gap-3 shrink-0">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
              Rincian Jawaban Siswa
            </span>
            <h3 id="inspect-attempt-title" className="text-lg sm:text-xl font-bold text-[#172033] mt-0.5">
              {attempt.alias} · {MODULE_TITLES[attempt.moduleId || ''] || attempt.activityName}
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Kelas: {attempt.className || '—'} · Nilai:{' '}
              <strong className="text-[#C2410C]">
                {attempt.score}/{attempt.maxScore ?? 10} ({attempt.percent}%)
              </strong>{' '}
              · Waktu:{' '}
              {attempt.serverReceivedAt?.toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }) || '—'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-orange-100 text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="Tutup rincian"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Konten Soal & Jawaban */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {!questions ? (
            <p className="text-sm text-amber-800 p-4 rounded-xl bg-amber-50 border border-amber-200">
              Bank soal untuk modul kuis ini tidak ditemukan.
            </p>
          ) : !attempt.answers ? (
            <p className="text-sm text-amber-800 p-4 rounded-xl bg-amber-50 border border-amber-200">
              Jawaban butir soal tidak tersimpan secara terperinci pada percobaan ini.
            </p>
          ) : (
            questions.map((q, idx) => {
              const selectedOptId = attempt.answers?.[q.id];
              const isCorrect = selectedOptId === q.correct;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border text-xs sm:text-sm ${
                    isCorrect
                      ? 'bg-white border-green-200'
                      : 'bg-red-50/30 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-[#64748B]">
                      Soal {idx + 1}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isCorrect
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          <span>Benar</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Belum Tepat</span>
                        </>
                      )}
                    </span>
                  </div>

                  <p className="font-semibold text-[#172033] leading-relaxed mb-3">
                    {q.prompt}
                  </p>

                  <div className="space-y-1.5 mb-3">
                    {q.options.map((opt) => {
                      const isStudentChoice = opt.id === selectedOptId;
                      const isCorrectChoice = opt.id === q.correct;

                      let itemStyle = 'bg-slate-50 border-slate-200 text-[#475569]';
                      if (isCorrectChoice) {
                        itemStyle = 'bg-green-50 border-green-300 text-green-900 font-semibold';
                      } else if (isStudentChoice && !isCorrect) {
                        itemStyle = 'bg-red-50 border-red-300 text-red-900 font-semibold';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${itemStyle}`}
                        >
                          <span className="font-bold uppercase shrink-0">{opt.id}.</span>
                          <span className="flex-1">{opt.label}</span>
                          {isStudentChoice && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80 border border-current shrink-0">
                              Pilihan Siswa
                            </span>
                          )}
                          {isCorrectChoice && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-200 text-green-900 shrink-0">
                              Kunci
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-xs text-[#475569] leading-relaxed">
                    <strong className="text-[#172033]">Pembahasan:</strong> {q.explanation}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 border-t border-[#F1E5D8] bg-slate-50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#172033] text-white text-xs sm:text-sm font-semibold hover:bg-black transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
