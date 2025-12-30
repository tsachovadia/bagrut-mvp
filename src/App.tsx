import { useState, useEffect } from 'react';
import './App.css';
import { Header } from './components/Header';
import { HeroOverlay } from './components/HeroOverlay';
import { WizardContainer } from './components/Wizard/WizardContainer';
import { ProgramsExplorer } from './components/ProgramsExplorer/ProgramsExplorer';
// import { Button } from './components/ui/shim'; // Unused
// import { PsychometricForm } from './components/PsychometricForm'; // Moved to Wizard
// import { BagrutForm } from './components/BagrutForm'; // Moved to Wizard
// import { UniversityResultsTable } from './components/UniversityResultsTable'; // Moved to Wizard
import { DebugTools } from './components/DebugTools';
import { calculateAdmissionStats } from './utils/calculation-bridge';
import type { SubjectGrade, PsychometricScores } from './utils/calculator';
import { loadUserData, saveUserData } from './lib/userData';

function App() {
  const [psychometric, setPsychometric] = useState<PsychometricScores>({
    general: 0, quantitative: 0, verbal: 0, english: 0
  });

  const [bagrutGrades, setBagrutGrades] = useState<SubjectGrade[]>([]);
  const [filters, setFilters] = useState({ institution: '', degree: '' });
  const [results, setResults] = useState<any[]>([]);
  const [formKey, setFormKey] = useState(0); // Kept for forced re-renders if needed
  const [wizardStarted, setWizardStarted] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'programs'>('home');

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

  return (
    <div className="min-h-screen flex flex-col font-sans" dir="rtl">
      <Header onViewChange={setCurrentView} />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-6 py-2 space-y-2">

        {currentView === 'programs' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProgramsExplorer
              userStats={{
                bagrutAverage: results[0]?.average || 0,
                bagrutGrades: bagrutGrades,
                psychometric: psychometric,
                estimatedSekhem: results[0]?.detailedResults?.sechem_scores[0]?.score || 0
              }}
            />
          </div>
        ) : (
          <>
            {/* Powered By Section - Top of Page */}
            <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
              <p className="text-apple-subtext font-medium text-sm tracking-wide">מבית</p>
              <a
                href="https://www.facebook.com/groups/mlimudim"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-4 bg-white/60 hover:bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/50 shadow-sm hover:shadow-apple transition-all duration-300"
              >
                <div className="bg-[#1877F2]/10 p-2 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 group-hover:text-[#1877F2] transition-colors">מתלבטים בלימודים</div>
                  <div className="text-xs text-gray-500 font-medium">קהילת הלימודים הגדולה בישראל</div>
                </div>
              </a>
            </div>

            {/* Hero Overlay - Only shown when wizard hasn't started */}
            {!wizardStarted && (
              <section className="animate-in fade-in zoom-in-95 duration-500">
                <HeroOverlay onStart={() => setWizardStarted(true)} />
              </section>
            )}

            {/* Wizard Content */}
            {wizardStarted && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <WizardContainer
                  bagrutData={bagrutGrades}
                  onBagrutUpdate={handleBagrutUpdate}
                  psychometricData={psychometric}
                  onPsychometricUpdate={handlePsychometricUpdate}
                  results={results}
                  filters={filters}
                  onFiltersUpdate={handleFiltersUpdate}
                />
              </div>
            )}
          </>
        )}

        {/* Debug Tools (keep hidden or optional) */}
        {/* <DebugTools onLoadScenario={loadScenario} /> */}
      </main>

      <footer className="bg-white border-t border-gray-100 mt-auto py-2">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2025 Bagrut++. נבנה לתלמידים, על ידי סטודנטים.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
