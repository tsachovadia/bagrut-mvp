import { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import type { UserAdmissionStats } from '../utils/admission-evaluation';
import { cn } from '../lib/utils';
import { Button } from './ui/shim';

interface TrackedDegreesWidgetProps {
    trackedDegrees: any[];
    className?: string;
    // Callback to remove degree - placeholder for now
    onRemove?: (degreeName: string, institution: string) => void;
}

export const TrackedDegreesWidget = ({ trackedDegrees, className, onRemove }: TrackedDegreesWidgetProps) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!trackedDegrees || trackedDegrees.length === 0) return null;

    return (
        <div className={cn("bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all", className)}>
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors shrink-0"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
                        <Layers className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-gray-800 text-sm">תארים במעקב ({trackedDegrees.length})</span>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>

            {isExpanded && (
                <div className="border-t border-gray-100 divide-y divide-gray-50 flex-1 overflow-y-auto custom-scrollbar min-h-0">
                    {trackedDegrees.map((deg, idx) => {
                        // Logic to parse threshold from description string if needed, or use existing data
                        // Assuming deg has 'sechem' and 'description' or similar
                        // Since 'userStats.degrees' structure matches simulatedStats in TargetsPanel
                        const score = deg.sechem?.[0]?.score || 0;
                        const thresholdMatch = deg.description?.match(/\d+/);
                        const threshold = thresholdMatch ? parseInt(thresholdMatch[0]) : 0;
                        const isPassed = score >= threshold;

                        return (
                            <div key={idx} className="p-3 hover:bg-gray-50 transition-colors group">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-xs font-bold text-gray-800 line-clamp-1" title={deg.name}>
                                        {deg.name}
                                    </h4>
                                    <div className={cn("shrink-0", isPassed ? "text-green-500" : "text-red-500")}>
                                        {isPassed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-gray-500">
                                    <span className="truncate max-w-[120px]" title={deg.university}>{deg.university}</span>
                                    <div className="flex gap-2">
                                        <span>צפי: <span className="font-mono font-medium">{threshold}</span></span>
                                        <span>שלי: <span className={cn("font-mono font-bold", isPassed ? "text-green-600" : "text-red-600")}>{score.toFixed(0)}</span></span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
