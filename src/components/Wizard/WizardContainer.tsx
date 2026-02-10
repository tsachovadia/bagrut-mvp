import { useState, useEffect, useMemo } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useNavigate } from 'react-router-dom';
import { WizardProgress } from './WizardProgress';
import { BagrutForm } from '../BagrutForm';
import { PsychometricForm } from '../PsychometricForm';
import { SmartPreferencesStep } from './SmartPreferencesStep';
import { Card } from '../ui/shim';
import { Button } from '../ui/shim';
import { ArrowLeft, Calculator, Loader2, GraduationCap, Compass } from 'lucide-react';
import { useTrackedDegrees } from '../../context/TrackedDegreesContext';
import { SECTOR_NAMES } from '../../utils/subjects';
import { CollapsibleCard } from '../ui/CollapsibleCard';
import { AverageDisplay } from '../AverageDisplay';
import { SekemDisplay } from '../SekemDisplay';
import { calculateOptimalAverage, calculateDryAverage, type SubjectGrade, type PsychometricScores } from '../../utils/calculator';

interface WizardContainerProps {
    bagrutData: SubjectGrade[];
    onBagrutUpdate: (grades: SubjectGrade[]) => void;
    psychometricData: PsychometricScores;
    onPsychometricUpdate: (scores: PsychometricScores) => void;
    preferences: { fields: string[]; institutions: string[]; isUndecided: boolean; };
    onPreferencesUpdate: (prefs: { fields: string[]; institutions: string[]; isUndecided: boolean; }) => void;
    results: any[];
    initialTab?: 'manual' | 'upload' | 'link';
}

const STEPS = [
    'ציוני בגרות',
    'פסיכומטרי',
    'העדפות',
    'חישוב נתונים',
];

