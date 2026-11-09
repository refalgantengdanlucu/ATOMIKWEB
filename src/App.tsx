import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { MateriPage } from './pages/MateriPage';
import { MateriDetailPage } from './pages/MateriDetailPage';
import { LaboratoriumPage } from './pages/LaboratoriumPage';
import { QuizListPage } from './pages/QuizListPage';
import { QuizSessionPage } from './pages/QuizSessionPage';
import { ProgressPage } from './pages/ProgressPage';
import { ClassroomToolsPage } from './pages/ClassroomToolsPage';
import { NotFoundPage } from './pages/NotFoundPage';

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
      <Layout>
        <Routes>
          {/* 1. Halaman Beranda (Hanya menampilkan Hero & Panduan Fitur) */}
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
          {/* Kompatibilitas alias rute /lab */}
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

          {/* 6. Kuis, polling, presensi, dan progres kelas */}
          <Route path="/kelas" element={<ClassroomToolsPage />} />

          {/* 7. Halaman 404 Tidak Ditemukan */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
