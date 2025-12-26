import { useState } from 'react';
import './App.css';
import { Button } from './components/ui/shim';
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

  // Admin Logic
  const isAdminParam = window.location.search.includes('admin=true');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_auth') === 'true'; // Simple persistent login
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  const handleLogin = () => {
    if (passwordInput === 'Bagrut2025') { // Hardcoded password as agreed
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  if (isAdminParam) {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4" dir="rtl">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full space-y-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800">🔒 כניסת מנהלים</h2>
            <p className="text-gray-500 text-sm">המערכת מוגנת. נא להזין סיסמה.</p>

            <div className="space-y-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="סיסמה"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 text-left ltr"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />

              {loginError && <p className="text-red-500 text-xs font-medium">סיסמה שגויה. נסה שנית.</p>}

              <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium shadow-sm transition-all">
                כניסה למערכת
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return <AdminDashboard />;
  }

  // Determine if we show the "CRM" button (now available on Prod too if explicit)
  // const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'; // No longer needed

  return (
    <div className="min-h-screen bg-gray-50 pb-12" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center py-6 relative">
          <div className="absolute top-0 right-0 p-4">
            <Button
              onClick={() => window.location.href = '/?admin=true'}
              className="bg-gray-900 text-white hover:bg-black text-xs"
            >
              ניהול CRM 💼
            </Button>
          </div>
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">Bagrut MVP</h1>
          <p className="text-lg text-blue-600 mt-2">סימולטור קבלה לאוניברסיטה (Frankenstein Edition)</p>
        </header>

        {isAuthenticated && <DebugTools onLoadScenario={loadScenario} />}

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
