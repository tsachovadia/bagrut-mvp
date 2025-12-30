import { useState } from 'react';
import { WizardProgress } from './WizardProgress';
import { BagrutForm } from '../BagrutForm';
import { PsychometricForm } from '../PsychometricForm';
import { StepPreferences } from './StepPreferences';
import { UniversityResultsTable } from '../UniversityResultsTable';
import { Button } from '../ui/shim';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import type { SubjectGrade, PsychometricScores } from '../../utils/calculator';

interface WizardContainerProps {
    bagrutData: SubjectGrade[];
    onBagrutUpdate: (grades: SubjectGrade[]) => void;
    psychometricData: PsychometricScores;
    onPsychometricUpdate: (scores: PsychometricScores) => void;
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
    results
}: WizardContainerProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [filters, setFilters] = useState({ institution: '', degree: '' });

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
    const getDisplayResults = () => {
        if (!filters.institution && !filters.degree) return results;

        // Attempt filtering assuming standard shape or generic string match
        const searchInst = filters.institution.toLowerCase();
        const searchDeg = filters.degree.toLowerCase();

        return results.filter(item => {
            // Safe check for properties, handle different potential shapes
            const institution = (item.institution || item.name || '').toString().toLowerCase();
            const degreeName = (item.degreeName || item.name || '').toString().toLowerCase();

            const matchInst = !searchInst || institution.includes(searchInst);
            const matchDeg = !searchDeg || degreeName.includes(searchDeg);
            return matchInst && matchDeg;
        });
    };

    return (
        <div className="max-w-3xl mx-auto w-full px-4">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                {/* Progress Header */}
                <div className="bg-white/50 border-b border-gray-100 p-4">
                    <WizardProgress currentStep={currentStep} steps={STEPS} onStepClick={(step) => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setCurrentStep(step);
                    }} />
                </div>

                {/* Content Area */}
                <div className="p-6 md:p-8 min-h-[300px]">
                    {currentStep === 0 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <BagrutForm
                                onDataUpdate={onBagrutUpdate}
                                initialData={bagrutData}
                            />
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <PsychometricForm
                                onDataUpdate={onPsychometricUpdate}
                                initialData={psychometricData}
                            />
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <StepPreferences
                                filters={filters}
                                onFilterChange={setFilters}
                            />
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                    תוצאות הקבלה שלך
                                </h2>
                            </div>
                            <UniversityResultsTable averages={getDisplayResults()} />
                        </div>
                    )}
                </div>

                {/* Footer / Navigation */}
                <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex items-center justify-between">
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
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg shadow-md shadow-blue-500/20"
                        >
                            המשך
                            <ArrowLeft className="w-4 h-4 mr-1" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
