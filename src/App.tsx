import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { LearnPage } from './pages/LearnPage';
import { CompilerPage } from './pages/CompilerPage';
import { SyntaxPage } from './pages/SyntaxPage';
import { PracticePage } from './pages/PracticePage';
import { AiTutorPage } from './pages/AiTutorPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/compiler" element={<CompilerPage />} />
        <Route path="/syntax" element={<SyntaxPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/tutor" element={<AiTutorPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
