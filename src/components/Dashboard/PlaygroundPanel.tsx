
import { RotateCcw, Sparkles, TrendingUp } from 'lucide-react';
import type { SubjectGrade, PsychometricScores } from '../../utils/calculator';
import { calculateBonus } from '../../utils/bonuses';
import { Button } from '../ui/shim';

interface Props {
    bagrut: SubjectGrade[];
    psychometric: PsychometricScores;
    onBagrutChange: (index: number, field: 'grade' | 'units', value: number) => void;
    onPsychometricChange: (field: keyof PsychometricScores, value: number) => void;
    onReset: () => void;
    originalStats: any;
    simulatedStats: any;
}

export const PlaygroundPanel = ({
    bagrut,
    psychometric,
    onBagrutChange,
    onPsychometricChange,
    onReset,
    originalStats,
    simulatedStats
}: Props) => {

    const getSechemDelta = () => {
        if (!originalStats || !simulatedStats) return 0;
        const org = originalStats.degrees[0]?.sechem[0]?.score || 0;
        const sim = simulatedStats.degrees[0]?.sechem[0]?.score || 0;
        return sim - org;
    };
    const delta = getSechemDelta();

    return (
        <div className="bg-white rounded-3xl border border-blue-200 shadow-xl shadow-blue-500/5 h-full flex flex-col relative overflow-hidden ring-4 ring-blue-50/50">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-blue-700">
                        <Sparkles className="w-5 h-5 text-blue-500 fill-blue-500" />
                        מגרש המשחקים
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">שפר ציונים וראה את ההשפעה בזמן אמת</p>
                </div>
                <div className="flex items-center gap-3">
                    {delta !== 0 && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold animate-in fade-in slide-in-from-top-2 ${delta > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <TrendingUp className="w-4 h-4" />
                            {delta > 0 ? '+' : ''}{delta.toFixed(0)} נק'
                        </div>
                    )}
                    <Button variant="ghost" size="sm" onClick={onReset} className="text-gray-400 hover:text-gray-600">
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

                {/* Psychometric Section */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs">1</span>
                        פסיכומטרי יעדים
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'כללי', key: 'general', min: 200, max: 800 },
                            { label: 'כמותי', key: 'quantitative', min: 50, max: 150 },
                            { label: 'מילולי', key: 'verbal', min: 50, max: 150 },
                            { label: 'אנגלית', key: 'english', min: 50, max: 150 },
                        ].map((field) => (
                            <div key={field.key}>
                                <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block tracking-wider">{field.label}</label>
                                <input
                                    type="number"
                                    value={psychometric[field.key as keyof PsychometricScores]}
                                    onChange={(e) => onPsychometricChange(field.key as keyof PsychometricScores, Number(e.target.value))}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-center font-mono font-bold text-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                    min={field.min} max={field.max}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bagrut Section */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">2</span>
                        שיפורי בגרות
                    </h3>
                    <div className="space-y-3">
                        {bagrut.map((subject, index) => (
                            <div key={index} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">{subject.subject}</div>
                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                        <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-[10px]">
                                            +{calculateBonus(subject.subject, subject.units, subject.grade)} בונוס
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-20">
                                        <label className="text-[10px] text-gray-400 block mb-0.5 text-center">יח"ל</label>
                                        <select
                                            value={subject.units}
                                            onChange={(e) => onBagrutChange(index, 'units', Number(e.target.value))}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg text-sm py-1 px-1 focus:outline-none focus:border-blue-500 text-center font-medium"
                                        >
                                            {[1, 2, 3, 4, 5].map(u => (
                                                <option key={u} value={u}>{u}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="w-20">
                                        <label className="text-[10px] text-gray-400 block mb-0.5 text-center">ציון</label>
                                        <input
                                            type="number"
                                            value={subject.grade}
                                            onChange={(e) => onBagrutChange(index, 'grade', Number(e.target.value))}
                                            className={`w-full border rounded-lg text-sm py-1 px-1 focus:outline-none text-center font-bold ${subject.grade > 90 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200'}`}
                                            min="0" max="100"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
