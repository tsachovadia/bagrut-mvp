import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadUserData, saveUserData, type UserData } from '../../lib/userData';
import { calculateAdmissionStats } from '../../utils/calculation-bridge';
import type { SubjectGrade, PsychometricScores } from '../../utils/calculator';
import { MyDataPanel } from './MyDataPanel';
import { SimulationSidebar } from './SimulationSidebar';
import { ResultsAuthGate } from '../ResultsAuthGate';

import { TargetsPanel } from './TargetsPanel';
import { SimulationInsightOverlay } from './SimulationInsightOverlay';
import { generateSimulationInsights, type SimulationInsight } from '../../utils/calculation-bridge';
import { Button } from '../ui/shim';
import { Calculator } from 'lucide-react';


export const UnifiedDashboard = () => {
    const navigate = useNavigate();
    // ---- State ----
    const [loading, setLoading] = useState(true);
    const [originalData, setOriginalData] = useState<UserData | null>(null);

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
    const [insights, setInsights] = useState<SimulationInsight[]>([]);

    const [sector, setSector] = useState<string>('mamlachti');


    // ---- Effects ----
    // 1. Load Data
    useEffect(() => {
        async function init() {
            const data = await loadUserData();
            console.log('[UnifiedDashboard] Loaded data:', data);
            if (data && data.bagrut?.length > 0) {
                setOriginalData(data);
                if (data.sector) setSector(data.sector);

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
            // Generate Insights
            if (originalStats) {
                const newInsights = generateSimulationInsights(originalStats, stats);
                setInsights(newInsights);
            }
        }
    }, [simulatedBagrut, simulatedPsychometric, originalStats]);

    // 3. Calc stats for all saved simulations (Memoized)


    // eslint-disable-next-line react-hooks/exhaustive-deps
    const simulationsWithStats = useMemo(() => {
        if (!originalData?.savedSimulations) return [];
        return originalData.savedSimulations.map(sim => ({
            ...sim,
            stats: calculateAdmissionStats(sim.bagrut, sim.psychometric)
        })).sort((a, b) => b.createdAt - a.createdAt);
    }, [originalData?.savedSimulations]);

    // ---- Handlers ----
    // Simulation Management State
    const [activeSimulationId, setActiveSimulationId] = useState<string | null>(null);

    // ... (Stats Effects remain)

    // 2. Calc Simulation Stats on change (No change needed)


    // ---- Handlers ----

    // Update Simulation State (from MyDataPanel)
    const handleSimulationUpdate = (newBagrut: SubjectGrade[], newPsychometric: PsychometricScores) => {
        setSimulatedBagrut(newBagrut);
        setSimulatedPsychometric(newPsychometric);
        // If we change data while in a saved simulation (without saving), we might conceptually be "editing" it 
        // or starting a new unsaved one. For simplicity, we keep the ID active until they save as new or switch.
    };

    // Create NEW simulation
    const handleSaveSimulation = (name: string) => {
        if (!originalData) return;

        // Default Name Logic
        let finalName = name.trim();
        if (!finalName) {
            const count = (originalData.savedSimulations?.length || 0) + 1;
            // Hebrew letter based naming? Or just numbers? User asked for "Simulation A/B"
            // Let's stick effectively to "Simulation 1", "Simulation 2" for simplicity or a simple mapper
            const hebrewLetters = ['א', 'ב', 'ג', 'ד', 'ה', 'ו'];
            const letter = hebrewLetters[count - 1] || count.toString();
            finalName = `סימולציה ${letter}`;
        }

        const newSimulation = {
            id: crypto.randomUUID(),
            name: finalName,
            createdAt: Date.now(),
            bagrut: simulatedBagrut,
            psychometric: simulatedPsychometric
        };


        const updatedSimulations = [...(originalData.savedSimulations || []), newSimulation];
        const updatedData = { ...updatedSimulations.length ? { ...originalData, savedSimulations: updatedSimulations } : originalData };
        // Logic simplification:
        const newData = { ...originalData, savedSimulations: updatedSimulations };

        setOriginalData(newData);
        saveUserData(newData);
        setActiveSimulationId(newSimulation.id);
    };

    // Update EXISTING simulation
    const handleUpdateSimulation = (id: string) => {
        if (!originalData || !originalData.savedSimulations) return;

        const updatedSimulations = originalData.savedSimulations.map(sim => {
            if (sim.id === id) {
                return {
                    ...sim,
                    bagrut: simulatedBagrut,
                    psychometric: simulatedPsychometric,
                    createdAt: Date.now() // Optional: update timestamp
                };
            }
            return sim;
        });

        const newData = { ...originalData, savedSimulations: updatedSimulations };
        setOriginalData(newData);
        saveUserData(newData);
    };

    const handleDeleteSimulation = (id: string) => {
        if (!originalData || !originalData.savedSimulations) return;

        const updatedSimulations = originalData.savedSimulations.filter(s => s.id !== id);
        const newData = { ...originalData, savedSimulations: updatedSimulations };

        setOriginalData(newData);
        saveUserData(newData);

        if (activeSimulationId === id) {
            handleResetSimulation();
        }
    };

    const handleLoadSimulation = (simId: string) => {
        if (!simId) {
            // Reset to Original
            handleResetSimulation();
            return;
        }

        const sim = originalData?.savedSimulations?.find(s => s.id === simId);
        if (sim) {
            setSimulatedBagrut(JSON.parse(JSON.stringify(sim.bagrut)));
            setSimulatedPsychometric({ ...sim.psychometric });
            setActiveSimulationId(sim.id);
        }
    };

    const handleResetSimulation = () => {
        if (originalData) {
            setSimulatedBagrut(JSON.parse(JSON.stringify(originalData.bagrut)));
            setSimulatedPsychometric({ ...originalData.psychometric });
            setActiveSimulationId(null);
        }
    };

    const handleSectorUpdate = (newSector: any) => {
        setSector(newSector);
        if (originalData) {
            saveUserData({
                ...originalData,
                sector: newSector
            });
        }
    };

    const handlePreferencesUpdate = (newPrefs: any) => {
        if (!originalData) return;
        const newData = { ...originalData, preferences: newPrefs };
        setOriginalData(newData);
        saveUserData(newData);
    };

    // ---- Render ----
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">טוען את הקוקפיט...</p>
                </div>
            </div>
        );
    }

    if (!originalData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
                <div className="flex flex-col items-center gap-6 max-w-md text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                        <Calculator className="w-10 h-10 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">אין נתונים להצגה</h2>
                        <p className="text-gray-600">
                            נראה שעדיין לא הזנת ציונים. כדי להשתמש בקוקפיט, יש להזין ציוני בגרות ופסיכומטרי.
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate('/')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        מעבר למחשבון
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <ResultsAuthGate>
            <div className="min-h-screen bg-[#F5F5F7] font-sans p-2 lg:p-3 dir-rtl lg:overflow-hidden overflow-y-auto" dir="rtl">
                <div className="max-w-[1920px] mx-auto flex flex-col lg:flex-row gap-3 h-auto lg:h-[calc(100vh-24px)] overflow-hidden">

                    {/* 1. Sidebar (Rightmost in RTL) */}
                    <div className="hidden lg:block h-full shrink-0 relative z-20">
                        <SimulationSidebar
                            savedSimulations={originalData.savedSimulations || []}
                            activeSimulationId={activeSimulationId}
                            onSelect={handleLoadSimulation}
                            onDelete={handleDeleteSimulation}
                            originalBagrut={originalData.bagrut}
                            originalPsychometric={originalData.psychometric}
                        />

                    </div>

                    {/* 2. My Data (Center - Takes remaining space) */}
                    <div className="flex-1 h-full overflow-hidden flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100/50 min-h-[500px] lg:min-h-0 relative z-10">
                        <MyDataPanel
                            originalBagrut={originalData.bagrut}
                            originalPsychometric={originalData.psychometric}
                            simulatedBagrut={simulatedBagrut}
                            simulatedPsychometric={simulatedPsychometric}
                            onSimulationUpdate={handleSimulationUpdate}
                            onSaveSimulation={handleSaveSimulation}
                            onUpdateSimulation={handleUpdateSimulation}
                            onLoadSimulation={handleLoadSimulation}
                            savedSimulations={originalData.savedSimulations || []}
                            activeSimulationId={activeSimulationId}
                            onReset={handleResetSimulation}
                            sector={sector}
                        />
                    </div>

                    {/* 3. Targets (Left Sidebar) */}
                    <div className="h-full shrink-0 relative z-20 min-h-[500px] lg:min-h-0">
                        <TargetsPanel
                            simulatedStats={simulatedStats}
                            originalStats={originalStats}
                            targetDegree={targetDegree}
                            setTargetDegree={setTargetDegree}
                            allSimulationsStats={simulationsWithStats}
                            preferences={originalData?.preferences}
                            onPreferencesUpdate={handlePreferencesUpdate}
                        />
                    </div>

                    {/* Insights Overlay */}
                    <SimulationInsightOverlay insights={insights} isVisible={true} />
                </div>
            </div>
        </ResultsAuthGate>
    );

};
