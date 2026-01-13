import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TrackedDegreesProvider } from './context/TrackedDegreesContext';
import './App.css';
import { HomePage } from './pages/HomePage';
import { ProgramPage } from './pages/ProgramPage';
import { calculateAdmissionStats } from './utils/calculation-bridge';
import { initializeGTM } from './utils/gtm';
import type { SubjectGrade, PsychometricScores } from './utils/calculator';
import { loadUserData, saveUserData } from './lib/userData';
import { TermsOfUse } from './components/TermsOfUse';
import { CookieConsent } from './components/CookieConsent';
import { AccessibilityWidget } from './components/AccessibilityWidget';
import { TrackedDegreesFloatingMenu } from './components/TrackedDegreesFloatingMenu';
import { useNavigate } from 'react-router-dom';

import { ProgramsExplorer } from './components/ProgramsExplorer/ProgramsExplorer';
import { ProgramsDatabaseViewer } from './components/Debug/ProgramsDatabaseViewer';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { UnifiedDashboard } from './components/Dashboard/UnifiedDashboard';
import { CRMPage } from './pages/Admin/CRMPage';
import { SignalsPage } from './pages/Admin/SignalsPage';
import { GroupsPage } from './pages/Admin/GroupsPage';
import { PartnersPage } from './pages/Admin/PartnersPage';
import { isProduction } from './utils/env';
import { TrackedDegreesPage } from './pages/TrackedDegreesPage';

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
  const [wizardStarted, setWizardStarted] = useState(false);
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
        setWizardStarted(true); // If data exists, likely returning user
        // Sync local state to avoid re-showing modal
        localStorage.setItem('lead_captured', 'true');
        setUserData(data); // Save for provider
      }
      setDataLoaded(true);
    }
    init();
  }, []);

  const handlePsychometricUpdate = (psychoData: PsychometricScores) => {
    setPsychometric(psychoData);
    saveUserData({ bagrut: bagrutGrades, psychometric: psychoData, preferences });
  };

  const handleBagrutUpdate = (grades: SubjectGrade[]) => {
    setBagrutGrades(grades);
    saveUserData({ bagrut: grades, psychometric: psychometric, preferences });
  };

  const handlePreferencesUpdate = (newPrefs: { fields: string[]; institutions: string[]; isUndecided: boolean; }) => {
    setPreferences(newPrefs);
    saveUserData({ bagrut: bagrutGrades, psychometric, preferences: newPrefs });
  };

  // Auto-calculate whenever data changes
  useEffect(() => {
    if (bagrutGrades.length > 0 || psychometric.general > 0) {
      // Debounce could be added here if needed, but calculation is fast
      const stats = calculateAdmissionStats(bagrutGrades, psychometric);
      setResults(stats.degrees);
    }
  }, [bagrutGrades, psychometric]);

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
    <TrackedDegreesProvider initialIds={userData?.trackedPrograms || []} userData={userData}>
      <Routes>
        <Route path="/" element={
          <HomePage
            wizardStarted={wizardStarted}
            setWizardStarted={setWizardStarted}
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
          <div className="min-h-screen flex flex-col font-sans" dir="rtl">
            <Header />
            <ProgramsExplorer userStats={userStats} trackedDegrees={results} />
            <Footer />
          </div>
        } />
        <Route path="/program/:id" element={<ProgramPage />} />
        <Route path="/dashboard" element={
          <div className="min-h-screen flex flex-col font-sans" dir="rtl">
            <Header />
            <UnifiedDashboard />
          </div>
        } />
        <Route path="/terms" element={<TermsOfUse onBack={() => window.location.href = '/'} />} />
        <Route path="/debug/db" element={<ProgramsDatabaseViewer />} />
        <Route path="/admin/shadow" element={!isProduction ? <CRMPage /> : <Navigate to="/" />} />
        <Route path="/admin/shadow/signals" element={!isProduction ? <SignalsPage /> : <Navigate to="/" />} />
        <Route path="/admin/shadow/groups" element={!isProduction ? <GroupsPage /> : <Navigate to="/" />} />
        <Route path="/admin/shadow/partners" element={!isProduction ? <PartnersPage /> : <Navigate to="/" />} />
      </Routes>
      <CookieConsent />
      <AccessibilityWidget />
      <TrackedDegreesFloatingMenu />
    </TrackedDegreesProvider>
  );
}

export default App;
