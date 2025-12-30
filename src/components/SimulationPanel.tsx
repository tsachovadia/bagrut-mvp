import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Label, Input } from './ui/shim';
import { Wand2, TrendingUp, Plus, Minus, Calculator } from 'lucide-react';
import type { SubjectGrade, PsychometricScores } from '../utils/calculator';
import { calculateAdmissionStats } from '../utils/calculation-bridge';

// Helper to quickly deep copy
const clone = (obj: any) => JSON.parse(JSON.stringify(obj));

interface SimulationPanelProps {
    originalBagrut: SubjectGrade[];
    originalPsychometric: PsychometricScores;
    onSimulationUpdate: (simulatedStats: any | null) => void;
}

export const SimulationPanel = ({ originalBagrut, originalPsychometric, onSimulationUpdate }: SimulationPanelProps) => {
    const [isActive, setIsActive] = useState(false);

    // Simulation Modifiers
    const [psychoBonus, setPsychoBonus] = useState(0);
    const [improveMath, setImproveMath] = useState(false);
    const [improveEnglish, setImproveEnglish] = useState(false);
    const [addGeography, setAddGeography] = useState(false); // Common trick: Add easy 5-point elective

    useEffect(() => {
        if (!isActive) {
            onSimulationUpdate(null);
            return;
        }

        const simulatedBagrut = clone(originalBagrut);
        const simulatedPsychometric = clone(originalPsychometric);

        // 1. Apply Psychometric Bonus
        // Distribute bonus across quantitative/verbal/english roughly or just add to general purely for MVP logic
        // Since our calculator uses components, let's just cheat for MVP and boost the general + raw parts equally
        // A better calculation would be needed for real accuracy, but this proves the concept.
        if (psychoBonus > 0) {
            simulatedPsychometric.general = Math.min(800, (simulatedPsychometric.general || 550) + psychoBonus);
            simulatedPsychometric.total = simulatedPsychometric.general; // Ensure consistency
        }

        // 2. Improve Math (Upgrade to 5 units, 90 grade if current is lower)
        if (improveMath) {
            const mathIndex = simulatedBagrut.findIndex((s: SubjectGrade) => s.subject === 'מתמטיקה');
            if (mathIndex >= 0) {
                // Only improve if it's actually an improvement
                if (simulatedBagrut[mathIndex].units < 5 || simulatedBagrut[mathIndex].grade < 90) {
                    simulatedBagrut[mathIndex].units = 5;
                    simulatedBagrut[mathIndex].grade = 90; // Realistic goal grade
                }
            } else {
                // Add if missing
                simulatedBagrut.push({ id: 'sim-math', subject: 'מתמטיקה', units: 5, grade: 90 });
            }
        }

        // 3. Improve English (Upgrade to 5 units, 95 grade)
        if (improveEnglish) {
            const engIndex = simulatedBagrut.findIndex((s: SubjectGrade) => s.subject === 'אנגלית');
            if (engIndex >= 0) {
                if (simulatedBagrut[engIndex].units < 5 || simulatedBagrut[engIndex].grade < 95) {
                    simulatedBagrut[engIndex].units = 5;
                    simulatedBagrut[engIndex].grade = 95;
                }
            } else {
                simulatedBagrut.push({ id: 'sim-eng', subject: 'אנגלית', units: 5, grade: 95 });
            }
        }

        // 4. Add Geography (classic average booster: 5 units, 90 grade)
        if (addGeography) {
            simulatedBagrut.push({
                id: 'sim-geo',
                subject: 'גיאוגרפיה',
                units: 5,
                grade: 95 // Easy subject assumption
            });
        }

        // Run Calculation
        const newStats = calculateAdmissionStats(simulatedBagrut, simulatedPsychometric);
        onSimulationUpdate(newStats);

    }, [isActive, psychoBonus, improveMath, improveEnglish, addGeography, originalBagrut, originalPsychometric]);

    if (!isActive) {
        return (
            <div className="flex justify-center mb-4">
                <Button
                    onClick={() => setIsActive(true)}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-200 transform hover:scale-105 transition-all text-sm px-6 py-2.5 rounded-xl border border-indigo-400/20"
                >
                    <Wand2 className="w-4 h-4 ml-1.5 animate-pulse" />
                    הפעל סימולטור שיפור ציונים
                </Button>
            </div>
        );
    }

    return (
        <Card className="mb-4 border border-indigo-100 bg-indigo-50/30 overflow-hidden shadow-sm">
            <CardHeader className="bg-indigo-100/50 py-2 border-b border-indigo-100 px-3">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-indigo-900 flex items-center gap-1.5 text-sm font-semibold">
                        <Wand2 className="w-4 h-4 text-indigo-600" />
                        סימולטור שיפורים
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsActive(false)}
                        className="text-indigo-400 hover:bg-indigo-100 hover:text-indigo-700 h-6 px-2 text-xs"
                    >
                        כבה סימולטור
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-3 px-3 pb-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Psychometric Slider */}
                    <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-indigo-100 shadow-sm">
                        <div className="flex justify-between items-center">
                            <Label className="font-bold text-gray-700 text-xs">שיפור פסיכומטרי</Label>
                            <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                +{psychoBonus}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            step="10"
                            value={psychoBonus}
                            onChange={(e) => setPsychoBonus(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <p className="text-[10px] text-gray-500 leading-tight">
                            הוספת נקודות לציון הפסיכומטרי
                        </p>
                    </div>

                    {/* Math Toggle */}
                    <div
                        onClick={() => setImproveMath(!improveMath)}
                        className={`cursor-pointer p-2.5 rounded-lg border transition-all duration-200 flex flex-col justify-between
                            ${improveMath ? 'bg-indigo-600 border-indigo-600 text-white shadow-md transform scale-[1.02]' : 'bg-white border-indigo-100 text-gray-600 hover:border-indigo-300'}
                        `}
                    >
                        <div className="flex justify-between items-start">
                            <Label className={`font-bold text-xs cursor-pointer ${improveMath ? 'text-white' : 'text-gray-700'}`}>שיפור מתמטיקה</Label>
                            <Calculator className="w-4 h-4 opacity-80" />
                        </div>
                        <div className="mt-1 text-[10px] opacity-90">
                            שדרוג ל-5 יח"ל בציון 90
                        </div>
                    </div>

                    {/* English Toggle */}
                    <div
                        onClick={() => setImproveEnglish(!improveEnglish)}
                        className={`cursor-pointer p-2.5 rounded-lg border transition-all duration-200 flex flex-col justify-between
                            ${improveEnglish ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-[1.02]' : 'bg-white border-blue-100 text-gray-600 hover:border-blue-300'}
                        `}
                    >
                        <div className="flex justify-between items-start">
                            <Label className={`font-bold text-xs cursor-pointer ${improveEnglish ? 'text-white' : 'text-gray-700'}`}>שיפור אנגלית</Label>
                            <div className="font-serif text-sm leading-none opacity-80">A+</div>
                        </div>
                        <div className="mt-1 text-[10px] opacity-90">
                            שדרוג ל-5 יח"ל בציון 95
                        </div>
                    </div>

                    {/* Geography Toggle (Add Subject) */}
                    <div
                        onClick={() => setAddGeography(!addGeography)}
                        className={`cursor-pointer p-2.5 rounded-lg border transition-all duration-200 flex flex-col justify-between
                            ${addGeography ? 'bg-emerald-600 border-emerald-600 text-white shadow-md transform scale-[1.02]' : 'bg-white border-emerald-100 text-gray-600 hover:border-emerald-300'}
                        `}
                    >
                        <div className="flex justify-between items-start">
                            <Label className={`font-bold text-xs cursor-pointer ${addGeography ? 'text-white' : 'text-gray-700'}`}>הוספת גיאוגרפיה</Label>
                            <Plus className="w-4 h-4 opacity-80" />
                        </div>
                        <div className="mt-1 text-[10px] opacity-90">
                            מגמה קלה (5 יח"ל, 95)
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
};
