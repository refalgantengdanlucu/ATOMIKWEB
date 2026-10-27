import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppHeader } from './components/AppHeader';
import { HomePage } from './pages/HomePage';
import { MateriPage } from './pages/MateriPage';
import { MateriDetailPage } from './pages/MateriDetailPage';
import { LabPage } from './pages/LabPage';
import { QuizListPage } from './pages/QuizListPage';
import { QuizSessionPage } from './pages/QuizSessionPage';
import { ProgressPage } from './pages/ProgressPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-[#FFF8F0] text-[#172033]">
        {/* Header & Main Navigation */}
        <AppHeader />

        {/* Content Area */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/materi" element={<MateriPage />} />
            <Route path="/materi/:topicId" element={<MateriDetailPage />} />
            <Route path="/lab" element={<Navigate to="/lab/partikel" replace />} />
            <Route path="/lab/:mode" element={<LabPage />} />
            <Route path="/kuis" element={<QuizListPage />} />
            <Route path="/kuis/:topicId" element={<QuizSessionPage />} />
            <Route path="/progres" element={<ProgressPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#F1E5D8] bg-white py-8 px-4 sm:px-6 mb-16 md:mb-0">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#172033]">ATOMIKA</span>
              <span>·</span>
              <span>Media Pembelajaran Struktur Atom SMA/MA Fase E</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Bahasa Indonesia</span>
              <span>·</span>
              <span>Penyimpanan Lokal (Anonim)</span>
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
}
