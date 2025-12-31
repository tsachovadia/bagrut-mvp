
import { useState, useEffect } from 'react';
import { loadUserData } from '../../lib/userData';
import { calculateAdmissionStats } from '../../utils/calculation-bridge';
import type { SubjectGrade, PsychometricScores } from '../../utils/calculator';
import { MyDataPanel } from './MyDataPanel';
import { PlaygroundPanel } from './PlaygroundPanel';
import { TargetsPanel } from './TargetsPanel';
import { Button } from '../ui/shim';
import { Calculator } from 'lucide-react';

export const UnifiedDashboard = () => {
    // ---- State ----
    const [loading, setLoading] = useState(true);
    const [originalData, setOriginalData] = useState<{
        bagrut: SubjectGrade[];
        psychometric: PsychometricScores;
    } | null>(null);

    // Simulation State
    const [simulatedBagrut, setSimulatedBagrut] = useState<SubjectGrade[]>([]);
    const [simulatedPsychometric, setSimulatedPsychometric] = useState<PsychometricScores>({
        general: 0, quantitative: 0, verbal: 0, english: 0
    });

    // Target/Results State
    const [targetDegree, setTargetDegree] = useState<string | null>(null);

    // Calculated Stats
    const [originalStats, setOriginalStats] = useState<any>(null);
    const [simulatedStats, setSimulatedStats] = useState<any>(null);

    // ---- Effects ----
    // 1. Load Data
    useEffect(() => {
        async function init() {
            const data = await loadUserData();
            if (data && data.bagrut?.length > 0 && data.psychometric?.general > 0) {
                setOriginalData(data);

                // Init Simulation with deep copy
                setSimulatedBagrut(JSON.parse(JSON.stringify(data.bagrut)));
                setSimulatedPsychometric({ ...data.psychometric });

                // Calc Original Stats
                const stats = calculateAdmissionStats(data.bagrut, data.psychometric);
                setOriginalStats(stats);
            }
            setLoading(false);
        }
        init();
    }, []);

    // 2. Calc Simulation Stats on change
    useEffect(() => {
        if (simulatedBagrut.length > 0) {
            const stats = calculateAdmissionStats(simulatedBagrut, simulatedPsychometric);
            setSimulatedStats(stats);
        }
    }, [simulatedBagrut, simulatedPsychometric]);


    // ---- Handlers ----
    const handleGradeChange = (index: number, field: 'grade' | 'units', value: number) => {
        const newBagrut = [...simulatedBagrut];
        newBagrut[index] = { ...newBagrut[index], [field]: value };
        setSimulatedBagrut(newBagrut);
    };

    const handlePsychometricChange = (field: keyof PsychometricScores, value: number) => {
        setSimulatedPsychometric(prev => ({ ...prev, [field]: value }));
    };

    const handleReset = () => {
        if (originalData) {
            setSimulatedBagrut(JSON.parse(JSON.stringify(originalData.bagrut)));
            setSimulatedPsychometric({ ...originalData.psychometric });
        }
    };

    const handleUpdateOriginalData = (newBagrut: SubjectGrade[], newPsychometric: PsychometricScores) => {
        setOriginalData(prev => prev ? { ...prev, bagrut: newBagrut, psychometric: newPsychometric } : null);
        // Also sync simulation to new baseline to prevent confusion
        setSimulatedBagrut(newBagrut);
        setSimulatedPsychometric(newPsychometric);
    };

    // ---- Render ----
    if (loading || !originalData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">טוען את הקוקפיט...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] font-sans p-2 lg:p-3 dir-rtl lg:overflow-hidden overflow-y-auto" dir="rtl">
            <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3 lg:h-[calc(100vh-24px)] h-auto">

                {/* Right Column: "The Wizard" (Editable Data) */}
                <div className="lg:col-span-3 h-full overflow-hidden flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100/50 min-h-[500px] lg:min-h-0">
                    <MyDataPanel
                        stats={originalStats}
                        bagrut={originalData.bagrut}
                        psychometric={originalData.psychometric}
                        onUpdate={(bagrut, psycho) => handleUpdateOriginalData(bagrut, psycho)}
                    />
                </div>

                {/* Middle Column: "The Simulator" (Knobs & Speakers) */}
                <div className="lg:col-span-6 h-full overflow-hidden flex flex-col bg-white rounded-3xl shadow-sm border border-gray-200/50 relative min-h-[600px] lg:min-h-0">
                    {/* Background Gradient - moved to z-0 to ensure it's behind content if z-indexing fails, though pointer-events-none should work */}
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white pointer-events-none z-0" />
                    <div className="relative z-10 h-full flex flex-col">
                        <PlaygroundPanel
                            bagrut={simulatedBagrut}
                            psychometric={simulatedPsychometric}
                            onBagrutChange={handleGradeChange}
                            onPsychometricChange={handlePsychometricChange}
                            onReset={handleReset}
                            originalStats={originalStats}
                            simulatedStats={simulatedStats}
                        />
                    </div>
                </div>

                {/* Left Column: "The Watch" (Targets) */}
                <div className="lg:col-span-3 h-full overflow-hidden flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100/50">
                    <TargetsPanel
                        simulatedStats={simulatedStats}
                        originalStats={originalStats}
                        targetDegree={targetDegree}
                        setTargetDegree={setTargetDegree}
                    />
                </div>
            </div>
        </div>
    );
};
