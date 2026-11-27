import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AccessGate, LoginRequiredGate } from './components/AccessGate';
import { AccessProvider, } from './components/AccessProvider';
import { useAccess } from './lib/access-context';
import { HomePage } from './pages/HomePage';
import { MateriPage } from './pages/MateriPage';
import { MateriDetailPage } from './pages/MateriDetailPage';
import { LaboratoriumPage } from './pages/LaboratoriumPage';
import { QuizListPage } from './pages/QuizListPage';
import { QuizSessionPage } from './pages/QuizSessionPage';
import { ProgressPage } from './pages/ProgressPage';
import { ClassroomToolsPage } from './pages/ClassroomToolsPage';
import { PresencePage } from './pages/PresencePage';
import { EssayExercisePage } from './pages/EssayExercisePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AuthPage } from './pages/AuthPage';
import { PanelGuruRoute } from './panel-guru/PanelGuruRoute';

export default function App() {
  return (
    <HashRouter>
      <AccessProvider>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/forgot-password" element={<AuthPage />} />
          <Route path="/reset-password" element={<AuthPage />} />
          <Route path="/panel-guru/*" element={<PanelGuruRoute />} />
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />
          <Route path="/*" element={<ProtectedApp />} />
        </Routes>
      </AccessProvider>
    </HashRouter>
  );
}

function DashboardRedirect() {
  const { profile } = useAccess();
  return <Navigate to={profile?.role === 'teacher' ? '/panel-guru' : '/materi'} replace />;
}

function LegacyClassroomRoute() {
  const location = useLocation();
  const activity = new URLSearchParams(location.search).get('aktivitas');
  if (!activity || activity === 'attendance') {
    return <Navigate to="/presensi" replace />;
  }
  return (
    <LoginRequiredGate>
      <ClassroomToolsPage />
    </LoginRequiredGate>
  );
}

function ProtectedApp() {
  return (
    <AccessGate>
      <Layout>
        <Routes>
          <Route path="/materi" element={<MateriPage />} />
          <Route path="/materi/essay" element={<EssayExercisePage />} />
          <Route path="/materi/:topicId" element={<MateriDetailPage />} />
          <Route path="/laboratorium" element={<Navigate to="/laboratorium/partikel" replace />} />
          <Route path="/laboratorium/:mode" element={<LaboratoriumPage />} />
          <Route path="/lab" element={<Navigate to="/laboratorium/partikel" replace />} />
          <Route path="/lab/:mode" element={<LaboratoriumPage />} />
          <Route path="/kuis" element={<QuizListPage />} />
          <Route path="/kuis/:topicId" element={<QuizSessionPage />} />
          <Route path="/progres" element={<LoginRequiredGate><ProgressPage /></LoginRequiredGate>} />
          <Route path="/presensi" element={<LoginRequiredGate><PresencePage /></LoginRequiredGate>} />
          <Route path="/kelas" element={<LegacyClassroomRoute />} />
          <Route path="/dashboard" element={<LoginRequiredGate><DashboardRedirect /></LoginRequiredGate>} />
          <Route path="/guru" element={<Navigate to="/panel-guru" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </AccessGate>
  );
}
