import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import StatusBar from './components/StatusBar.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ModalRoot from './components/modals/ModalRoot.jsx';
import Home from './pages/Home.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Route-level code splitting
const MissionControlPage = lazy(() => import('./pages/MissionControlPage.jsx'));
const ArchitecturePage = lazy(() => import('./pages/ArchitecturePage.jsx'));
const ResearchPage = lazy(() => import('./pages/ResearchPage.jsx'));
const TeamPage = lazy(() => import('./pages/TeamPage.jsx'));
const SponsorPage = lazy(() => import('./pages/SponsorPage.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PageFallback() {
  return (
    <div className="py-32 text-center font-mono text-sm text-slate-500" role="status">
      <span className="inline-block w-2 h-2 rounded-full bg-cyan pulse-dot mr-2" />
      ACQUIRING SIGNAL…
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] btn btn-primary">
        Skip to content
      </a>
      <ScrollToTop />
      <StatusBar />
      <Navbar />
      <main id="main" className="max-w-7xl mx-auto px-4">
        <ErrorBoundary key={pathname}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mission-control" element={<MissionControlPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/sponsor" element={<SponsorPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <ModalRoot />
    </>
  );
}
