import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { WizardContainer } from '../components/Wizard/WizardContainer';
import type { SubjectGrade, PsychometricScores } from '../utils/calculator';

interface CalculatorPageProps {
    bagrutGrades: SubjectGrade[];
    handleBagrutUpdate: (grades: SubjectGrade[]) => void;
    psychometric: PsychometricScores;
    handlePsychometricUpdate: (scores: PsychometricScores) => void;
    results: any[];
    preferences: { fields: string[]; institutions: string[]; isUndecided: boolean };
    onPreferencesUpdate: (prefs: { fields: string[]; institutions: string[]; isUndecided: boolean }) => void;
}

export function CalculatorPage({
    bagrutGrades,
    handleBagrutUpdate,
    psychometric,
    handlePsychometricUpdate,
    results,
    preferences,
    onPreferencesUpdate,
}: CalculatorPageProps) {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') as 'manual' | 'upload' | null;

    return (
        <div className="min-h-screen flex flex-col font-sans" dir="rtl">
            <Helmet>
                <title>מחשבון בגרויות — מתלבטים בלימודים</title>
                <meta name="description" content="חשבו ממוצע בגרות מדויק לפי הנוסחאות של כל אוניברסיטה. סרקו תעודה או הקלידו ידנית." />
                <link rel="canonical" href="https://mitlabtim.co.il/calculator" />
            </Helmet>
            <Header />

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-6 py-4">
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <WizardContainer
                        bagrutData={bagrutGrades}
                        onBagrutUpdate={handleBagrutUpdate}
                        psychometricData={psychometric}
                        onPsychometricUpdate={handlePsychometricUpdate}
                        results={results}
                        preferences={preferences}
                        onPreferencesUpdate={onPreferencesUpdate}
                        initialTab={mode || 'manual'}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}
