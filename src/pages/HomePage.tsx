import { useNavigate, Link } from 'react-router-dom';
import { ProgramsExplorer } from '../components/ProgramsExplorer/ProgramsExplorer';
import { Header } from '../components/Header';
import { ConversationalHero } from '../components/marketing/ConversationalHero';
import { WizardContainer } from '../components/Wizard/WizardContainer';
import { AccessibilityWidget } from '../components/AccessibilityWidget';
import { CookieConsent } from '../components/CookieConsent';
import type { SubjectGrade, PsychometricScores } from '../utils/calculator';
import { SmartWelcomeModal } from '../components/marketing/SmartWelcomeModal';
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
    const [wizardMode, setWizardMode] = useState<'manual' | 'upload'>('manual');
    const [pendingAction, setPendingAction] = useState<'manual' | 'upload' | null>(null);

    // Auto-modal removed to prevent "wall" effect. 
    // Modal now triggers only on valid user interaction (see handleHeroAction).

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
        if (action === 'manual') {
            setWizardMode('manual');
            setWizardStarted(true);
        } else {
            setPendingAction(action);
            setShowModal(true);
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans" dir="rtl">
            <Header />

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-6 py-2 space-y-2">
                {/* Powered By Section */}
                <SmartWelcomeModal isOpen={showModal} onClose={handleModalClose} />
                {/* <GuidedTour startTrigger={startTour} onEnd={() => setStartTour(false)} /> */}

                {/* WhatsApp Group CTA - Visible always or conditionally */}


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

            <Footer />
            <CookieConsent />
            <AccessibilityWidget />
        </div>
    );
};
