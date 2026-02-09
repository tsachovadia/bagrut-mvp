import { useState, useEffect } from 'react';
import { FileText, Calculator, Plus, X, Save, RotateCcw, ChevronDown, Trash2 } from 'lucide-react';
import type { SubjectGrade, PsychometricScores } from '../../utils/calculator';
import { Button } from '../ui/shim';
import type { SavedSimulation } from '../../lib/userData';

interface Props {
    originalBagrut: SubjectGrade[];
    originalPsychometric: PsychometricScores;
    simulatedBagrut: SubjectGrade[];
    simulatedPsychometric: PsychometricScores;
    onSimulationUpdate: (bagrut: SubjectGrade[], psychometric: PsychometricScores) => void;
    onSaveSimulation: (name: string) => void;
    onUpdateSimulation?: (id: string) => void; // New prop for updating existing
    onLoadSimulation: (simulationId: string) => void; // Pass ID to load
    savedSimulations: SavedSimulation[];
    activeSimulationId: string | null;
    onReset: () => void;
    sector: string;
}

export const MyDataPanel = ({
    originalBagrut,
    originalPsychometric,
    simulatedBagrut,
    simulatedPsychometric,
    onSimulationUpdate,
    onSaveSimulation,
    onUpdateSimulation,
    onLoadSimulation,
    savedSimulations,
    activeSimulationId,
    onReset,
    sector
}: Props) => {
    const [editingCell, setEditingCell] = useState<{ index: number, field: 'grade' | 'units' } | null>(null);
    const [psychoEditingField, setPsychoEditingField] = useState<keyof PsychometricScores | null>(null);

    // Save Dialog State
    const [showSaveInput, setShowSaveInput] = useState(false);
    const [newSimName, setNewSimName] = useState('');

    // Check if currently simulating (diff from original)
    const isSimulating = JSON.stringify(originalBagrut) !== JSON.stringify(simulatedBagrut) ||
        JSON.stringify(originalPsychometric) !== JSON.stringify(simulatedPsychometric);
    // Note: Comparing objects directly might be flaky, but for small JSONs it's often OK. 
    // Better to rely on "active override" state, but for now we check data equality.

    // ----------------------------------------------------
    // Bagrut Helpers
    // ----------------------------------------------------
    const handleBagrutOverride = (index: number, field: 'grade' | 'units', value: number) => {
        const newBagrut = [...simulatedBagrut];
        newBagrut[index] = { ...newBagrut[index], [field]: value };
        onSimulationUpdate(newBagrut, simulatedPsychometric);
        setEditingCell(null); // Close edit mode after Enter/Blur? Or keep open? Let's close on Enter/Blur usually.
    };

    const isBagrutChanged = (index: number) => {
        const orig = originalBagrut[index];
        const sim = simulatedBagrut[index];
        if (!orig || !sim) return false;
        return orig.grade !== sim.grade || orig.units !== sim.units;
    };

    // ----------------------------------------------------
    // Psychometric Helpers
    // ----------------------------------------------------
    const handlePsychoOverride = (field: keyof PsychometricScores, value: number) => {
        const newPsycho = { ...simulatedPsychometric, [field]: value };
        onSimulationUpdate(simulatedBagrut, newPsycho);
        setPsychoEditingField(null);
    };

    const isPsychoChanged = (field: keyof PsychometricScores) => {
        return originalPsychometric[field] !== simulatedPsychometric[field];
    };


    return (
        <div className="h-full flex flex-col bg-white">
            {/* Top Bar: Simulation Controls */}
            <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                    {/* Simulation Selector */}
                    <div className="relative group">
                        <select
                            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none min-w-[140px]"
                            value={activeSimulationId || ""}
                            onChange={(e) => onLoadSimulation(e.target.value)}
                        >
                            <option value="">הציונים המקוריים שלי</option>
                            {savedSimulations?.map(sim => (
                                <option key={sim.id} value={sim.id}>{sim.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Save Button */}
                    {showSaveInput ? (
                        <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                            <input
                                type="text"
                                placeholder="שם (או השאר ריק לאוטומטי)"
                                className="text-sm border border-gray-200 rounded px-2 py-1 w-40 focus:outline-none focus:border-blue-500"
                                value={newSimName}
                                onChange={(e) => setNewSimName(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        onSaveSimulation(newSimName); // Allow empty
                                        setShowSaveInput(false);
                                        setNewSimName('');
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    onSaveSimulation(newSimName); // Allow empty for default name
                                    setShowSaveInput(false);
                                    setNewSimName('');
                                }}
                                className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm"
                            >
                                <Save className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setShowSaveInput(false)} className="p-1.5 text-gray-400 hover:text-gray-600">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            {activeSimulationId && onUpdateSimulation && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-amber-600 border-amber-100 hover:bg-amber-50 text-xs h-8 gap-1.5"
                                    onClick={() => onUpdateSimulation(activeSimulationId)}
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    עדכן קיים
                                </Button>
                            )}
                            <Button
                                variant="default"
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 gap-1.5 shadow-sm"
                                onClick={() => setShowSaveInput(true)}
                            >
                                <Plus className="w-3.5 h-3.5" />
                                {activeSimulationId ? 'שמור כחדש' : 'שמור סימולציה'}
                            </Button>
                        </div>
                    )}

                    {/* Reset Button */}
                    <button
                        onClick={onReset}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="אפס סימולציה"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>



            {/* Unified Content - No Tabs */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                <div className="divide-y divide-gray-50">
                    {/* Header */}
                    <div className="grid grid-cols-12 px-4 py-2 bg-gray-50/80 text-xs font-medium text-gray-400 sticky top-0 z-10 backdrop-blur-md">
                        <div className="col-span-12 pt-2 pb-1 text-[10px] uppercase tracking-wider text-blue-600 font-bold px-1">מקצועות ליבה עם בונוס</div>
                        <div className="col-span-5 text-right">מקצוע</div>
                        <div className="col-span-3 text-center">מקורי</div>
                        <div className="col-span-4 text-center">סימולציה</div>
                    </div>

                    {/* Bonus Subjects (Math, English, Physics etc first) */}
                    {originalBagrut.filter(s => ['מתמטיקה', 'אנגלית', 'פיזיקה'].includes(s.subject)).map((origSubject, idx) => {
                        // Find original index to maintain correct updates
                        const realIdx = originalBagrut.findIndex(s => s.subject === origSubject.subject);
                        const simSubject = simulatedBagrut[realIdx] || origSubject;
                        const isChanged = origSubject.grade !== simSubject.grade;

                        return (
                            <div key={realIdx} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-gray-50/50 transition-colors group">
                                <div className="col-span-5 text-sm font-medium text-gray-800 truncate pl-2">
                                    {origSubject.subject}
                                    <span className="text-gray-400 text-xs font-normal mr-1">({origSubject.units} יח״ל)</span>
                                </div>
                                <div className="col-span-3 text-center text-sm font-medium text-gray-400 py-1 bg-gray-50/50 rounded mx-1">
                                    {origSubject.grade}
                                </div>
                                <div className="col-span-4 flex justify-center h-8">
                                    {editingCell?.index === realIdx ? (
                                        <input
                                            type="number"
                                            className="w-16 text-center text-sm font-bold text-blue-600 border-2 border-blue-500 rounded focus:outline-none bg-white shadow-sm"
                                            autoFocus
                                            defaultValue={simSubject.grade}
                                            onBlur={(e) => handleBagrutOverride(realIdx, 'grade', Number(e.target.value))}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleBagrutOverride(realIdx, 'grade', Number(e.currentTarget.value));
                                            }}
                                        />
                                    ) : (
                                        <button
                                            onClick={() => setEditingCell({ index: realIdx, field: 'grade' })}
                                            className={`w-16 text-sm font-bold rounded border transition-all shadow-sm ${isChanged ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-300 border-transparent hover:text-blue-500 hover:border-gray-200'
                                                }`}
                                        >
                                            {isChanged ? simSubject.grade : '+'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Psychometric Section */}
                    <div className="grid grid-cols-12 px-4 py-2 bg-purple-50/30 text-xs font-medium text-gray-400 border-y border-purple-50 mt-4">
                        <div className="col-span-12 pt-1 pb-1 text-[10px] uppercase tracking-wider text-purple-600 font-bold px-1">פסיכומטרי</div>
                        <div className="col-span-5 text-right">רכיב</div>
                        <div className="col-span-3 text-center">מקורי</div>
                        <div className="col-span-4 text-center">סימולציה</div>
                    </div>
                    {[
                        { key: 'general', label: 'ציון כללי' },
                        { key: 'quantitative', label: 'חשיבה כמותית' },
                        { key: 'verbal', label: 'חשיבה מילולית' },
                        { key: 'english', label: 'אנגלית' },
                    ].map((field) => {
                        const key = field.key as keyof PsychometricScores;
                        const origVal = originalPsychometric[key];
                        const simVal = simulatedPsychometric[key];
                        const isChanged = origVal !== simVal;

                        return (
                            <div key={key} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-purple-50/20 transition-colors group">
                                <div className="col-span-5 text-sm font-medium text-gray-800 truncate pl-2">{field.label}</div>
                                <div className="col-span-3 text-center text-sm font-medium text-gray-400 py-1 bg-gray-50/50 rounded mx-1">{origVal}</div>
                                <div className="col-span-4 flex justify-center h-8">
                                    {psychoEditingField === key ? (
                                        <input
                                            type="number"
                                            className="w-16 text-center text-sm font-bold text-purple-600 border-2 border-purple-500 rounded focus:outline-none bg-white shadow-sm"
                                            autoFocus
                                            defaultValue={simVal}
                                            onBlur={(e) => handlePsychoOverride(key, Number(e.target.value))}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handlePsychoOverride(key, Number(e.currentTarget.value));
                                            }}
                                        />
                                    ) : (
                                        <button
                                            onClick={() => setPsychoEditingField(key)}
                                            className={`w-16 text-sm font-bold rounded border transition-all shadow-sm ${isChanged ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-white text-gray-300 border-transparent hover:text-purple-500 hover:border-gray-200'
                                                }`}
                                        >
                                            {isChanged ? simVal : '+'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}


                    {/* Other Subjects Header */}
                    <div className="grid grid-cols-12 px-4 py-2 bg-gray-50/80 text-xs font-medium text-gray-400 mt-4 border-t border-gray-100">
                        <div className="col-span-12 pt-1 pb-1 text-[10px] uppercase tracking-wider text-gray-500 font-bold px-1">שאר המקצועות</div>
                    </div>

                    {/* Other Subjects */}
                    {originalBagrut.filter(s => !['מתמטיקה', 'אנגלית', 'פיזיקה'].includes(s.subject)).map((origSubject, idx) => {
                        // Find original index to maintain correct updates
                        const realIdx = originalBagrut.findIndex(s => s.subject === origSubject.subject);
                        const simSubject = simulatedBagrut[realIdx] || origSubject;
                        const isChanged = origSubject.grade !== simSubject.grade;

                        return (
                            <div key={realIdx} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-gray-50/50 transition-colors group">
                                <div className="col-span-5 text-sm font-medium text-gray-800 truncate pl-2">
                                    {origSubject.subject}
                                    <span className="text-gray-400 text-xs font-normal mr-1">({origSubject.units} יח״ל)</span>
                                </div>
                                <div className="col-span-3 text-center text-sm font-medium text-gray-400 py-1 bg-gray-50/50 rounded mx-1">
                                    {origSubject.grade}
                                </div>
                                <div className="col-span-4 flex justify-center h-8">
                                    {editingCell?.index === realIdx ? (
                                        <input
                                            type="number"
                                            className="w-16 text-center text-sm font-bold text-blue-600 border-2 border-blue-500 rounded focus:outline-none bg-white shadow-sm"
                                            autoFocus
                                            defaultValue={simSubject.grade}
                                            onBlur={(e) => handleBagrutOverride(realIdx, 'grade', Number(e.target.value))}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleBagrutOverride(realIdx, 'grade', Number(e.currentTarget.value));
                                            }}
                                        />
                                    ) : (
                                        <button
                                            onClick={() => setEditingCell({ index: realIdx, field: 'grade' })}
                                            className={`w-16 text-sm font-bold rounded border transition-all shadow-sm ${isChanged ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-300 border-transparent hover:text-blue-500 hover:border-gray-200'
                                                }`}
                                        >
                                            {isChanged ? simSubject.grade : '+'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>

            {/* Legend / Info Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-400">
                * הנתונים המקוריים נשמרים תמיד. שנה ערכים כדי לראות השפעה.
            </div>
        </div >
    );
};
