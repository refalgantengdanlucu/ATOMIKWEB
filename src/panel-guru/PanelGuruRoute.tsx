import { Navigate } from 'react-router-dom';
import { TeacherDashboard } from './TeacherDashboard';
import { useTeacherAccess } from './useTeacherAccess';

export function PanelGuruRoute() {
  const access = useTeacherAccess();

  if (access === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8F0] text-[#475569]" aria-live="polite">
        Memeriksa akses guru...
      </main>
    );
  }

  if (access !== 'allowed') return <Navigate to="/" replace />;
  return <TeacherDashboard />;
}
