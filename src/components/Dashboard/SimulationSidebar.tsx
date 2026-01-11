import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import type { SavedSimulation } from '../../lib/userData';
import { calculateAdmissionStats } from '../../utils/calculation-bridge';

interface Props {
    savedSimulations: SavedSimulation[];
    originalBagrut?: any[]; // For diff comparison
    originalPsychometric?: any;
    activeSimulationId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}

export const SimulationSidebar = ({ savedSimulations, originalBagrut, originalPsychometric, activeSimulationId, onSelect, onDelete }: Props) => {
    const [isExpanded, setIsExpanded] = useState(true);

    // Calculate summaries for all simulations
    const simulationSummaries = useMemo(() => {
        return savedSimulations.map(sim => {
            const stats = calculateAdmissionStats(sim.bagrut, sim.psychometric);
            return {
                ...sim,
                stats
            };
        });
    }, [savedSimulations]);

    return (
        <div
            className={`
                bg-white border-l border-gray-100 shadow-sm flex flex-col transition-all duration-300 ease-in-out
                ${isExpanded ? 'w-80' : 'w-16'}
                h-full rounded-2xl overflow-hidden
            `}
        >
            {/* Header / Toggle */}
            <div className={`p-4 border-b border-gray-50 flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
                {isExpanded && <span className="font-bold text-gray-800 text-sm">הסימולציות שלי</span>}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                >
                    {isExpanded ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {simulationSummaries.map((sim) => {
                    const isActive = sim.id === activeSimulationId;

                    if (!isExpanded) {
                        // Collapsed View (Icons/Initials)
                        return (
                            <button
                                key={sim.id}
                                onClick={() => onSelect(sim.id)}
                                className={`
                                    w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all relative group
                                    ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-blue-50'}
                                `}
                                title={sim.name}
                            >
                                {sim.name.charAt(0)}
                                {isActive && <div className="absolute right-0 top-0 w-2 h-2 bg-amber-400 rounded-full border-2 border-white translate-x-1/3 -translate-y-1/3" />}
                            </button>
                        );
                    }

                    // Expanded View (Card)
                    return (
                        <div
                            key={sim.id}
                            className={`
                                group relative p-3 rounded-xl border transition-all cursor-pointer
                                ${isActive
                                    ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                                    : 'bg-white border-gray-100 hover:border-blue-100 hover:shadow-sm'
                                }
                            `}
                            onClick={() => onSelect(sim.id)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className={`font-bold text-sm ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                                    {sim.name}
                                </h3>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(sim.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white/50 p-1.5 rounded border border-gray-50 flex flex-col items-center">
                                    <span className="text-[10px] text-gray-400 mb-0.5">ממוצע בגרות</span>
                                    <span className="font-mono font-bold text-gray-700">
                                        {sim.stats.bagrutAverage.toFixed(1)}
                                    </span>
                                </div>
                                <div className="bg-white/50 p-1.5 rounded border border-gray-50 flex flex-col items-center">
                                    <span className="text-[10px] text-gray-400 mb-0.5">פסיכומטרי</span>
                                    <span className="font-mono font-bold text-gray-700">
                                        {sim.psychometric.general}
                                    </span>
                                </div>
                            </div>

                            {/* Diff / Changes Summary */}
                            {originalBagrut && (
                                <div className="mt-2 pt-2 border-t border-gray-50 space-y-1">
                                    {getDiffSummary(sim, originalBagrut, originalPsychometric).slice(0, 3).map((diff, i) => (
                                        <div key={i} className="text-[10px] text-gray-500 flex justify-between">
                                            <span>{diff.label}</span>
                                            <span className="font-medium text-gray-700" dir="ltr">{diff.oldVal} &rarr; {diff.newVal}</span>
                                        </div>
                                    ))}
                                    {getDiffSummary(sim, originalBagrut, originalPsychometric).length > 3 && (
                                        <div className="text-[9px] text-gray-400 text-center">
                                            +{getDiffSummary(sim, originalBagrut, originalPsychometric).length - 3} עוד שינויים
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {simulationSummaries.length === 0 && isExpanded && (
                    <div className="text-center py-8 text-gray-400 text-xs">
                        אין סימולציות שמורות
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper: Generate Diff List
const getDiffSummary = (sim: any, originalBagrut: any[], originalPsychometric: any) => {
    const diffs: { label: string, oldVal: any, newVal: any }[] = [];

    if (!originalBagrut || !originalPsychometric) return diffs;

    // Bagrut Diffs
    sim.bagrut.forEach((sSubject: any, idx: number) => {
        const oSubject = originalBagrut[idx];
        if (oSubject && (oSubject.grade !== sSubject.grade || oSubject.units !== sSubject.units)) {
            diffs.push({
                label: sSubject.subject,
                oldVal: oSubject.grade,
                newVal: sSubject.grade
            });
        }
    });

    // Psychometric Diffs
    ['general', 'quantitative', 'verbal', 'english'].forEach((key) => {
        if (sim.psychometric[key] !== originalPsychometric[key]) {
            const labelMap: any = { general: 'כללי', quantitative: 'כמותי', verbal: 'מילולי', english: 'אנגלית' };
            diffs.push({
                label: labelMap[key] || key,
                oldVal: originalPsychometric[key],
                newVal: sim.psychometric[key]
            });
        }
    });

    return diffs;
};
