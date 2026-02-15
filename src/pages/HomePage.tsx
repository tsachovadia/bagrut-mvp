import { Helmet } from 'react-helmet-async';
import { Header } from '../components/Header';
import { ConversationalHero } from '../components/marketing/ConversationalHero';
import { WizardContainer } from '../components/Wizard/WizardContainer';
import { CookieConsent } from '../components/CookieConsent';
import { AccessibilityWidget } from '../components/AccessibilityWidget';
import type { SubjectGrade, PsychometricScores } from '../utils/calculator';
import { SmartWelcomeModal } from '../components/marketing/SmartWelcomeModal';
import { useFirstVisit } from '../hooks/useFirstVisit';
import { useState } from 'react';

import { Footer } from '../components/Footer';
import { ValuePropositionSection } from '../components/marketing/ValuePropositionSection';

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
    const [wizardMode, setWizardMode] = useState<'manual' | 'upload'>('manual');
    const [pendingAction, setPendingAction] = useState<'manual' | 'upload' | null>(null);

    // Auto-show lead capture modal for first-time visitors who haven't submitted/skipped
    const hasSeenModal = typeof window !== 'undefined' && localStorage.getItem('lead_captured');
    const [showModal, setShowModal] = useState(!wizardStarted && !hasSeenModal);

    const handleModalClose = () => {
        setShowModal(false);

        // Execute the pending action if one exists
        if (pendingAction) {
            setWizardMode(pendingAction);
            setWizardStarted(true);
            setPendingAction(null);
        }
    };

    const handleHeroAction = (action: 'manual' | 'upload') => {
        if (action === 'manual' || action === 'upload') {
            setWizardMode(action);
            setWizardStarted(true);
        } else {
            setPendingAction(action);
            setShowModal(true);
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans" dir="rtl">
            <Helmet>
                <title>מתלבטים בלימודים — מחשבון סיכויי קבלה לתואר ראשון</title>
                <meta name="description" content="מחשבון בגרויות חינמי — חשבו ממוצע בגרות, בדקו סיכויי קבלה ל-500+ תוכניות לימוד, וגלו לאן אתם יכולים להתקבל. קהילה של 50,000+ תלמידים." />
                <link rel="canonical" href="https://mitlabtim.co.il" />
            </Helmet>
            <Header />

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-6 py-2 space-y-2">
                <SmartWelcomeModal isOpen={showModal} onClose={handleModalClose} />

                {!wizardStarted && (
                    <section id="hero-section" className="animate-in fade-in zoom-in-95 duration-500">
                        <ConversationalHero
                            onStartUpload={() => handleHeroAction('upload')}
                            onManual={() => handleHeroAction('manual')}
                        />
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
                            initialTab={wizardMode}
                        />
                    </div>
                )}
            </main>

            {!wizardStarted && <ValuePropositionSection />}

            <Footer />
            <CookieConsent />
            <AccessibilityWidget />
        </div>
    );
};
