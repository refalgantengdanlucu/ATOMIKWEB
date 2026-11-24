import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AccessGate } from './components/AccessGate';
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
          {/* Landing Page Publik ATOMIKA (dapat diakses sebelum login) */}
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
  return <Navigate to={profile?.role === 'teacher' ? '/kelas' : '/materi'} replace />;
}

function ProtectedApp() {
  return (
    <AccessGate>
      <Layout>
        <Routes>
          <Route path="/materi" element={<MateriPage />} />
          <Route path="/materi/:topicId" element={<MateriDetailPage />} />
          <Route path="/laboratorium" element={<Navigate to="/laboratorium/partikel" replace />} />
          <Route path="/laboratorium/:mode" element={<LaboratoriumPage />} />
          <Route path="/lab" element={<Navigate to="/laboratorium/partikel" replace />} />
          <Route path="/lab/:mode" element={<LaboratoriumPage />} />
          <Route path="/kuis" element={<QuizListPage />} />
          <Route path="/kuis/:topicId" element={<QuizSessionPage />} />
          <Route path="/progres" element={<ProgressPage />} />
          <Route path="/kelas" element={<ClassroomToolsPage />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/guru" element={<Navigate to="/kelas" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </AccessGate>
  );
}
