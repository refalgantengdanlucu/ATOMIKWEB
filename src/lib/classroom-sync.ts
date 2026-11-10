import { TEACHER_PIN } from './classroom';
import type { AccessProfile } from './access-context';
import type { QuizAttempt, StudentActivity, StudentProgress } from './classroom';

export const CLASSROOM_SHEETS_WEB_APP_URL = ''; // Isi URL Web App yang berakhiran /exec.

export interface TeacherSheetsData {
  ok: boolean;
  error?: string;
  activities: StudentActivity[];
  quizzes: TrackedQuizResult[];
  progress: StudentProgress[];
}

export interface TrackedQuizResult extends QuizAttempt {
  className: string;
  quizTitle: string;
  maxScore: number;
  percent: number;
}

export type SyncResult = 'not-configured' | 'sent' | 'failed';

export function isSheetsSyncConfigured(): boolean {
  return CLASSROOM_SHEETS_WEB_APP_URL.trim().length > 0;
}

export async function sendActivityToSheets(
  profile: AccessProfile,
  activity: StudentActivity,
): Promise<SyncResult> {
  if (!isSheetsSyncConfigured()) return 'not-configured';
  if (profile.role !== 'student') return 'not-configured';
  try {
    await fetch(CLASSROOM_SHEETS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'activity', ...activity }),
    });
    return 'sent';
  } catch (error) {
    console.error('Gagal mengirim aktivitas ke Google Sheets:', error);
    return 'failed';
  }
}

export async function sendQuizToSheets(
  quiz: QuizAttempt,
  className: string,
): Promise<SyncResult> {
  if (!isSheetsSyncConfigured()) return 'not-configured';
  try {
    await fetch(CLASSROOM_SHEETS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'quiz', ...quiz, className, quizTitle: 'Klasifikasi Jenis Reaksi Kimia', maxScore: 10 }),
    });
    return 'sent';
  } catch (error) {
    console.error('Gagal mengirim hasil kuis ke Google Sheets:', error);
    return 'failed';
  }
}

export async function sendProgressToSheets(
  progress: StudentProgress,
  className: string,
): Promise<SyncResult> {
  if (!isSheetsSyncConfigured()) return 'not-configured';
  try {
    await fetch(CLASSROOM_SHEETS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'task-progress', ...progress, className }),
    });
    return 'sent';
  } catch (error) {
    console.error('Gagal mengirim progres tugas ke Google Sheets:', error);
    return 'failed';
  }
}

export function loadTeacherDataFromSheets(): Promise<TeacherSheetsData> {
  if (!isSheetsSyncConfigured()) {
    return Promise.reject(new Error('URL Web App Google Sheets belum diatur.'));
  }

  return new Promise((resolve, reject) => {
    const callbackName = `atomikaSheets_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const callback = (response: TeacherSheetsData) => {
      cleanup();
      if (response.ok) resolve(response);
      else reject(new Error(response.error || 'Google Sheets menolak permintaan dashboard.'));
    };
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Tidak ada respons dari Google Sheets. Periksa URL Web App dan koneksi internet.'));
    }, 12000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      Reflect.deleteProperty(window, callbackName);
      script.remove();
    };

    Object.assign(window, { [callbackName]: callback });
    script.onerror = () => {
      cleanup();
      reject(new Error('Dashboard Google Sheets tidak dapat dimuat. Periksa URL deployment Web App.'));
    };
    script.src = `${CLASSROOM_SHEETS_WEB_APP_URL}?action=dashboard&pin=${encodeURIComponent(TEACHER_PIN)}&callback=${callbackName}&t=${Date.now()}`;
    document.head.appendChild(script);
  });
}
