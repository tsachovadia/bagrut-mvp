import { Building2, Clock, CheckCircle2, AlertCircle, ExternalLink, GraduationCap, X, Send, Users } from 'lucide-react';
import type { Program, AdmissionRequirement } from '../types/admission';
import { checkReachable, getConditionStatuses, type UserAdmissionStats } from '../utils/admission-evaluation';
import { Button, Badge } from './ui/shim';
import { cn } from '../lib/utils';
import { useMemo, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ProgramSummaryPanelProps {
    program: Program | null;
    admission: AdmissionRequirement | null;
    userStats?: UserAdmissionStats;
    onClose?: () => void;
    className?: string;
}

export const ProgramSummaryPanel = ({ program, admission, userStats, onClose, className }: ProgramSummaryPanelProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Parse Threshold for display logic logic if needed, 
    // but we can trust the 'admission' object likely has logic rules.
    const thresholdDisplay = useMemo(() => {
        if (!admission) return "לא צוין";
        if (admission.logic_rules?.OR?.[0]) {
            // simplified extraction logic similar to calculation-bridge
            // Ideally we'd have a robust 'getThresholdDisplay' util
            return "ראה פירוט";
        }
        return "לא צוין";
    }, [admission]);

    const isReachable = (userStats && admission) ? checkReachable(userStats, admission) : null;

    // Fetch total community member count
    const [communitySize, setCommunitySize] = useState(0);
    useEffect(() => {
        supabase
            .from('bot_groups')
            .select('member_count')
            .eq('is_active', true)
            .then(({ data }) => {
                if (data) {
                    setCommunitySize(data.reduce((sum, g) => sum + ((g as any).member_count || 0), 0));
                }
            });
    }, []);

    // Evaluate which admission conditions the user meets/misses
    const conditionStatuses = useMemo(() => {
        return getConditionStatuses(userStats, admission);
    }, [userStats, admission]);

    const failingConditions = conditionStatuses.filter(c => !c.met);

    // Safety check
    if (!program || !admission) {
        return (
            <div className={cn("h-full flex flex-col items-center justify-center p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-100", className)}>
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <GraduationCap className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-700 mb-1">בחרו תואר</h3>
                <p className="text-sm">לחצו על תואר מהרשימה כדי לראות פרטים מלאים וסיכויי קבלה.</p>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden", className)}>

            {/* Header Image / Pattern */}
            <div className="h-24 bg-gradient-to-br from-indigo-50 to-blue-50 relative shrink-0">
                {program.institution?.logo_url && (
                    <div className="absolute -bottom-8 right-6 w-20 h-20 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                        <img
                            src={program.institution.logo_url}
                            alt={program.institution.name}
                            className="w-full h-full object-contain"
                        />
                    </div>
                )}
                {onClose && (
                    <button onClick={onClose} className="absolute top-2 left-2 p-2 bg-white/50 hover:bg-white rounded-full transition-colors lg:hidden">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                )}
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-10">

                {/* Titles */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            {program.faculty?.name}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{program.degree_type}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                        {program.name}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Building2 className="w-4 h-4" />
                        <span>{program.institution?.name}</span>
                    </div>
                </div>

                {/* Status Card + Missing Requirements */}
                {isReachable !== null && (
                    <div className={cn(
                        "mb-6 rounded-xl border overflow-hidden",
                        isReachable
                            ? "bg-green-50/50 border-green-100"
                            : "bg-orange-50/50 border-orange-100"
                    )}>
                        <div className="p-4 flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border shrink-0",
                                isReachable ? "bg-green-100 text-green-600 border-green-200" : "bg-orange-100 text-orange-600 border-orange-200"
                            )}>
                                {isReachable ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className={cn("font-bold", isReachable ? "text-green-700" : "text-orange-700")}>
                                    {isReachable ? "סיכויי קבלה גבוהים" : "סיכויי קבלה גבוליים"}
                                </div>
                                <div className="text-xs opacity-80 text-gray-700">
                                    בהתבסס על הנתונים שלך
                                </div>
                            </div>
                        </div>
                        {/* Show specific failing conditions */}
                        {failingConditions.length > 0 && (
                            <div className="px-4 pb-3 space-y-1.5">
                                <div className="text-[11px] font-bold text-orange-700/80 mb-1">תנאים שחסרים:</div>
                                {failingConditions.map((c, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs bg-white/60 rounded-lg px-2.5 py-1.5 border border-orange-100/50">
                                        <span className="text-gray-700 font-medium">{c.label}</span>
                                        <div className="flex items-center gap-2 text-[11px]">
                                            <span className="text-orange-600">שלך: {Math.round(c.actual)}</span>
                                            <span className="text-gray-400">|</span>
                                            <span className="text-gray-500">נדרש: {c.required}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Show met conditions when reachable */}
                        {isReachable && conditionStatuses.length > 0 && (
                            <div className="px-4 pb-3 space-y-1.5">
                                <div className="text-[11px] font-bold text-green-700/80 mb-1">תנאי קבלה:</div>
                                {conditionStatuses.map((c, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs bg-white/60 rounded-lg px-2.5 py-1.5 border border-green-100/50">
                                        <span className="text-gray-700 font-medium">{c.label}</span>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Info Grid — only show cards with actual data */}
                {(program.duration_years > 0 || thresholdDisplay !== "לא צוין") && (
                    <div className={cn("grid gap-3 mb-6", program.duration_years > 0 && thresholdDisplay !== "לא צוין" ? "grid-cols-2" : "grid-cols-1")}>
                        {program.duration_years > 0 && (
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase">משך הלימודים</span>
                                </div>
                                <div className="font-bold text-gray-900">{program.duration_years} שנים</div>
                            </div>
                        )}
                        {thresholdDisplay !== "לא צוין" && (
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase">סף משוער</span>
                                </div>
                                <div className="font-bold text-gray-900">{thresholdDisplay}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Description — only show if we have real data */}
                {program.description && (
                    <div className="space-y-3 mb-6">
                        <h3 className="font-bold text-gray-800">על התוכנית</h3>
                        <div className="relative">
                            <p className={cn(
                                "text-sm text-gray-600 leading-relaxed transition-all",
                                !isExpanded && "line-clamp-4"
                            )}>
                                {program.description}
                            </p>
                            {(!isExpanded && program.description.length > 200) && (
                                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
                            )}
                        </div>
                        {program.description.length > 200 && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-1"
                            >
                                {isExpanded ? 'קרא פחות' : 'קרא עוד'}
                            </button>
                        )}
                    </div>
                )}

                {/* Actions (Inline) */}
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                    <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200">
                        <CheckCircle2 className="w-4 h-4" />
                        הוסף למעקב
                    </Button>

                    <button
                        onClick={() => window.open(`https://t.me/MitlabtimBot?start=program_${program.id}`, '_blank')}
                        className="w-full inline-flex flex-col items-center gap-1 bg-gradient-to-l from-[#0088cc] to-[#00a8e8] text-white px-4 py-3 rounded-xl text-sm font-medium hover:from-[#006da3] hover:to-[#0088cc] transition-all shadow-md hover:shadow-lg"
                    >
                        <div className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            <span>חבר אותי לסטודנטים</span>
                        </div>
                        {communitySize > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] opacity-80">
                                <Users className="w-3 h-3" />
                                <span>{communitySize}+ כבר בקהילה</span>
                            </div>
                        )}
                    </button>

                    {(program.website_url || program.institution?.website_url) && (
                        <Button variant="outline" className="w-full gap-2 text-gray-600 border-gray-200 hover:bg-gray-50" onClick={() => window.open(program.website_url || program.institution?.website_url, '_blank')}>
                            <ExternalLink className="w-4 h-4" />
                            {program.website_url ? 'לעמוד התוכנית' : 'לאתר המוסד'}
                        </Button>
                    )}
                </div>

            </div>
            {/* Removed Footer Actions specific div as it's moved up */}
        </div>
    );
};
