import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { HomePage } from './pages/HomePage';
import { ProgramPage } from './pages/ProgramPage';
import { calculateAdmissionStats } from './utils/calculation-bridge';
import type { SubjectGrade, PsychometricScores } from './utils/calculator';
import { loadUserData, saveUserData } from './lib/userData';
import { TermsOfUse } from './components/TermsOfUse';
import { CookieConsent } from './components/CookieConsent';
import { AccessibilityWidget } from './components/AccessibilityWidget';
import { useNavigate } from 'react-router-dom';

import { ProgramsExplorer } from './components/ProgramsExplorer/ProgramsExplorer';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { UnifiedDashboard } from './components/Dashboard/UnifiedDashboard';

function App() {
  const navigate = useNavigate();
  const [psychometric, setPsychometric] = useState<PsychometricScores>({
    general: 0, quantitative: 0, verbal: 0, english: 0
  });

  const [bagrutGrades, setBagrutGrades] = useState<SubjectGrade[]>([]);
  const [filters, setFilters] = useState({ institution: '', degree: '' });
  const [results, setResults] = useState<any[]>([]);
  const [formKey, setFormKey] = useState(0); // Kept for forced re-renders if needed
  const [wizardStarted, setWizardStarted] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load initial data
  useEffect(() => {
    async function init() {
      const data = await loadUserData();
      if (data) {
        if (data.bagrut) setBagrutGrades(data.bagrut);
        if (data.psychometric) setPsychometric(data.psychometric);
        if (data.preferences) setFilters(data.preferences);
        setWizardStarted(true); // If data exists, likely returning user
      }
      setDataLoaded(true);
    }
    init();
  }, []);

  const handlePsychometricUpdate = (psychoData: PsychometricScores) => {
    setPsychometric(psychoData);
    saveUserData({ bagrut: bagrutGrades, psychometric: psychoData, preferences: filters });
  };

  const handleBagrutUpdate = (grades: SubjectGrade[]) => {
    setBagrutGrades(grades);
    saveUserData({ bagrut: grades, psychometric: psychometric, preferences: filters });
  };

  const handleFiltersUpdate = (newFilters: { institution: string; degree: string }) => {
    setFilters(newFilters);
    saveUserData({ bagrut: bagrutGrades, psychometric, preferences: newFilters });
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
          filters={filters}
          handleFiltersUpdate={handleFiltersUpdate}
        />
      } />
      <Route path="/programs" element={
        <div className="min-h-screen flex flex-col font-sans" dir="rtl">
          <Header />
          <ProgramsExplorer userStats={userStats} />
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
    </Routes>
  );
}

export default App;
