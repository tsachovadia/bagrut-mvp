
import { RotateCcw, Sparkles, TrendingUp, TrendingDown, Activity } from 'lucide-react';
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

const SliderKnob = ({
    label,
    value,
    min,
    max,
    onChange,
    color = "blue"
}: {
    label: string,
    value: number,
    min: number,
    max: number,
    onChange: (val: number) => void,
    color?: "blue" | "purple" | "indigo"
}) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="relative pt-4 pb-2 group">
            <div className="flex justify-between items-end mb-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
                <div className={`text-xs font-mono font-bold ${color === 'blue' ? 'text-blue-500' :
                    color === 'purple' ? 'text-purple-400' : 'text-indigo-400'
                    }`}>
                    {value}
                </div>
            </div>
            <div className="relative h-2 w-full rounded-full bg-white/10 touch-none">
                <div
                    className={`absolute top-0 right-0 h-full rounded-full opacity-50 ${color === 'blue' ? 'bg-blue-500' :
                        color === 'purple' ? 'bg-purple-500' : 'bg-indigo-500'
                        }`}
                    style={{ width: `${percentage}%` }}
                />

                {/* Thumb */}
                <div
                    className={`absolute top-1/2 -mt-2 h-4 w-4 rounded-full border-2 border-white shadow-sm transition-transform group-active:scale-110 pointer-events-none z-10 ${color === 'blue' ? 'bg-blue-600' :
                        color === 'purple' ? 'bg-purple-600' : 'bg-indigo-600'
                        }`}
                    style={{ right: `calc(${percentage}% - 8px)` }}
                />

                {/* Input - Large Hit Area */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className={`absolute -top-3 w-full h-8 opacity-0 cursor-ew-resize z-20`}
                />
            </div>
        </div>
    );
};

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
        <div className="bg-[#1e1e24] text-white rounded-2xl shadow-xl h-full flex flex-col relative overflow-hidden border border-gray-800/50">
            {/* The "Speaker" / Display Area */}
            <div className="bg-gradient-to-b from-[#2a2a35] to-[#1e1e24] p-4 border-b border-gray-800 shrink-0 z-30 relative">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold uppercase tracking-widest">Simulation</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onReset} className="text-gray-500 hover:text-white h-6 px-2 text-[10px] uppercase tracking-wider bg-white/5 hover:bg-white/10 rounded-full border border-white/5">
                        <RotateCcw className="w-3 h-3 ml-1.5" />
                        איפוס
                    </Button>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-3xl font-mono font-bold text-white tracking-tighter flex items-center gap-2">
                            {(simulatedStats?.degrees?.[0]?.sechem?.[0]?.score || 0).toFixed(0)}
                            <span className="text-sm font-normal text-gray-500 mb-1">נוכחי</span>
                        </div>
                    </div>

                    {delta !== 0 && (
                        <div className={`flex flex-col items-end ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            <div className="flex items-center gap-1 text-2xl font-bold font-mono">
                                {delta > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                {delta > 0 ? '+' : ''}{delta.toFixed(0)}
                            </div>
                            <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">השפעה</div>
                        </div>
                    )}
                </div>
            </div>

            {/* The "Knobs" / Controls Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative z-20">
                <div className="space-y-6">

                    {/* Psychometric Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">פסיכומטרי</h3>
                        </div>

                        {/* Grid Layout for Psycho - Transparent Background */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                            <div className="col-span-2">
                                <SliderKnob
                                    label="ציון כללי"
                                    value={psychometric.general}
                                    min={200} max={800}
                                    onChange={(v) => onPsychometricChange('general', v)}
                                    color="purple"
                                />
                            </div>
                            <SliderKnob label="כמותי" value={psychometric.quantitative} min={50} max={150} onChange={(v) => onPsychometricChange('quantitative', v)} color="indigo" />
                            <SliderKnob label="מילולי" value={psychometric.verbal} min={50} max={150} onChange={(v) => onPsychometricChange('verbal', v)} color="indigo" />
                            <SliderKnob label="אנגלית" value={psychometric.english} min={50} max={150} onChange={(v) => onPsychometricChange('english', v)} color="indigo" />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/5 mx-2" />

                    {/* Bagrut Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">מקצועות בגרות</h3>
                        </div>

                        {/* Grid Layout for Bagrut - 3 Columns on larger screens, 2 on smaller */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                            {bagrut.map((subject, index) => (
                                <div key={index} className="bg-white/5 rounded-xl p-3 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-start mb-2 h-8">
                                        <span className="text-xs font-medium text-gray-200 line-clamp-2 leading-tight max-w-[70%]">{subject.subject}</span>
                                        <select
                                            value={subject.units}
                                            onChange={(e) => onBagrutChange(index, 'units', Number(e.target.value))}
                                            className="bg-black/20 text-gray-300 text-[10px] rounded px-1.5 py-0.5 border border-white/10 outline-none focus:border-blue-500 cursor-pointer"
                                        >
                                            {[1, 2, 3, 4, 5].map(u => <option key={u} value={u}>{u} יח"ל</option>)}
                                        </select>
                                    </div>

                                    <SliderKnob
                                        label=""
                                        value={subject.grade}
                                        min={0} max={100}
                                        onChange={(v) => onBagrutChange(index, 'grade', v)}
                                        color="blue"
                                    />

                                    <div className="flex justify-end mt-1">
                                        <span className="text-[9px] text-gray-500 font-mono">
                                            בונוס: <span className="text-blue-400">+{calculateBonus(subject.subject, subject.units, subject.grade)}</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Overlay Gradient at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#1e1e24] to-transparent pointer-events-none z-30" />
        </div>
    );
};
