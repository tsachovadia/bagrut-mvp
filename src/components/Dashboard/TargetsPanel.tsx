
import { Target, CheckCircle, XCircle, Search } from 'lucide-react';
import { Card } from '../ui/shim';

interface Props {
    simulatedStats: any;
    originalStats: any;
    targetDegree: string | null;
    setTargetDegree: (degree: string) => void;
}

export const TargetsPanel = ({ simulatedStats, originalStats, targetDegree, setTargetDegree }: Props) => {
    // For MVP, we'll extract all available degrees from the stats to use as options
    // In a real app, this would come from a comprehensive DB or the user's "followed" list
    const availableDegrees = simulatedStats?.degrees?.map((d: any) => d.name) || [];
    const uniqueDegrees = Array.from(new Set(availableDegrees));

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-3xl">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <Target className="w-5 h-5 text-red-500" />
                    יעדי קבלה
                </h2>
                <p className="text-xs text-gray-500 mt-1">האם אני מתקבל עם השיפורים?</p>
            </div>

            <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                <div className="relative">
                    <Search className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="חפש תואר (למשל: מדעי המחשב)"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    // For MVP mock, we won't implement full search yet, just simulation rendering
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {/* 
                   For the MVP Demo, we will list the degrees returned by the calculator.
                   In reality, calculateAdmissionStats returns results per university for a *generic* flow 
                   or specific degree if filtered.
                   Here, the Logic in calculation-bridge seems to map degrees[] from degrees.ts file.
                */}

                {simulatedStats?.degrees?.map((simDegree: any, index: number) => {
                    const originalDegree = originalStats?.degrees?.find((d: any) => d.university === simDegree.university && d.name === simDegree.name);
                    const originalScore = originalDegree?.sechem[0]?.score || 0;
                    const simScore = simDegree?.sechem[0]?.score || 0;
                    const threshold = parseInt(simDegree.description.replace('סף: ', '')); // Extract threshold from string 😅

                    const isPassed = simScore >= threshold;
                    const wasPassed = originalScore >= threshold;
                    const statusChanged = !wasPassed && isPassed;

                    return (
                        <div key={index} className={`p-4 rounded-2xl border transition-all duration-300 ${statusChanged ? 'bg-green-50 border-green-300 shadow-green-100 shadow-lg scale-[1.02]' : isPassed ? 'bg-white border-green-100' : 'bg-white border-red-50 opacity-80'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{simDegree.university}</h4>
                                    <p className="text-xs text-gray-500">{simDegree.sechem[0]?.name || 'תואר כללי'}</p>
                                </div>
                                {statusChanged ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 animate-bounce" />
                                ) : isPassed ? (
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-300" />
                                )}
                            </div>

                            <div className="mt-3 flex items-end justify-between">
                                <div>
                                    <div className="text-[10px] text-gray-400">סף קבלה</div>
                                    <div className="text-sm font-bold text-gray-700">{threshold}</div>
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] text-gray-400">הסכם שלך (סימולציה)</div>
                                    <div className={`text-xl font-bold ${isPassed ? 'text-green-600' : 'text-red-500'}`}>
                                        {simScore.toFixed(0)}
                                    </div>
                                </div>
                            </div>

                            {/* Delta Bar */}
                            <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${isPassed ? 'bg-green-500' : 'bg-red-400'}`}
                                    style={{ width: `${Math.min((simScore / threshold) * 80, 100)}%` }} // Visual approximation
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
