import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
// import { Agentation } from 'agentation'; // Removed static import

// Lazy load Agentation to avoid bundling it in production
const Agentation = lazy(() => import('agentation').then(module => ({ default: module.Agentation })));
import { Routes, Route, Navigate } from 'react-router-dom';
import { TrackedDegreesProvider } from './context/TrackedDegreesContext';
import './App.css';
// Eagerly loaded — landing page + global shell
import { HomePage } from './pages/HomePage';
import { calculateAdmissionStats } from './utils/calculation-bridge';
import { initializeGTM, trackEvent } from './utils/gtm';
import type { SubjectGrade, PsychometricScores } from './utils/calculator';
import { loadUserData, saveUserData, type UserData } from './lib/userData';
import { CookieConsent } from './components/CookieConsent';
import { AccessibilityWidget } from './components/AccessibilityWidget';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ReturnToBot } from './components/ReturnToBot';
import { TrackedDegreesWidget } from './components/TrackedDegreesWidget';
import { useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { isProduction } from './utils/env';
// Lazy loaded — secondary pages
const CalculatorPage = lazy(() => import('./pages/CalculatorPage').then(m => ({ default: m.CalculatorPage })));
const ProgramPage = lazy(() => import('./pages/ProgramPage').then(m => ({ default: m.ProgramPage })));
const ProgramsExplorer = lazy(() => import('./components/ProgramsExplorer/ProgramsExplorer').then(m => ({ default: m.ProgramsExplorer })));
const UnifiedDashboard = lazy(() => import('./components/Dashboard/UnifiedDashboard').then(m => ({ default: m.UnifiedDashboard })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const ArticlePage = lazy(() => import('./pages/ArticlePage').then(m => ({ default: m.ArticlePage })));
const ImportantDatesPage = lazy(() => import('./pages/ImportantDatesPage').then(m => ({ default: m.ImportantDatesPage })));
const CollaborationsPage = lazy(() => import('./pages/CollaborationsPage').then(m => ({ default: m.CollaborationsPage })));
const WriteForUsPage = lazy(() => import('./pages/WriteForUsPage').then(m => ({ default: m.WriteForUsPage })));
const TrackedDegreesPage = lazy(() => import('./pages/TrackedDegreesPage').then(m => ({ default: m.TrackedDegreesPage })));
const TermsOfUse = lazy(() => import('./components/TermsOfUse').then(m => ({ default: m.TermsOfUse })));
const CampaignMobileFirst = lazy(() => import('./pages/CampaignMobileFirst').then(m => ({ default: m.CampaignMobileFirst })));
const ProgramsDatabaseViewer = lazy(() => import('./components/Debug/ProgramsDatabaseViewer').then(m => ({ default: m.ProgramsDatabaseViewer })));
const Backstage = lazy(() => import('./pages/Backstage').then(m => ({ default: m.Backstage })));


function SidebarLayout({ children, userStats }: { children: React.ReactNode; userStats: any }) {
  return (
    <div className="flex" dir="rtl">
      <div className="flex-1 min-w-0">
        {children}
      </div>
      <aside className="hidden lg:block w-60 shrink-0 border-r border-gray-200/60 bg-white/50">
        <div className="sticky top-0 h-screen overflow-y-auto custom-scrollbar p-3 pt-4">
          <TrackedDegreesWidget
            className="shadow-sm border-gray-200"
            userStats={userStats}
          />
        </div>
      </aside>
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const [psychometric, setPsychometric] = useState<PsychometricScores>({
    general: 0, quantitative: 0, verbal: 0, english: 0
  });

  const [bagrutGrades, setBagrutGrades] = useState<SubjectGrade[]>([]);
  const [preferences, setPreferences] = useState<{ fields: string[]; institutions: string[]; isUndecided: boolean; }>({
    fields: [],
    institutions: [],
    isUndecided: false
  });
  const [results, setResults] = useState<any[]>([]);
  const [formKey, setFormKey] = useState(0); // Kept for forced re-renders if needed
  const [dataLoaded, setDataLoaded] = useState(false);
  const [userData, setUserData] = useState<any>(null); // Store full user data for context

  // Load initial data
  useEffect(() => {
    async function init() {
      // Initialize GTM
      initializeGTM();

      const data = await loadUserData();
      if (data) {
        if (data.bagrut) setBagrutGrades(data.bagrut);
        if (data.psychometric) setPsychometric(data.psychometric);
        if (data.preferences) setPreferences(data.preferences);
        // Sync local state to avoid re-showing modal
        localStorage.setItem('lead_captured', 'true');
        setUserData(data); // Save for provider
      }
      setDataLoaded(true);
    }
    init();
  }, []);

  const handlePsychometricUpdate = useCallback((psychoData: PsychometricScores) => {
    setPsychometric(psychoData);
    saveUserData({ bagrut: bagrutGrades, psychometric: psychoData, preferences });
  }, [bagrutGrades, preferences]);

  const handleBagrutUpdate = useCallback((grades: SubjectGrade[]) => {
    setBagrutGrades(grades);
    saveUserData({ bagrut: grades, psychometric: psychometric, preferences });
  }, [psychometric, preferences]);

  const handlePreferencesUpdate = useCallback((newPrefs: { fields: string[]; institutions: string[]; isUndecided: boolean; }) => {
    setPreferences(newPrefs);
    saveUserData({ bagrut: bagrutGrades, psychometric, preferences: newPrefs });
  }, [bagrutGrades, psychometric]);

  // Unified update handler for context
  const handleUserDataUpdate = useCallback((data: Partial<UserData>) => {
    if (data.bagrut) handleBagrutUpdate(data.bagrut);
    if (data.psychometric) handlePsychometricUpdate(data.psychometric);
    if (data.preferences) handlePreferencesUpdate(data.preferences);
  }, [handleBagrutUpdate, handlePsychometricUpdate, handlePreferencesUpdate]);

  // Auto-calculate whenever data changes
  useEffect(() => {
    if (bagrutGrades.length > 0 || psychometric.general > 0) {
      const stats = calculateAdmissionStats(bagrutGrades, psychometric);
      setResults(stats.degrees);
      trackEvent('sekem_calculated', {
        bagrut_count: bagrutGrades.filter(g => g.grade > 0).length,
        has_psychometric: psychometric.general > 0,
        eligible_count: stats.degrees.filter((d: any) => d.status === 'excellent' || d.status === 'good').length,
      });
    }

    // Update master userData object for context consumers
    setUserData((prev: any) => ({
      ...prev,
      bagrut: bagrutGrades,
      psychometric,
      preferences
    }));
  }, [bagrutGrades, psychometric, preferences]);

  const loadScenario = (scenario: any) => {
    setPsychometric(scenario.psychometric);
    setBagrutGrades(scenario.bagrut);
    setFormKey(prev => prev + 1);
    // Calculation handled by effect
  };

  if (!dataLoaded) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  const userStats = {
    bagrutAverage: results[0]?.average || 0,
    bagrutGrades: bagrutGrades,
    psychometric: psychometric,
    estimatedSekhem: results[0]?.detailedResults?.sechem_scores[0]?.score || 0
  };

  return (
    <TrackedDegreesProvider
      initialIds={userData?.trackedPrograms || []}
      userData={userData}
      onUpdateUserData={handleUserDataUpdate}
    >
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">טוען...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calculator" element={
          <CalculatorPage
            bagrutGrades={bagrutGrades}
            handleBagrutUpdate={handleBagrutUpdate}
            psychometric={psychometric}
            handlePsychometricUpdate={handlePsychometricUpdate}
            results={results}
            preferences={preferences}
            onPreferencesUpdate={handlePreferencesUpdate}
          />
        } />
        <Route path="/programs" element={
          <SidebarLayout userStats={userStats}>
            <div className="min-h-screen flex flex-col font-sans" dir="rtl">
              <Header />
              <ProgramsExplorer userStats={userStats} trackedDegrees={results} />
              <Footer />
            </div>
          </SidebarLayout>
        } />
        <Route path="/program/:id" element={
          <SidebarLayout userStats={userStats}>
            <div className="min-h-screen flex flex-col font-sans" dir="rtl">
              <Header />
              <ProgramPage userStats={userStats} />
              <Footer />
            </div>
          </SidebarLayout>
        } />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<ArticlePage />} />
        <Route path="/write-for-us" element={<WriteForUsPage />} />
        <Route path="/dashboard" element={
          <SidebarLayout userStats={userStats}>
            <div className="min-h-screen flex flex-col font-sans" dir="rtl">
              <Header />
              <UnifiedDashboard />
            </div>
          </SidebarLayout>
        } />
        <Route path="/terms" element={<TermsOfUse onBack={() => window.location.href = '/'} />} />
        <Route path="/debug/db" element={<ProgramsDatabaseViewer />} />
        <Route path="/backstage" element={!isProduction ? <Backstage /> : <Navigate to="/" />} />
        <Route path="/tracking" element={<TrackedDegreesPage />} />
        <Route path="/community" element={<Navigate to="/" replace />} />
        <Route path="/collaborations" element={<CollaborationsPage />} />
        <Route path="/open-days" element={<ImportantDatesPage />} />
        <Route path="/campaign/mobile-first" element={<CampaignMobileFirst />} />
      </Routes>
      </Suspense>
      <CookieConsent />
      <ReturnToBot />
      <AccessibilityWidget />
      <div className="md:hidden h-16" /> {/* Spacer for bottom nav */}
      <MobileBottomNav />
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <Agentation />
        </Suspense>
      )}
    </TrackedDegreesProvider>
  );
}

export default App;
