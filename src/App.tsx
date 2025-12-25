import { useState } from 'react';
import './App.css';
import { PsychometricForm } from './components/PsychometricForm';
import { BagrutForm } from './components/BagrutForm';
import { UniversityResultsTable } from './components/UniversityResultsTable';
import { AdminDashboard } from './components/AdminDashboard';
import { DebugTools } from './components/DebugTools';
import { calculateAdmissionStats } from './utils/calculation-bridge';
import type { SubjectGrade, PsychometricScores } from './utils/calculator';

function App() {
  const [psychometric, setPsychometric] = useState<PsychometricScores>({
    general: 0, quantitative: 0, verbal: 0, english: 0
  });

  const [bagrutGrades, setBagrutGrades] = useState<SubjectGrade[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [formKey, setFormKey] = useState(0);

  const handleCalculate = (psychoData: PsychometricScores) => {
    setPsychometric(psychoData);
    performCalculation(bagrutGrades, psychoData);
  };

  const handleBagrutUpdate = (grades: SubjectGrade[]) => {
    setBagrutGrades(grades);
  };

  const performCalculation = (grades: SubjectGrade[], psycho: PsychometricScores) => {
    // USE THE BRIDGE
    const stats = calculateAdmissionStats(grades, psycho);
    // Bridge now returns mapped degrees ready for the table
    setResults(stats.degrees);
  };

  const loadScenario = (scenario: any) => {
    setPsychometric(scenario.psychometric);
    setBagrutGrades(scenario.bagrut);
    setFormKey(prev => prev + 1);
    performCalculation(scenario.bagrut, scenario.psychometric);
  };

  const [showAdmin, setShowAdmin] = useState(() => {
    const isAdminParam = window.location.search.includes('admin=true');
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isAdminParam && isLocal;
  });

  if (showAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center py-6">
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">Bagrut MVP</h1>
          <p className="text-lg text-blue-600 mt-2">סימולטור קבלה לאוניברסיטה (Frankenstein Edition)</p>
        </header>

        <DebugTools onLoadScenario={loadScenario} />

        <main className="space-y-8">
          {/* Section 1: Bagrut Input */}
          <section>
            <BagrutForm
              key={`bagrut-${formKey}`}
              onDataUpdate={handleBagrutUpdate}
              initialData={bagrutGrades}
            />
          </section>

          {/* Section 2: Psychometric Input */}
          <section>
            <PsychometricForm
              key={`psycho-${formKey}`}
              onDataUpdate={handleCalculate}
              initialData={psychometric}
            />
          </section>

          {/* Section 3: Results */}
          {results.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <UniversityResultsTable averages={results} />
            </section>
          )}
        </main>

        <footer className="text-center text-gray-400 text-sm py-8">
          נבנה ב-90 דקות. תפקודיות לפני יופי.
        </footer>
      </div>
    </div>
  );
}

export default App;