export function WizardContainer({
    bagrutData,
    onBagrutUpdate,
    psychometricData,
    onPsychometricUpdate,
    results,
    preferences,
    onPreferencesUpdate,
    initialTab = 'manual'
}: WizardContainerProps) {
    const { trackEvent } = useAnalytics();
    const [currentStep, setCurrentStep] = useState(0);

    const [formKey, setFormKey] = useState(0);
    const [sector, setSector] = useState<any>('mamlachti'); // Lifted state
    const navigate = useNavigate();

    // Auto-redirect logic for the final step
    useEffect(() => {
        if (currentStep === 3) {
            trackEvent('results_viewed', {
                bagrut_avg: currentBagrutStats.average,
                psycho_score: psychometricData.general
            });
            const timer = setTimeout(() => {
                navigate('/dashboard');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [currentStep, navigate]);

    // Calculate dynamic stats for the persistent banner
    const currentBagrutStats = useMemo(() => {
        return calculateOptimalAverage(bagrutData, sector);
    }, [bagrutData, sector]);

    const bonusDiff = useMemo(() => {
        if (bagrutData.length === 0) return 0;
        const dry = calculateDryAverage(bagrutData);
        const diff = currentBagrutStats.average - dry;
        return diff > 0 ? Number(diff.toFixed(1)) : 0;
    }, [currentBagrutStats.average, bagrutData]);


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

    // -- Render Helpers --

    const handleStepCompletion = (step: number) => {
        // If current step matches, move to next
        if (currentStep === step && step < STEPS.length - 1) {
            setCurrentStep(step + 1);
            // Scroll to top so user sees the newly opened step
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        }
    };

    const renderStepContent = (stepIndex: number) => {
        switch (stepIndex) {
            case 0: // Grades
                return (
                    <div className="p-1.5 sm:p-3">
                        <BagrutForm
                            onDataUpdate={onBagrutUpdate}
                            initialData={bagrutData}
                            fillSampleData={handleAutoFill}
                            variant="default"
                            sector={sector}
                            onSectorChange={(s) => {
                                setSector(s);
                            }}
                        />
                        <div className="mt-3 flex justify-end">
                            <Button
                                onClick={() => handleStepCompletion(0)}
                                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                            >
                                סיימתי להזין, המשך לשלב הבא
                                <ArrowLeft className="w-4 h-4 mr-2" />
                            </Button>
                        </div>
                    </div>
                );
            case 1: // Psychometric
                return (
                    <div className="p-1.5 sm:p-3">
                        <PsychometricForm
                            initialData={psychometricData}
                            onDataUpdate={onPsychometricUpdate}
                        />
                        <div className="mt-6 flex justify-end gap-3 px-2">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(0)}
                                className="flex-1 md:flex-none"
                            >
                                חזור
                            </Button>
                            <Button
                                onClick={() => handleStepCompletion(1)}
                                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                            >
                                {psychometricData.general === 0 ? 'המשך ללא פסיכומטרי' : 'המשך'}
                                <ArrowLeft className="w-4 h-4 mr-2" />
                            </Button>
                        </div>
                    </div>
                );
            case 2: // Preferences
                return (
                    <div className="p-1.5 sm:p-3">
                        <SmartPreferencesStep
                            preferences={preferences}
                            onUpdate={onPreferencesUpdate}
                        />
                        <div className="mt-6 flex justify-end gap-3 px-2">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(1)}
                                className="flex-1 md:flex-none"
                            >
                                חזור
                            </Button>
                            <Button
                                onClick={() => handleStepCompletion(2)}
                                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                            >
                                <Calculator className="ml-2 h-4 w-4" />
                                שקלול וחיפוש תארים
                            </Button>
                        </div>
                    </div>
                );
            case 3: // Loader/Processing
                return (
                    <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95">
                        <div className="relative w-20 h-20 mb-6">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                            <div className="relative bg-white rounded-full p-4 shadow-xl border border-blue-100 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">מעבד נתונים...</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">
                            הרובוטים שלנו סורקים את תנאי הקבלה בכל האוניברסיטאות עבורך
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    // Calculate completion status for summary
    const isGradesComplete = bagrutData.some(g => g.grade > 0);
    const isPsychoComplete = psychometricData.general > 0 || (psychometricData.english > 0 && psychometricData.quantitative > 0);
    const isPreferencesComplete = preferences.fields.length > 0 || preferences.isUndecided;

    // Map step to title and icon
    const stepsConfig = [
        {
            id: 0,
            title: 'ציוני בגרות',
            icon: <GraduationCap className="w-5 h-5" />,
            summary: `${bagrutData.length} מקצועות הוזנו`,
            isCompleted: isGradesComplete
        },
        {
            id: 1,
            title: 'פסיכומטרי',
            icon: <Calculator className="w-5 h-5" />,
            summary: psychometricData.general > 0 ? `ציון כללי: ${psychometricData.general}` : 'עדיין לא הוזן',
            isCompleted: isPsychoComplete
        },
        {
            id: 2,
            title: 'מה מעניין אותך?',
            icon: <Compass className="w-5 h-5" />,
            summary: preferences.fields.length > 0 ? `${preferences.fields.length} תחומים נבחרו` : 'טרם נבחרו תחומים',
            isCompleted: isPreferencesComplete
        }
    ];

    return (
        <div className="max-w-3xl mx-auto w-full px-3 pb-20 md:pb-8 pt-2 relative">
            {/* Header */}
            <div className="text-center mb-3">
                <WizardProgress
                    currentStep={currentStep}
                    steps={STEPS}
                    onStepClick={(s) => setCurrentStep(s)}
                />
            </div>

            {/* Sticky Stats Banner — top on mobile, visible while scrolling */}
            {currentStep < 3 && (
                <div className="sticky top-[44px] z-[60] -mx-3 px-3 mb-2">
                    <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-sm px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 font-medium">ממוצע בגרות</span>
                            <span className="text-lg font-black text-blue-600">{currentBagrutStats.average.toFixed(1)}</span>
                            {bonusDiff > 0 && <span className="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded-full">+{bonusDiff}</span>}
                        </div>
                        <Button
                            size="sm"
                            className="bg-gray-900 text-white rounded-full px-4 h-8 text-xs shadow-md"
                            onClick={() => handleStepCompletion(currentStep)}
                        >
                            הבא
                            <ArrowLeft className="w-3 h-3 mr-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Accordion Steps */}
            <div className="space-y-2.5">
                {stepsConfig.map((stepConf) => (
                    <CollapsibleCard
                        key={stepConf.id}
                        title={stepConf.title}
                        icon={stepConf.icon}
                        isOpen={currentStep === stepConf.id}
                        onToggle={() => setCurrentStep(stepConf.id)}
                        summary={stepConf.summary}
                        isCompleted={stepConf.isCompleted}
                        isLocked={currentStep === 3} // Lock all if processing
                    >
                        {renderStepContent(stepConf.id)}
                    </CollapsibleCard>
                ))}

                {/* Processing Step */}
                {currentStep === 3 && (
                    <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center p-4">
                        <Card className="w-full max-w-sm shadow-2xl border-blue-100">
                            {renderStepContent(3)}
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
