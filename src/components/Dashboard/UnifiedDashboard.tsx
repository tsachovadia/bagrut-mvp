
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

    // ---- Render ----
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">טוען...</div>;

    if (!originalData) {
        // Fallback for no data: ideally redirect to Wizard or show "Empty State"
        // For now, we will render a simplified "Go configure" view
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">ברוכים הבאים לקוקפיט הקבלה! 🚀</h1>
                <p className="text-gray-600 mb-8">כדי להתחיל, אנחנו צריכים להכיר את הציונים שלך.</p>
                <Button onClick={() => window.location.href = '/'} className="bg-blue-600 text-white px-8 py-3 rounded-xl">
                    <Calculator className="w-5 h-5 ml-2" />
                    הכנס ציונים ראשוניים
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4 lg:p-6 dir-rtl" dir="rtl">
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)]">

                {/* Right Column: My Data (Read Only) */}
                <div className="lg:col-span-3 h-full overflow-hidden">
                    <MyDataPanel
                        stats={originalStats}
                        bagrut={originalData.bagrut}
                        psychometric={originalData.psychometric}
                    />
                </div>

                {/* Middle Column: Playground (Edit) */}
                <div className="lg:col-span-6 h-full overflow-hidden">
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

                {/* Left Column: Targets (Results) */}
                <div className="lg:col-span-3 h-full overflow-hidden">
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
