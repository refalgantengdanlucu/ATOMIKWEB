import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  Save,
  Sparkles,
} from 'lucide-react';
import { useAccess } from '../lib/access-context';
import { ESSAY_QUESTIONS, ESSAY_SUBTOPICS, type EssayQuestion } from '../data/essayQuestions';
import {
  loadStudentEssayAnswers,
  saveEssayAnswer,
  type EssaySubmission,
} from '../lib/essay-db';

export function EssayExercisePage() {
  const { profile } = useAccess();
  const [activeTab, setActiveTab] = useState<'t1' | 't2' | 't3'>('t1');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0); // 0 to 5
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savedSubmissions, setSavedSubmissions] = useState<Record<string, EssaySubmission>>({});
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ id: string; msg: string; type: 'success' | 'error' } | null>(null);

  const uid = profile?.uid || 'anonymous';
  const currentQuestion = ESSAY_QUESTIONS[selectedQuestionIndex];

  // Muat jawaban yang tersimpan saat pertama kali dibuka
  useEffect(() => {
    let active = true;
    void loadStudentEssayAnswers(uid).then((data) => {
      if (!active) return;
      setSavedSubmissions(data);
      const textMap: Record<string, string> = {};
      Object.entries(data).forEach(([qId, sub]) => {
        textMap[qId] = sub.answer;
      });
      setAnswers((prev) => ({ ...textMap, ...prev }));
    });
    return () => {
      active = false;
    };
  }, [uid]);

  // Sinkronkan tab saat index soal berpindah
  useEffect(() => {
    if (currentQuestion) {
      setActiveTab(currentQuestion.subtopicId);
    }
  }, [selectedQuestionIndex, currentQuestion]);

  const handleTabChange = (subtopicId: 't1' | 't2' | 't3') => {
    setActiveTab(subtopicId);
    // Buka soal pertama pada subtopik tersebut
    const firstQIndex = ESSAY_QUESTIONS.findIndex((q) => q.subtopicId === subtopicId);
    if (firstQIndex !== -1) {
      setSelectedQuestionIndex(firstQIndex);
    }
  };

  const handleAnswerChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSave = async (question: EssayQuestion) => {
    const text = answers[question.id] || '';
    if (!text.trim()) {
      setNotification({
        id: question.id,
        msg: 'Jawaban belum diketik. Tuliskan penjelasan Anda sebelum menyimpan.',
        type: 'error',
      });
      return;
    }

    setSavingQuestionId(question.id);
    setNotification(null);

    try {
      const saved = await saveEssayAnswer({
        uid,
        studentName: profile?.name || 'Siswa ATOMIKA',
        className: profile?.role === 'student' ? profile.className : 'Umum',
        questionId: question.id,
        questionNumber: question.number,
        subtopicId: question.subtopicId,
        subtopicTitle: question.subtopicTitle,
        prompt: question.prompt,
        answer: text,
        institutionId: profile?.institutionId,
      });

      setSavedSubmissions((prev) => ({ ...prev, [question.id]: saved }));
      setNotification({
        id: question.id,
        msg: profile?.uid
          ? 'Jawaban berhasil disimpan ke akun Anda!'
          : 'Jawaban berhasil disimpan pada perangkat ini.',
        type: 'success',
      });
    } catch (err: unknown) {
      setNotification({
        id: question.id,
        msg: err instanceof Error ? err.message : 'Gagal menyimpan jawaban. Coba beberapa saat lagi.',
        type: 'error',
      });
    } finally {
      setSavingQuestionId(null);
    }
  };

  const answeredCount = ESSAY_QUESTIONS.filter((q) => Boolean(savedSubmissions[q.id]?.answer?.trim())).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      {/* Header Halaman */}
      <div>
        <Link
          to="/materi"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#C2410C] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Buku Materi
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFEDD5] px-3 py-1 text-xs font-bold text-[#9A3412]">
              <Sparkles className="h-3.5 w-3.5 text-[#F97316]" aria-hidden="true" />
              <span>Latihan Pemahaman Konsep</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#172033] sm:text-3xl">
              Latihan Soal Essay Struktur Atom
            </h1>
            <p className="mt-1 text-sm text-[#475569]">
              Jawab pertanyaan essay berikut dengan penjelasan runtut dan logis berdasarkan materi yang telah dipelajari.
            </p>
          </div>
          <div className="rounded-2xl border border-[#F1E5D8] bg-white px-4 py-2.5 text-right shadow-xs">
            <span className="block text-xs font-semibold text-[#64748B]">Progres Latihan</span>
            <span className="text-lg font-black text-[#C2410C]">{answeredCount} / 6</span>
            <span className="text-xs text-[#64748B]"> Soal Tersimpan</span>
          </div>
        </div>
      </div>

      {/* Tab Subtopik */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {ESSAY_SUBTOPICS.map((subtopic) => {
          const isActive = activeTab === subtopic.id;
          const answeredInTab = subtopic.questionNumbers.filter(
            (num) => Boolean(savedSubmissions[`essay-${num}`]?.answer?.trim())
          ).length;

          return (
            <button
              type="button"
              key={subtopic.id}
              onClick={() => handleTabChange(subtopic.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                isActive
                  ? 'border-[#C2410C] bg-[#C2410C] text-white shadow-xs'
                  : 'border-[#F1E5D8] bg-white text-[#475569] hover:bg-orange-50/70 hover:text-[#172033]'
              }`}
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>{subtopic.title}</span>
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#FFF8F0] text-[#C2410C]'
                }`}
              >
                {answeredInTab}/2
              </span>
            </button>
          );
        })}
      </div>

      {/* Navigasi Pill Nomor Soal 1 s.d. 6 */}
      <div className="flex items-center gap-2 rounded-2xl border border-[#F1E5D8] bg-white p-2 shadow-xs">
        <span className="px-3 text-xs font-bold text-[#64748B]">Nomor Soal:</span>
        <div className="flex flex-wrap gap-1.5">
          {ESSAY_QUESTIONS.map((q, idx) => {
            const isSelected = selectedQuestionIndex === idx;
            const isAnswered = Boolean(savedSubmissions[q.id]?.answer?.trim());

            return (
              <button
                type="button"
                key={q.id}
                onClick={() => setSelectedQuestionIndex(idx)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#C2410C] text-white ring-2 ring-[#C2410C] ring-offset-1'
                    : isAnswered
                    ? 'border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'border border-[#F1E5D8] bg-[#FFF8F0] text-[#475569] hover:border-orange-300 hover:text-[#172033]'
                }`}
                title={`Soal ${q.number}: ${isAnswered ? 'Sudah dijawab' : 'Belum dijawab'}`}
              >
                {q.number}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kartu Soal & Kolom Jawaban */}
      {currentQuestion && (
        <section className="rounded-3xl border border-[#F1E5D8] bg-white p-5 shadow-sm sm:p-8">
          {/* Header Soal & Indikator Status */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#F1E5D8] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
                {currentQuestion.subtopicTitle}
              </span>
              <h2 className="mt-1 text-xl font-extrabold text-[#172033]">
                Soal Nomor {currentQuestion.number}
              </h2>
            </div>
            <div>
              {savedSubmissions[currentQuestion.id]?.answer?.trim() ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Sudah dijawab
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
                  <HelpCircle className="h-4 w-4" aria-hidden="true" />
                  Belum dijawab
                </span>
              )}
            </div>
          </div>

          {/* Teks Pertanyaan Lengkap */}
          <div className="my-5 rounded-2xl bg-[#FFF8F0] p-4 sm:p-5">
            <p className="whitespace-pre-line text-sm leading-relaxed text-[#172033] sm:text-base font-medium">
              {currentQuestion.prompt}
            </p>
          </div>

          {/* Kolom Jawaban Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor={`answer-${currentQuestion.id}`} className="text-xs font-bold text-[#475569]">
                Jawaban dan Penjelasan Anda:
              </label>
              {savedSubmissions[currentQuestion.id]?.updatedAt && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#64748B]">
                  <Clock className="h-3 w-3" />
                  Terakhir disimpan:{' '}
                  {new Date(savedSubmissions[currentQuestion.id].updatedAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>

            <textarea
              id={`answer-${currentQuestion.id}`}
              rows={8}
              value={answers[currentQuestion.id] ?? ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Tuliskan jawaban dan penjelasan lengkap Anda di sini..."
              className="w-full rounded-2xl border border-[#E8D8C8] bg-white p-4 text-sm leading-relaxed text-[#172033] outline-none transition-colors focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20"
            />
          </div>

          {/* Notifikasi feedback simpan */}
          {notification && notification.id === currentQuestion.id && (
            <div
              className={`mt-4 rounded-xl border p-3 text-xs font-semibold ${
                notification.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-rose-200 bg-rose-50 text-rose-800'
              }`}
              role="alert"
            >
              {notification.msg}
            </div>
          )}

          {/* Tombol Simpan & Navigasi */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#F1E5D8] pt-5">
            <button
              type="button"
              onClick={() => handleSave(currentQuestion)}
              disabled={savingQuestionId === currentQuestion.id}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#C2410C] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#9A3412] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>{savingQuestionId === currentQuestion.id ? 'Menyimpan ke Firebase...' : 'Simpan Jawaban'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={selectedQuestionIndex === 0}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[#F1E5D8] bg-white px-4 text-sm font-semibold text-[#475569] transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Soal Sebelumnya
              </button>

              <button
                type="button"
                onClick={() => setSelectedQuestionIndex((prev) => Math.min(ESSAY_QUESTIONS.length - 1, prev + 1))}
                disabled={selectedQuestionIndex === ESSAY_QUESTIONS.length - 1}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[#F1E5D8] bg-white px-4 text-sm font-semibold text-[#475569] transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Soal Berikutnya <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
