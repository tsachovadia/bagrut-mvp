import { useState } from 'react';
import { WizardProgress } from './WizardProgress';
import { BagrutForm } from '../BagrutForm';
import { PsychometricForm } from '../PsychometricForm';
import { SmartPreferencesStep } from './SmartPreferencesStep';
import { UniversityResultsTable } from '../UniversityResultsTable';

import { ProgramShowcase } from '../ProgramShowcase';
import { Button } from '../ui/shim';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { AverageDisplay } from '../AverageDisplay';
import { SekemDisplay } from '../SekemDisplay';
import { calculateOptimalAverage, type SubjectGrade, type PsychometricScores } from '../../utils/calculator';
import { useMemo } from 'react';

interface WizardContainerProps {
    bagrutData: SubjectGrade[];
    onBagrutUpdate: (grades: SubjectGrade[]) => void;
    psychometricData: PsychometricScores;
    onPsychometricUpdate: (scores: PsychometricScores) => void;
    preferences: { fields: string[]; institutions: string[]; isUndecided: boolean; };
    onPreferencesUpdate: (prefs: { fields: string[]; institutions: string[]; isUndecided: boolean; }) => void;
    results: any[];
}

const STEPS = [
    'ציוני בגרות',
    'פסיכומטרי',
    'העדפות',
    'תוצאות',
];

