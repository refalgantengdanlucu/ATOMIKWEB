import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AccessGate } from './components/AccessGate';
import { AccessProvider } from './components/AccessProvider';
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

// Sinkronisasi rute jika pengguna membuka URL berformat hash (#/materi)
function RouteHashSync() {
  const navigate = useNavigate();
  useEffect(() => {
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      const targetPath = window.location.hash.slice(1);
      navigate(targetPath, { replace: true });
    }
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteHashSync />
      <AccessProvider>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/forgot-password" element={<AuthPage />} />
          <Route path="/reset-password" element={<AuthPage />} />
          <Route path="/*" element={<ProtectedApp />} />
        </Routes>
      </AccessProvider>
    </BrowserRouter>
  );
}

function ProtectedApp() {
  return (
    <AccessGate>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </AccessGate>
  );
}
