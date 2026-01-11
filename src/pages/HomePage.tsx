import { useNavigate, Link } from 'react-router-dom';
import { ProgramsExplorer } from '../components/ProgramsExplorer/ProgramsExplorer';
import { Header } from '../components/Header';
import { HeroOverlay } from '../components/HeroOverlay';
import { WizardContainer } from '../components/Wizard/WizardContainer';
import { AccessibilityWidget } from '../components/AccessibilityWidget';
import { CookieConsent } from '../components/CookieConsent';
import type { SubjectGrade, PsychometricScores } from '../utils/calculator';
import { LeadCaptureModal } from '../components/LeadCaptureModal';
import { GuidedTour } from '../components/GuidedTour';
import { useFirstVisit } from '../hooks/useFirstVisit';
import { useState, useEffect } from 'react';

import { Footer } from '../components/Footer';

interface HomePageProps {
    wizardStarted: boolean;
    setWizardStarted: (started: boolean) => void;
    bagrutGrades: SubjectGrade[];
    handleBagrutUpdate: (grades: SubjectGrade[]) => void;
    psychometric: PsychometricScores;
    handlePsychometricUpdate: (scores: PsychometricScores) => void;
    results: any[];
    // filter prop removed as it's replaced by preferences
    preferences: { fields: string[]; institutions: string[]; isUndecided: boolean; };
    onPreferencesUpdate: (prefs: { fields: string[]; institutions: string[]; isUndecided: boolean; }) => void;
}

export const HomePage = ({
    wizardStarted,
    setWizardStarted,
    bagrutGrades,
    handleBagrutUpdate,
    psychometric,
    handlePsychometricUpdate,
    results,
    preferences,
    onPreferencesUpdate,
}: HomePageProps) => {

    const isFirstVisit = useFirstVisit();
    const [showModal, setShowModal] = useState(false);
    const [startTour, setStartTour] = useState(false);

    useEffect(() => {
        if (isFirstVisit) {
            // Small delay to ensure smooth entry
            const timer = setTimeout(() => setShowModal(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [isFirstVisit]);

    const handleModalClose = () => {
        setShowModal(false);
        // Start tour after modal closes
        setStartTour(true);
    };

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

                <LeadCaptureModal isOpen={showModal} onClose={handleModalClose} />
                <GuidedTour startTrigger={startTour} onEnd={() => setStartTour(false)} />

                {/* WhatsApp Group CTA - Visible always or conditionally */}
                <div className="flex justify-center my-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                    <a
                        href="https://chat.whatsapp.com/GzB9XyqXyqXyqXyqXyqXy" // Placeholder link
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-2.5 rounded-full font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        <span>הצטרפו לקבוצת הוואטסאפ שלנו</span>
                    </a>
                </div>

                {!wizardStarted && (
                    <section id="hero-section" className="animate-in fade-in zoom-in-95 duration-500">
                        <HeroOverlay onStart={() => setWizardStarted(true)} />
                    </section>
                )}

                {wizardStarted && (
                    <div id="grade-input-section" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <WizardContainer
                            bagrutData={bagrutGrades}
                            onBagrutUpdate={handleBagrutUpdate}
                            psychometricData={psychometric}
                            onPsychometricUpdate={handlePsychometricUpdate}
                            results={results}
                            preferences={preferences}
                            onPreferencesUpdate={onPreferencesUpdate}
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
