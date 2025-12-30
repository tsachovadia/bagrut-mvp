import { useNavigate, Link } from 'react-router-dom';
import { ProgramsExplorer } from '../components/ProgramsExplorer/ProgramsExplorer';
import { Header } from '../components/Header';
import { HeroOverlay } from '../components/HeroOverlay';
import { WizardContainer } from '../components/Wizard/WizardContainer';
import { AccessibilityWidget } from '../components/AccessibilityWidget';
import { CookieConsent } from '../components/CookieConsent';
import type { SubjectGrade, PsychometricScores } from '../utils/calculator';

import { Footer } from '../components/Footer';

interface HomePageProps {
    wizardStarted: boolean;
    setWizardStarted: (started: boolean) => void;
    bagrutGrades: SubjectGrade[];
    handleBagrutUpdate: (grades: SubjectGrade[]) => void;
    psychometric: PsychometricScores;
    handlePsychometricUpdate: (scores: PsychometricScores) => void;
    results: any[];
    filters: { institution: string; degree: string };
    handleFiltersUpdate: (filters: { institution: string; degree: string }) => void;
}

export const HomePage = ({
    wizardStarted,
    setWizardStarted,
    bagrutGrades,
    handleBagrutUpdate,
    psychometric,
    handlePsychometricUpdate,
    results,
    filters,
    handleFiltersUpdate
}: HomePageProps) => {

    return (
        <div className="min-h-screen flex flex-col font-sans" dir="rtl">
            <Header />

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-6 py-2 space-y-2">
                {/* Powered By Section */}
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

                {!wizardStarted && (
                    <section className="animate-in fade-in zoom-in-95 duration-500">
                        <HeroOverlay onStart={() => setWizardStarted(true)} />
                    </section>
                )}

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
            </main>

            <Footer />
            <CookieConsent />
            <AccessibilityWidget />
        </div>
    );
};
