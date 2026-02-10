import React, { useMemo, useState } from 'react';
import { Calculator, Scale, Info, GraduationCap, School, ChevronDown } from 'lucide-react';
import {
    calculateDryAverage,
    calculateOptimalAverage,
    type SubjectGrade,
    type DroppedSubject
} from '../utils/calculator';
import { type Sector } from '../utils/subjects';
import { cn } from '../lib/utils';
import { calculateUniversityBonuses } from '../utils/bonuses';
import { BonusBreakdown } from './Dashboard/BonusBreakdown';
import { BugReportWidget } from './BugReportWidget';

interface AverageDisplayProps {
    grades: SubjectGrade[];
    sector: Sector;
    className?: string; // Standard prop for component flexibility
}

type TabType = 'general' | 'technion' | 'tau' | 'bgu';

export const AverageDisplay: React.FC<AverageDisplayProps> = ({ grades, sector, className }) => {
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [isExpanded, setIsExpanded] = useState(false);

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

    const bonuses = useMemo(() => calculateUniversityBonuses(grades), [grades]);

    const currentOptimal = averages[activeTab];

    // Helper to format average
    const formatAvg = (num: number) => num.toFixed(2);

    const tabs = [
        { id: 'general', label: 'כללי (מיטבי)', icon: Scale },
        { id: 'technion', label: 'טכניון', icon: GraduationCap },
        { id: 'tau', label: 'תל אביב', icon: School },
        { id: 'bgu', label: 'בן גוריון', icon: School },
    ] as const;

    // Empty State
    if (currentOptimal.average === 0) {
        return (
            <div className={cn("bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4 p-6 text-center space-y-3", className)}>
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <Calculator className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                    <h3 className="text-slate-900 font-bold text-sm">מחשבון ממוצעים</h3>
                    <p className="text-slate-500 text-xs mt-1">
                        הזינו את ציוני הבגרות כדי לראות את הממוצע המיטבי והמותאם לכל מוסד.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8 relative z-10", className)}>
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
            <div className="p-4 text-center">
                <div className="mb-1 text-slate-500 text-xs font-medium">
                    {activeTab === 'general' ? 'ממוצע בגרות מיטבי (משוער)' : `ממוצע מותאם ל${tabs.find(t => t.id === activeTab)?.label}`}
                </div>

                <div className="flex items-baseline justify-center gap-1.5 dir-ltr">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {formatAvg(currentOptimal.average)}
                    </span>
                    <span className="text-slate-400 text-base font-light">
                        / {activeTab === 'general' ? '120' : '130'}
                    </span>
                </div>

                {/* Sub-stats row */}
                <div className="grid grid-cols-2 gap-3 mt-4 border-t border-slate-100 pt-3">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">ממוצע יבש</span>
                        <span className="text-slate-700 font-mono font-medium text-base">
                            {formatAvg(averages.dry)}
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">יחידות שנחשבו</span>
                        <span className="text-slate-700 font-mono font-medium text-base">
                            {currentOptimal.subjects_used.reduce((acc, s) => acc + s.units, 0)}
                        </span>
                    </div>
                </div>
                {/* Bonus Breakdown */}
                {activeTab === 'general' && (
                    <div className="mt-4 border-t border-slate-100 pt-2">
                        <BonusBreakdown bonuses={bonuses} />
                    </div>
                )}
            </div>

            {/* Dropped Subjects Info (Collapsible) */}
            {
                (currentOptimal.subjects_dropped as DroppedSubject[]).length > 0 && (
                    <div className="bg-slate-50 border-t border-slate-100 transition-colors hover:bg-slate-100/50">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full p-3 flex items-center justify-between text-xs text-slate-500"
                        >
                            <span className="flex items-center gap-2">
                                <Info size={14} className="text-amber-500" />
                                <span>
                                    {currentOptimal.subjects_dropped.length} מקצועות הושמטו לטובת הממוצע
                                    {!isExpanded && <span className="text-slate-400 mr-1 font-light">(לחץ לפירוט)</span>}
                                </span>
                            </span>
                            <ChevronDown size={14} className={cn("transition-transform duration-300 text-slate-400", isExpanded && "rotate-180")} />
                        </button>

                        {isExpanded && (
                            <div className="px-3 pb-3 space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                {(currentOptimal.subjects_dropped as DroppedSubject[]).map((s) => (
                                    <div key={s.id} className="text-[11px] bg-white border border-slate-200 rounded-lg p-2.5 flex items-start gap-3 shadow-sm">
                                        <div className="font-bold text-slate-700 whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                            {s.subject}
                                        </div>
                                        <div className="text-slate-500 leading-snug">
                                            {s.reasonDescription || 'הושמט לשיפור הממוצע'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }
            {/* Feedback Widget moved inside */}
            <div className="border-t border-slate-100 p-4 bg-slate-50/30">
                <BugReportWidget />
            </div>
        </div >
    );
};
