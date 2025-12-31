import React, { useMemo, useState } from 'react';
import { Calculator, Scale, Info, GraduationCap, School } from 'lucide-react';
import {
    calculateDryAverage,
    calculateOptimalAverage,
    type SubjectGrade
} from '../utils/calculator';
import { type Sector } from '../utils/subjects';
import { cn } from '../lib/utils';

interface AverageDisplayProps {
    grades: SubjectGrade[];
    sector: Sector;
    className?: string; // Standard prop for component flexibility
}

type TabType = 'general' | 'technion' | 'tau' | 'bgu';

export const AverageDisplay: React.FC<AverageDisplayProps> = ({ grades, sector, className }) => {
    const [activeTab, setActiveTab] = useState<TabType>('general');

    const averages = useMemo(() => {
        const dry = calculateDryAverage(grades);

        const generalOptimal = calculateOptimalAverage(grades, sector, 'general');
        const technionOptimal = calculateOptimalAverage(grades, sector, 'הטכניון');
        const tauOptimal = calculateOptimalAverage(grades, sector, 'אונ׳ תל אביב');
        const bguOptimal = calculateOptimalAverage(grades, sector, 'אונ׳ בן גוריון');

        return {
            dry,
            general: generalOptimal,
            technion: technionOptimal,
            tau: tauOptimal,
            bgu: bguOptimal
        };
    }, [grades, sector]);

    const currentOptimal = averages[activeTab];

    // Helper to format average
    const formatAvg = (num: number) => num.toFixed(2);

    const tabs = [
        { id: 'general', label: 'כללי (מיטבי)', icon: Scale },
        { id: 'technion', label: 'טכניון', icon: GraduationCap },
        { id: 'tau', label: 'תל אביב', icon: School },
        { id: 'bgu', label: 'בן גוריון', icon: School },
    ] as const;

    return (
        <div className={cn("bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4", className)}>
            {/* Header / Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 p-1 gap-1 overflow-x-auto">
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center",
                                isActive
                                    ? "bg-white text-blue-600 shadow-sm border border-slate-200/60"
                                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            )}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Main Content */}
            <div className="p-5 text-center">
                <div className="mb-2 text-slate-500 text-sm font-medium">
                    {activeTab === 'general' ? 'ממוצע בגרות מיטבי (משוער)' : `ממוצע מותאם ל${tabs.find(t => t.id === activeTab)?.label}`}
                </div>

                <div className="flex items-baseline justify-center gap-2 dir-ltr">
                    <span className="text-4xl font-black text-slate-900 tracking-tight">
                        {formatAvg(currentOptimal.average)}
                    </span>
                    <span className="text-slate-400 text-lg font-light">
                        / {activeTab === 'general' ? '120' : '130'}
                    </span>
                </div>

                {/* Sub-stats row */}
                <div className="grid grid-cols-2 gap-4 mt-6 border-t border-slate-100 pt-4">
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">ממוצע יבש</span>
                        <span className="text-slate-700 font-mono font-medium text-lg">
                            {formatAvg(averages.dry)}
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">יחידות שנחשבו</span>
                        <span className="text-slate-700 font-mono font-medium text-lg">
                            {currentOptimal.subjects_used.reduce((acc, s) => acc + s.units, 0)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Dropped Subjects Info (Collapsible or small text) */}
            {currentOptimal.subjects_dropped.length > 0 && (
                <div className="bg-amber-50/50 border-t border-amber-100/50 p-3 text-center">
                    <p className="text-xs text-amber-700/80">
                        <Info size={12} className="inline-block relative -top-0.5 ml-1" />
                        הושמטו בחישוב המיטבי: {currentOptimal.subjects_dropped.map(s => s.subject).join(', ')}
                    </p>
                </div>
            )}
        </div>
    );
};
