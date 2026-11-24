import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileEdit,
  GraduationCap,
  Search,
} from 'lucide-react';
import {
  gradeEssaySubmission,
  subscribeAllEssaySubmissions,
  type EssaySubmission,
} from '../../lib/essay-db';
import { ESSAY_QUESTIONS, ESSAY_SUBTOPICS } from '../../data/essayQuestions';
import { subscribeStudentActivities } from '../../lib/firebase-db';
import type { StudentActivity } from '../../lib/classroom';
import type { TopicId } from '../../types';

interface TeacherEssayRecapProps {
  institutionId: string;
}

export function TeacherEssayRecap({ institutionId }: TeacherEssayRecapProps) {
  const [submissions, setSubmissions] = useState<EssaySubmission[]>([]);
  const [activities, setActivities] = useState<StudentActivity[]>([]);
  const [subtopicFilter, setSubtopicFilter] = useState<'all' | TopicId>('all');
  const [questionFilter, setQuestionFilter] = useState<string>('all'); // 'all' or 'q1'..'q6'
  const [gradingFilter, setGradingFilter] = useState<'all' | 'graded' | 'ungraded'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'answers' | 'matrix'>('answers');

  // State untuk form penilaian guru (per submission ID)
  const [gradingScores, setGradingScores] = useState<Record<string, string>>({});
  const [gradingFeedbacks, setGradingFeedbacks] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveSuccessMap, setSaveSuccessMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!institutionId) return;
    const unsubSubmissions = subscribeAllEssaySubmissions(setSubmissions, institutionId);
    const unsubActivities = subscribeStudentActivities(setActivities, institutionId);
    return () => {
      unsubSubmissions();
      unsubActivities();
    };
  }, [institutionId]);

  // Roster siswa unik
  const studentRoster = useMemo(() => {
    const map = new Map<string, { uid: string; name: string; className: string }>();

    activities.forEach((act) => {
      const key = act.uid || `${act.name}|${act.className}`;
      if (!map.has(key)) {
        map.set(key, { uid: act.uid || key, name: act.name, className: act.className || '—' });
      }
    });

    submissions.forEach((sub) => {
      const key = sub.uid || `${sub.studentName}|${sub.className || ''}`;
      if (!map.has(key)) {
        map.set(key, { uid: sub.uid || key, name: sub.studentName, className: sub.className || '—' });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'id'));
  }, [activities, submissions]);

  // Matriks pengerjaan 6 soal essay per siswa
  const studentMatrix = useMemo(() => {
    return studentRoster.map((student) => {
      const studentSubs = submissions.filter(
        (s) =>
          (s.uid && s.uid === student.uid) ||
          s.studentName.trim().toLowerCase() === student.name.trim().toLowerCase()
      );

      const answeredMap: Record<string, boolean> = {};
      ESSAY_QUESTIONS.forEach((q) => {
        answeredMap[q.id] = studentSubs.some((s) => s.questionId === q.id && Boolean(s.answer.trim()));
      });

      const answeredCount = Object.values(answeredMap).filter(Boolean).length;
      return {
        ...student,
        answeredMap,
        answeredCount,
      };
    });
  }, [studentRoster, submissions]);

  // Filter jawaban essay
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesSubtopic = subtopicFilter === 'all' || sub.subtopicId === subtopicFilter;
      const matchesQuestion = questionFilter === 'all' || sub.questionId === questionFilter;
      const matchesGrading =
        gradingFilter === 'all' ||
        (gradingFilter === 'graded' && typeof sub.teacherScore === 'number') ||
        (gradingFilter === 'ungraded' && (sub.teacherScore === null || sub.teacherScore === undefined));

      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        sub.studentName.toLowerCase().includes(q) ||
        sub.className.toLowerCase().includes(q) ||
        sub.answer.toLowerCase().includes(q);

      return matchesSubtopic && matchesQuestion && matchesGrading && matchesQuery;
    });
  }, [submissions, subtopicFilter, questionFilter, gradingFilter, searchQuery]);

  // Handle submit penilaian guru
  const handleSaveGrade = async (sub: EssaySubmission) => {
    const rawScore = gradingScores[sub.id] ?? (sub.teacherScore !== null && sub.teacherScore !== undefined ? String(sub.teacherScore) : '');
    const feedback = gradingFeedbacks[sub.id] ?? (sub.teacherFeedback || '');

    const parsedScore = rawScore === '' ? null : Number(rawScore);
    if (parsedScore !== null && (Number.isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100)) {
      alert('Masukkan nilai yang valid antara 0 sampai 100.');
      return;
    }

    setSavingId(sub.id);
    try {
      await gradeEssaySubmission({
        submissionId: sub.id,
        score: parsedScore,
        feedback: feedback.trim(),
      });

      // Update state lokal
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === sub.id
            ? { ...item, teacherScore: parsedScore, teacherFeedback: feedback.trim() }
            : item
        )
      );

      setSaveSuccessMap((prev) => ({ ...prev, [sub.id]: 'Nilai tersimpan!' }));
      setTimeout(() => {
        setSaveSuccessMap((prev) => {
          const next = { ...prev };
          delete next[sub.id];
          return next;
        });
      }, 3000);
    } catch (err) {
      console.error('Gagal menyimpan penilaian essay:', err);
      alert('Gagal menyimpan nilai essay. Silakan periksa koneksi.');
    } finally {
      setSavingId(null);
    }
  };

  // Unduh spreadsheet CSV
  const handleDownloadCSV = () => {
    const rows = [
      ['Nama Siswa', 'Kelas', 'Subtopik', 'Nomor Soal', 'Pertanyaan', 'Jawaban Lengkap Siswa', 'Nilai Guru', 'Catatan Guru', 'Waktu Simpan'],
      ...submissions.map((sub) => [
        sub.studentName,
        sub.className || '—',
        sub.subtopicTitle,
        `Soal ${sub.questionNumber}`,
        sub.prompt,
        sub.answer,
        sub.teacherScore !== null && sub.teacherScore !== undefined ? String(sub.teacherScore) : 'Belum dinilai',
        sub.teacherFeedback || '—',
        new Date(sub.updatedAt || sub.savedAt).toLocaleString('id-ID'),
      ]),
    ];

    const csvContent = `\uFEFF${rows.map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\r\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rekap-latihan-essay-atomika-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const gradedCount = submissions.filter((s) => typeof s.teacherScore === 'number').length;
  const ungradedCount = submissions.length - gradedCount;

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFEDD5] text-[#C2410C] mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Rekap Jawaban Soal Essay</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#172033]">
            Rekap Latihan Soal Essay Struktur Atom
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            Tinjau seluruh jawaban essay 6 soal siswa tanpa terpotong, berikan skor penilaian konseptual, dan kirimkan catatan feedback guru.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadCSV}
            disabled={submissions.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#F1E5D8] bg-white hover:bg-orange-50/50 text-xs sm:text-sm font-semibold text-[#172033] shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-[#C2410C]" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Metrik */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs">
          <span className="text-xs font-medium text-[#64748B]">Total Jawaban Masuk</span>
          <div className="text-2xl font-black text-[#172033] mt-1">{submissions.length}</div>
          <span className="text-[11px] text-[#C2410C]">Dari 6 soal essay</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs">
          <span className="text-xs font-medium text-[#64748B]">Siswa Mengisi</span>
          <div className="text-2xl font-black text-[#172033] mt-1">
            {studentMatrix.filter((s) => s.answeredCount > 0).length}
          </div>
          <span className="text-[11px] text-green-700">dari {studentRoster.length} siswa</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs">
          <span className="text-xs font-medium text-[#64748B]">Sudah Dinilai</span>
          <div className="text-2xl font-black text-[#15803D] mt-1">{gradedCount}</div>
          <span className="text-[11px] text-[#64748B]">jawaban dinilai</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs">
          <span className="text-xs font-medium text-[#64748B]">Perlu Penilaian</span>
          <div className="text-2xl font-black text-[#C2410C] mt-1">{ungradedCount}</div>
          <span className="text-[11px] text-[#C2410C]">menunggu penilaian</span>
        </div>
      </div>

      {/* Kontrol Filter & Sub-tab */}
      <div className="p-4 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Toggle sub-tab view */}
        <div className="flex items-center gap-1.5 p-1 bg-orange-50/60 rounded-xl border border-orange-100 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('answers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeSubTab === 'answers'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#172033]'
            }`}
          >
            Jawaban Siswa & Penilaian ({filteredSubmissions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeSubTab === 'matrix'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#172033]'
            }`}
          >
            Matriks Pengerjaan Siswa ({studentMatrix.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Subtopik */}
          <select
            value={subtopicFilter}
            onChange={(e) => setSubtopicFilter(e.target.value as any)}
            className="rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-medium text-[#172033] outline-none focus:border-[#C2410C]"
          >
            <option value="all">Semua Subtopik</option>
            {ESSAY_SUBTOPICS.map((st) => (
              <option key={st.id} value={st.id}>
                {st.title}
              </option>
            ))}
          </select>

          {/* Filter Soal */}
          <select
            value={questionFilter}
            onChange={(e) => setQuestionFilter(e.target.value)}
            className="rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-medium text-[#172033] outline-none focus:border-[#C2410C]"
          >
            <option value="all">Semua Nomor Soal</option>
            {ESSAY_QUESTIONS.map((q) => (
              <option key={q.id} value={q.id}>
                Soal {q.number}: {q.prompt.slice(0, 30)}...
              </option>
            ))}
          </select>

          {/* Filter Status Penilaian */}
          <select
            value={gradingFilter}
            onChange={(e) => setGradingFilter(e.target.value as any)}
            className="rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-medium text-[#172033] outline-none focus:border-[#C2410C]"
          >
            <option value="all">Semua Status</option>
            <option value="ungraded">Belum Dinilai</option>
            <option value="graded">Sudah Dinilai</option>
          </select>

          {/* Search Bar */}
          <div className="relative min-w-[160px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa/teks..."
              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs text-[#172033] outline-none focus:border-[#C2410C]"
            />
          </div>
        </div>
      </div>

      {/* VIEW 1: KARTU JAWABAN SISWA & FORM PENILAIAN */}
      {activeSubTab === 'answers' ? (
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="rounded-3xl border border-[#F1E5D8] bg-white p-8 text-center text-[#64748B]">
              <BookOpen className="w-8 h-8 text-[#C2410C] mx-auto mb-2 opacity-60" />
              <p className="font-bold text-sm text-[#172033]">Tidak ada jawaban essay yang sesuai filter.</p>
              <p className="text-xs text-[#64748B] mt-1">
                Data akan tampil otomatis saat siswa mengisi dan menyimpan jawaban latihan essay.
              </p>
            </div>
          ) : (
            filteredSubmissions.map((sub) => {
              const currentScoreVal =
                gradingScores[sub.id] ??
                (sub.teacherScore !== null && sub.teacherScore !== undefined
                  ? String(sub.teacherScore)
                  : '');
              const currentFeedbackVal =
                gradingFeedbacks[sub.id] ?? (sub.teacherFeedback || '');
              const isGraded = typeof sub.teacherScore === 'number';

              return (
                <article
                  key={sub.id}
                  className="rounded-3xl border border-[#F1E5D8] bg-white p-5 sm:p-6 shadow-xs space-y-4 transition-all"
                >
                  {/* Header Kartu Jawaban */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1E5D8] pb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-extrabold text-[#172033] text-base">
                        {sub.studentName}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {sub.className || 'Kelas —'}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFEDD5] text-[#C2410C] font-bold">
                        Soal {sub.questionNumber}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-50 text-[#9A3412] font-medium">
                        {sub.subtopicTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        Tersimpan:{' '}
                        {new Date(sub.updatedAt || sub.savedAt).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Pertanyaan Essay */}
                  <div className="bg-[#FFF8F0]/70 p-3.5 rounded-2xl border border-[#F97316]/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C] block mb-1">
                      Pertanyaan Soal {sub.questionNumber}:
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-[#172033] leading-relaxed">
                      {sub.prompt}
                    </p>
                  </div>

                  {/* Teks Jawaban Lengkap Siswa (Tidak Terpotong) */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[#475569] flex items-center gap-1.5">
                      <FileEdit className="w-3.5 h-3.5 text-[#C2410C]" />
                      <span>Teks Jawaban Siswa:</span>
                    </span>
                    <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs">
                      <p className="text-xs sm:text-sm text-[#172033] leading-relaxed whitespace-pre-wrap font-sans">
                        {sub.answer}
                      </p>
                    </div>
                  </div>

                  {/* Area Penilaian & Feedback Guru */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#172033] flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-[#C2410C]" />
                        <span>Penilaian & Catatan Pengajar</span>
                      </span>

                      {isGraded ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          <span>Nilai Tersimpan: {sub.teacherScore}/100</span>
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Belum dinilai
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {/* Input Skor (0-100) */}
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-[#475569] mb-1">
                          Skor Nilai (0 - 100)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={currentScoreVal}
                          onChange={(e) =>
                            setGradingScores((prev) => ({ ...prev, [sub.id]: e.target.value }))
                          }
                          placeholder="Nilai..."
                          className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-sm font-bold text-[#172033] outline-none focus:border-[#C2410C]"
                        />
                      </div>

                      {/* Textarea Feedback Guru */}
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-[#475569] mb-1">
                          Catatan / Feedback untuk Siswa
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={currentFeedbackVal}
                            onChange={(e) =>
                              setGradingFeedbacks((prev) => ({
                                ...prev,
                                [sub.id]: e.target.value,
                              }))
                            }
                            placeholder="Tulis ulasan, apresiasi, atau arahan perbaikan konsep..."
                            className="flex-1 px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm text-[#172033] outline-none focus:border-[#C2410C]"
                          />
                          <button
                            type="button"
                            disabled={savingId === sub.id}
                            onClick={() => handleSaveGrade(sub)}
                            className="shrink-0 px-4 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            {savingId === sub.id ? 'Menyimpan...' : 'Simpan'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {saveSuccessMap[sub.id] && (
                      <p className="text-xs text-green-700 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>{saveSuccessMap[sub.id]}</span>
                      </p>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      ) : (
        /* VIEW 2: MATRIKS STATUS PENGERJAAN 6 SOAL PER SISWA */
        <div className="rounded-3xl border border-[#F1E5D8] bg-white p-5 shadow-xs overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#172033]">
                Matriks Kelengkapan Pengerjaan Essay Siswa
              </h3>
              <p className="text-xs text-[#64748B]">
                Pantau siswa yang sudah mengumpulkan maupun yang belum mengerjakan tiap nomor soal (1 sampai 6).
              </p>
            </div>
            <span className="text-xs text-[#64748B]">{studentMatrix.length} siswa</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs sm:text-sm">
              <thead className="border-b border-[#F1E5D8] text-xs uppercase text-[#64748B] bg-[#FFF8F0]/60">
                <tr>
                  <th className="px-4 py-3">Nama Siswa</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-3 py-3 text-center">Soal 1</th>
                  <th className="px-3 py-3 text-center">Soal 2</th>
                  <th className="px-3 py-3 text-center">Soal 3</th>
                  <th className="px-3 py-3 text-center">Soal 4</th>
                  <th className="px-3 py-3 text-center">Soal 5</th>
                  <th className="px-3 py-3 text-center">Soal 6</th>
                  <th className="px-4 py-3 text-center">Total Terjawab</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1E5D8]/70">
                {studentMatrix.map((student) => {
                  return (
                    <tr key={student.uid} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-[#172033]">{student.name}</td>
                      <td className="px-4 py-3.5 text-[#64748B]">{student.className}</td>

                      {/* Kolom Soal 1..6 */}
                      {ESSAY_QUESTIONS.map((q) => {
                        const isDone = student.answeredMap[q.id];
                        return (
                          <td key={q.id} className="px-3 py-3.5 text-center">
                            {isDone ? (
                              <span
                                title={`Soal ${q.number}: Sudah dikerjakan`}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold mx-auto"
                              >
                                ✓
                              </span>
                            ) : (
                              <span
                                title={`Soal ${q.number}: Belum dikerjakan`}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-300 mx-auto"
                              >
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* Total Terjawab */}
                      <td className="px-4 py-3.5 text-center font-bold">
                        <span className="text-[#C2410C]">{student.answeredCount}</span>
                        <span className="text-[#64748B]"> / 6</span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5 text-center">
                        {student.answeredCount === 6 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            <span>Lengkap (6/6)</span>
                          </span>
                        ) : student.answeredCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            <span>Sebagian ({student.answeredCount}/6)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                            <span>Belum mengisi</span>
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
      )}
    </div>
  );
}
