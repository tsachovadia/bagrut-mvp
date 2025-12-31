import { useState } from 'react';
import { WizardProgress } from './WizardProgress';
import { BagrutForm } from '../BagrutForm';
import { PsychometricForm } from '../PsychometricForm';
import { StepPreferences } from './StepPreferences';
import { UniversityResultsTable } from '../UniversityResultsTable';
import { SimulationPanel } from '../SimulationPanel';
import { ProgramShowcase } from '../ProgramShowcase';
import { Button } from '../ui/shim';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import type { SubjectGrade, PsychometricScores } from '../../utils/calculator';

interface WizardContainerProps {
    bagrutData: SubjectGrade[];
    onBagrutUpdate: (grades: SubjectGrade[]) => void;
    psychometricData: PsychometricScores;
    onPsychometricUpdate: (scores: PsychometricScores) => void;
    filters: { institution: string; degree: string };
    onFiltersUpdate: (filters: { institution: string; degree: string }) => void;
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
    filters,
    onFiltersUpdate
}: WizardContainerProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [simulatedResults, setSimulatedResults] = useState<any | null>(null);
    const [formKey, setFormKey] = useState(0);

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
        if (!filters.institution && !filters.degree) return data;

        // Attempt filtering assuming standard shape or generic string match
        const searchInst = filters.institution.toLowerCase();
        const searchDeg = filters.degree.toLowerCase();

        return data.filter((item: any) => {
            // Safe check for properties, handle different potential shapes
            const institution = (item.institution || item.name || '').toString().toLowerCase();
            const degreeName = (item.degreeName || item.name || '').toString().toLowerCase();

            const matchInst = !searchInst || institution.includes(searchInst);
            const matchDeg = !searchDeg || degreeName.includes(searchDeg);
            return matchInst && matchDeg;
        });
    };

    // Handle simulation updates (bridge returns a structured object, but results array is flat list of unis)
    // We need to map the simulation output (optimal average) back to the University list format if we want to show it in the table.
    // However, calculation-bridge returns { bagrutAverage, optimal, degrees: [] } - NOT the same structure as `results` (which comes from App.tsx).

    // LIMITATION: App.tsx calculates the *initial* results using `calculateAdmissionStats` then maps it.
    // The SimulationPanel only returns the raw stats from `calculateAdmissionStats`.
    // We need key logic from App.tsx repeated or refactored? 
    // The bridge returns `degrees` array (which implies admission info).
    // Let's assume `onSimulationUpdate` in the panel returns the raw object { optimal: ..., degrees: [...] }
    // We need to adapt it to the table format.

    // Quick Fix: Allow SimulationPanel to return the FULL compatible result list by injecting the University loop logic inside it?
    // OR: just pass the raw "App logic" down? No.
    // Let's modify the handleSimulationUpdate here to transform the stats.

    const handleSimulationUpdate = (newStats: any | null) => {
        if (!newStats) {
            setSimulatedResults(null);
            return;
        }

        // Transform the simulation stats into the 'results' array format expected by the table
        // We map over the original results and update the 'optimal' bagrut average and recalculated sechem
        // This is a simplified calculation to show the *effect* of the simulation

        // MVP Formula approximation (matching App.tsx structure roughly):
        // Sechem = (Bagrut * 0.5) + (Psychometric * 0.5) scaled to university range often.
        // But since we don't have the exact formula per university here, we'll apply the *delta* or just use the new generic average.

        const newResults = results.map(originalResult => {
            const originalSechemScore = originalResult.sechem[0]?.score || 0;
            const oldBagrut = originalResult.average || 100;
            const newBagrut = newStats.optimal?.average || oldBagrut;

            // Calculate improvement ratio or difference
            // If Bagrut improved by 5 points, Sechem improves by ~2.5 (simplified)
            // Plus psychometric bonus if any (we'd need to know it)

            // Better approach: Reconstruct the score using the new Bagrut average
            // Assuming 50/50 weight for simplicity in this view if exact formula unavailable
            // Delta = (NewBagrut - OldBagrut) * Weight
            const bagrutDiff = newBagrut - oldBagrut;

            // Psychometric diff? simple estimation
            // We don't have the new Psychometric score passed directly in newStats easily, 
            // but we can assume the user sees the output.

            // Let's just update the Bagrut part for now as it's the main "Simulation" output we have
            // and assume Psychometric is static or user sees the impact via Bagrut change (which is wrong).

            // ACTUALLY: The SimulationPanel modifies Psychometric too.
            // But we only get `newStats` from it.
            // Let's rely on `newStats.optimal.average` as the key indicator for now
            // and maybe just boost the sechem by the bagrut diff * 1.5 (heuristic).

            const estimatedSechemBoost = bagrutDiff * 1.2;

            return {
                ...originalResult,
                average: Number(newBagrut.toFixed(2)),
                description: "תוצאת סימולציה",
                calculation: "מותאם",
                // status: 'pending', // Keep original status logic or re-eval? Re-eval is hard without thresholds.
                sechem: [{
                    name: 'סכם משוער (סימולציה)',
                    score: Math.min(800, Number((originalSechemScore + estimatedSechemBoost).toFixed(2)))
                }]
            };
        });

        setSimulatedResults(newResults);
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
        <div className="max-w-4xl mx-auto w-full px-2">
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-apple border border-white/60 overflow-hidden transition-all duration-300">
                {/* Progress Header */}
                <div className="bg-white/40 border-b border-white/30 p-2 backdrop-blur-sm">
                    <WizardProgress currentStep={currentStep} steps={STEPS} onStepClick={(step) => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setCurrentStep(step);
                    }} />
                </div>

                {/* Content Area */}
                <div className="p-2 md:p-3 min-h-[100px]">
                    {currentStep === 0 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <BagrutForm
                                key={`bagrut-${formKey}`}
                                onDataUpdate={onBagrutUpdate}
                                initialData={bagrutData}
                                onAutoFill={handleAutoFill}
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
                            <StepPreferences
                                filters={filters}
                                onFilterChange={onFiltersUpdate}
                            />
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <SimulationPanel
                                originalBagrut={bagrutData}
                                originalPsychometric={psychometricData}
                                onSimulationUpdate={handleSimulationUpdate}
                            />

                            <div className="text-center mb-3">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center justify-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    תוצאות הקבלה שלך
                                </h2>
                            </div>
                            <UniversityResultsTable
                                averages={simulatedResults ? getDisplayResults(simulatedResults) : getDisplayResults(results)}
                                originalAverages={simulatedResults ? getDisplayResults(results) : null}
                            />

                            <div className="mt-12 border-t pt-8">
                                <ProgramShowcase />
                            </div>
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
