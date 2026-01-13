import { useState, useMemo, useEffect } from 'react';
import { Layers, ChevronDown, ChevronUp, CheckCircle, XCircle, Trash2, ArrowLeft } from 'lucide-react';
import type { UserAdmissionStats } from '../utils/admission-evaluation';
import { cn } from '../lib/utils';
import { Button } from './ui/shim';
import { useTrackedDegrees } from '../context/TrackedDegreesContext';
import { admissionEngine } from '../services/admission-engine';
import { checkReachable } from '../utils/admission-evaluation';
import { useNavigate } from 'react-router-dom';

interface TrackedDegreesWidgetProps {
    className?: string;
    // We optionally accept userStats to perform realtime 'chance' calculation
    userStats?: UserAdmissionStats;
    // Optional preload programs to avoid re-fetching
    availablePrograms?: any[];
}

export const TrackedDegreesWidget = ({ className, userStats, availablePrograms }: TrackedDegreesWidgetProps) => {
    const navigate = useNavigate();
    const { trackedIds, removeTrack } = useTrackedDegrees();
    const [isExpanded, setIsExpanded] = useState(true);
    const [fetchedPrograms, setFetchedPrograms] = useState<any[]>([]);

    useEffect(() => {
        // If we don't have availablePrograms, we need to fetch
        if (!availablePrograms && trackedIds.length > 0 && fetchedPrograms.length === 0) {
            const load = async () => {
                const all = await admissionEngine.getAllProgramsFull();
                const mapped = all.map(p => admissionEngine.mapProgramToUI(p));
                setFetchedPrograms(mapped);
            };
            load();
        }
    }, [availablePrograms, trackedIds.length]);

    // Resolve tracked programs data
    const trackedItems = useMemo(() => {
        if (!trackedIds.length) return [];

        const sourceData = availablePrograms || fetchedPrograms;
        if (!sourceData.length) return [];

        return trackedIds.map(id => {
            const found = sourceData.find((p: any) => p.program.id === id);
            return found;
        }).filter(item => item !== undefined);
    }, [trackedIds, availablePrograms, fetchedPrograms]);

    if (!trackedIds.length) {
        return (
            <div className={cn("bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center", className)}>
                <div className="bg-gray-50 p-3 rounded-full mb-3">
                    <Layers className="w-6 h-6 text-gray-300" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">עדיין אין תארים במעקב</h3>
                <p className="text-xs text-gray-500 max-w-[180px]">
                    סמן תוכניות ב❤️ כדי לשמור אותן כאן ולראות סיכויי קבלה
                </p>
                <Button variant="link" size="sm" onClick={() => navigate('/programs')} className="text-indigo-600 text-xs mt-2">
                    חיפוש תארים
                </Button>
            </div>
        )
    }

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
                    <span className="font-bold text-gray-800 text-sm">תארים במעקב ({trackedIds.length})</span>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>

            {isExpanded && (
                <div className="border-t border-gray-100 divide-y divide-gray-50 flex-1 overflow-y-auto custom-scrollbar min-h-0 max-h-[400px]">
                    {trackedItems.map((item, idx) => {
                        const { program, admission } = item;

                        // Smart Logic
                        // Use loaded admission data if available, or try to fallback
                        const isReachable = userStats && admission ? checkReachable(userStats, admission) : null;

                        return (
                            <div key={idx} className="p-3 hover:bg-gray-50 transition-colors group relative">
                                <div className="flex justify-between items-start mb-1 pr-6">
                                    <div className="absolute right-2 top-3 cursor-pointer text-gray-300 hover:text-red-500" onClick={(e) => {
                                        e.stopPropagation();
                                        removeTrack(program.id);
                                    }}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </div>

                                    <h4
                                        className="text-xs font-bold text-gray-800 line-clamp-2 cursor-pointer hover:text-indigo-600 hover:underline decoration-indigo-200"
                                        onClick={() => navigate(`/program/${program.id}`)}
                                        title={program.name}
                                    >
                                        {program.name}
                                    </h4>

                                    {isReachable !== null && (
                                        <div className={cn("shrink-0", isReachable ? "text-green-500" : "text-orange-500")}>
                                            {isReachable ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2">
                                    <span className="truncate max-w-[120px]" title={program.institution?.name}>
                                        {program.institution?.name}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 px-1.5 text-[10px] text-indigo-600 hover:bg-indigo-50"
                                            onClick={() => navigate(`/program/${program.id}`)}
                                        >
                                            פרטים <ArrowLeft className="w-3 h-3 mr-1" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="p-2 border-t border-gray-50 bg-gray-50/50">
                <Button variant="ghost" size="sm" className="w-full text-xs text-gray-500 hover:text-indigo-600" onClick={() => navigate('/programs')}>
                    הוסף עוד תארים +
                </Button>
            </div>
        </div>
    );
};