export function WizardContainer({
    bagrutData,
    onBagrutUpdate,
    psychometricData,
    onPsychometricUpdate,
    results,
    preferences,
    onPreferencesUpdate
}: WizardContainerProps) {
    const [currentStep, setCurrentStep] = useState(0);

    const [formKey, setFormKey] = useState(0);
    const [sector, setSector] = useState<any>('mamlachti'); // Lifted state

    // Calculate dynamic stats for the persistent banner
    const currentBagrutStats = useMemo(() => {
        return calculateOptimalAverage(bagrutData, sector);
    }, [bagrutData, sector]);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Simple validation checks (can be expanded)
    const isNextDisabled = () => {
        if (currentStep === 0) {
            // Example: Only disable if no grades at all? Or just let them pass.
            return false;
        }
        return false;
    };

    // Updated filter logic:
    const getDisplayResults = (data = results) => {
        // If undecided, we might want to show everything or a special "Discovery" mix. 
        // For now, if undecided is TRUE, we return everything (Discovery Mode).
        if (preferences.isUndecided) {
            return data;
        }

        // If no preferences set at all, also return everything
        if (preferences.fields.length === 0 && preferences.institutions.length === 0) {
            return data;
        }

        // Filter Logic
        return data.filter((item: any) => {
            // Normalize Item Data - matching ALL_PROGRAMS structure { program: { name, institution... }, ... }
            const degreeName = (item.program?.name || item.name || '').toString();
            const institutionObj = item.program?.institution || item.institution;
            const institutionName = (institutionObj?.name || '').toString();
            const institutionId = institutionObj?.id || '';

            // 1. Institution Match
            // If institutions are selected, the item MUST match one of them.
            // If NO institutions selected, we don't filter by institution (User is open to any).
            let instMatch = true;
            if (preferences.institutions.length > 0) {
                instMatch = preferences.institutions.some(prefId => {
                    // Try strict ID match first
                    if (institutionId && institutionId === prefId) return true;
                    // Fallback to name match
                    return institutionName.includes(prefId.replace('inst_', ''));
                });
            }

            // 2. Field Match (Dilemma)
            // If fields are selected, the item MUST match one of them.
            // If NO fields selected, we don't filter by field (User is open to any).
            let fieldMatch = true;
            if (preferences.fields.length > 0) {
                // Check if program name includes any of the selected fields (keywords)
                fieldMatch = preferences.fields.some(field =>
                    degreeName.includes(field) || degreeName.includes(field.replace('הנדסת', '')) // Simple normalization
                );
            }

            return instMatch && fieldMatch;
        });
    };



    // Auto-fill logic for demo
    const handleAutoFill = () => {
        setFormKey(prev => prev + 1);
        // 1. Fill Bagrut
        const mockBagrut: SubjectGrade[] = [
            { id: 'm-math', subject: 'מתמטיקה', units: 4, grade: 85 },
            { id: 'm-eng', subject: 'אנגלית', units: 5, grade: 90 },
            { id: 'm-history', subject: 'היסטוריה', units: 2, grade: 88 },
            { id: 'm-literature', subject: 'ספרות', units: 2, grade: 85 },
            { id: 'm-bible', subject: 'תנ״ך', units: 2, grade: 82 },
            { id: 'm-civics', subject: 'אזרחות', units: 2, grade: 90 },
            { id: 'm-lang', subject: 'לשון עברית', units: 2, grade: 85 },
            // Add a strong elective
            { id: 'e-phys', subject: 'פיזיקה', units: 5, grade: 88 },
        ];
        onBagrutUpdate(mockBagrut);

        // 2. Fill Psychometric
        const mockPsycho: PsychometricScores = {
            general: 680,
            quantitative: 135,
            verbal: 125,
            english: 130
        };
        onPsychometricUpdate(mockPsycho);
    };

    return (
        <div className="max-w-6xl mx-auto w-full px-2 md:px-4 flex flex-col md:flex-row items-start gap-6 relative">

            {/* LEFT SIDEBAR - Desktop Only (Sticky) */}
            <div className="hidden md:block w-80 sticky top-24 space-y-4 shrink-0 z-10">
                {/* Average Score Card */}
                <div className="transition-all duration-300 hover:-translate-y-1">
                    <AverageDisplay
                        grades={bagrutData}
                        sector={sector}
                        className="shadow-apple border-slate-100"
                    />
                </div>

                {/* Sekem Score Card */}
                {currentStep >= 1 && (
                    <div className="animate-in slide-in-from-left-4 fade-in duration-700 delay-100">
                        <SekemDisplay
                            bagrutAverage={currentBagrutStats.average}
                            psychometricScore={psychometricData.general || 0}
                            className="shadow-apple border-slate-100"
                        />
                    </div>
                )}
            </div>

            {/* RIGHT MAIN CONTENT */}
            <div className="flex-1 w-full min-w-0">
                <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-apple border border-white/60 overflow-hidden transition-all duration-300">
                    {/* Progress Header */}
                    <div className="bg-white/40 border-b border-white/30 p-2 backdrop-blur-sm">
                        <WizardProgress currentStep={currentStep} steps={STEPS} onStepClick={(step) => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            setCurrentStep(step);
                        }} />
                    </div>

                    {/* MOBILE ONLY - Persistent Stats Banner */}
                    <div className="md:hidden bg-slate-50/50 border-b border-slate-100 p-4 transition-all duration-500 ease-in-out">
                        <div className="grid gap-4">
                            <AverageDisplay grades={bagrutData} sector={sector} className="mb-0 h-full" />
                            {currentStep >= 1 && (
                                <SekemDisplay
                                    bagrutAverage={currentBagrutStats.average}
                                    psychometricScore={psychometricData.general || 0}
                                    className="mb-0 h-full"
                                />
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-2 md:p-6 min-h-[500px]">
                        {currentStep === 0 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <BagrutForm
                                    key={`bagrut-${formKey}`}
                                    onDataUpdate={onBagrutUpdate}
                                    initialData={bagrutData}
                                    onAutoFill={handleAutoFill}
                                    sector={sector}
                                    onSectorChange={setSector}
                                    variant="compact"
                                />
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <PsychometricForm
                                    key={`psycho-${formKey}`}
                                    onDataUpdate={onPsychometricUpdate}
                                    initialData={psychometricData}
                                />
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <SmartPreferencesStep
                                    preferences={preferences}
                                    onUpdate={onPreferencesUpdate}
                                />
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">


                                <div className="text-center mb-6 mt-8">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                        תוצאות הקבלה שלך
                                    </h2>
                                    <p className="text-slate-500 mt-1">חישוב משוקלל של ממוצעי הבגרות והפסיכומטרי שלך</p>
                                </div>
                                <UniversityResultsTable
                                    averages={getDisplayResults(results)}
                                    originalAverages={null}
                                />

                                <div className="mt-12 border-t pt-8">
                                    <ProgramShowcase />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer / Navigation */}
                    <div className="bg-gray-50/50 p-4 md:p-6 border-t border-gray-100 flex items-center justify-between">
                        {currentStep > 0 ? (
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                            >
                                <ArrowRight className="w-4 h-4 ml-1" />
                                חזור
                            </Button>
                        ) : (
                            <div></div>
                        )}

                        {currentStep < STEPS.length - 1 && (
                            <Button
                                onClick={handleNext}
                                disabled={isNextDisabled()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                            >
                                המשך
                                <ArrowLeft className="w-4 h-4 mr-1" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
