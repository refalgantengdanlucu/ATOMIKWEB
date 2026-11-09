import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { MateriPage } from './pages/MateriPage';
import { MateriDetailPage } from './pages/MateriDetailPage';
import { LaboratoriumPage } from './pages/LaboratoriumPage';
import { QuizListPage } from './pages/QuizListPage';
import { QuizSessionPage } from './pages/QuizSessionPage';
import { ProgressPage } from './pages/ProgressPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          {/* 1. Halaman Beranda Mandiri */}
          <Route path="/" element={<HomePage />} />

          {/* 2. Halaman Materi Pembelajaran */}
          <Route path="/materi" element={<MateriPage />} />
          <Route path="/materi/:topicId" element={<MateriDetailPage />} />

          {/* 3. Halaman Laboratorium Kimia Virtual */}
          <Route
            path="/laboratorium"
            element={<Navigate to="/laboratorium/partikel" replace />}
          />
          <Route path="/laboratorium/:mode" element={<LaboratoriumPage />} />
          {/* Kompatibilitas untuk rute /lab */}
          <Route
            path="/lab"
            element={<Navigate to="/laboratorium/partikel" replace />}
          />
          <Route path="/lab/:mode" element={<LaboratoriumPage />} />

          {/* 4. Halaman Kuis Berumpan Balik */}
          <Route path="/kuis" element={<QuizListPage />} />
          <Route path="/kuis/:topicId" element={<QuizSessionPage />} />

          {/* 5. Halaman Progres Belajar Anonim */}
          <Route path="/progres" element={<ProgressPage />} />

          {/* 6. Halaman 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
