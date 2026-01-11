import { useState, useMemo } from 'react';
import { useProgramFilters } from '../../hooks/useProgramFilters';
import { SmartPreferencesStep } from '../Wizard/SmartPreferencesStep';
import { CheckCircle, XCircle, Search, Building2, SlidersHorizontal, ArrowRight, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Layers, GraduationCap } from 'lucide-react';
import { ALL_PROGRAMS } from '../../data/programs';

interface Props {
    simulatedStats: any;
    originalStats: any;
    targetDegree: string | null;
    setTargetDegree: (degree: string) => void;
    allSimulationsStats: any[];
    preferences?: { fields: string[]; institutions: string[]; isUndecided: boolean; };
    onPreferencesUpdate?: (prefs: { fields: string[]; institutions: string[]; isUndecided: boolean }) => void;
}

export const TargetsPanel = ({ simulatedStats, targetDegree, setTargetDegree, preferences, onPreferencesUpdate }: Props) => {

    // --- State ---
    const [isExpanded, setIsExpanded] = useState(true);
    const [groupBy, setGroupBy] = useState<'university' | 'field'>('university');
    const [isEditingPrefs, setIsEditingPrefs] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const [searchQuery, setSearchQuery] = useState('');

    // --- Data Processing ---
    const degrees = simulatedStats?.degrees || [];

    // 1. Filter Logic (Consolidated via Hook)
    const filteredDegrees = useProgramFilters(degrees, {
        fields: preferences?.fields || [],
        institutionIds: preferences?.institutions || [],
        isUndecided: preferences?.isUndecided || false,
        searchQuery
    }, {
        getField: (d: any) => d.name,
        getInstitutionId: (d: any) => d.institutionId, // Added in calculation-bridge
        getInstitutionName: (d: any) => d.university
    });

    // 2. Grouping Logic
    const groupedDegrees = useMemo(() => {
        const groups: Record<string, any[]> = {};

        filteredDegrees.forEach((d: any) => {
            let key = '';
            if (groupBy === 'university') {
                key = d.university || 'אחר';
            } else {
                // Try to resolve generic field name or faculty
                // For now, we use the degree name as the "Field" key since names are normalized (e.g. "מדעי המחשב")
                key = d.name || 'אחר';
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(d);
        });

        return groups;
    }, [filteredDegrees, groupBy]);

    // Helper: Toggle Group
    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    // Helper: Parse Threshold
    const getThreshold = (desc: string) => {
        const match = desc.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    };

    // Helper: Determine Group Icon
    const getGroupIcon = (groupName: string) => {
        if (groupBy === 'university') {
            // Try to find logo
            const prog = ALL_PROGRAMS.find(p => p?.program?.institution?.name === groupName);
            return prog?.program?.institution?.logo_url || null;
        }
        return null; // For fields, we might use generic icons later
    };

    // --- Render ---

    // 1. Edit Preferences Mode (Expanded Panel)
    if (isEditingPrefs && preferences && onPreferencesUpdate) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col w-full lg:w-[500px] transition-all duration-300 relative z-30">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="font-bold text-gray-800">עריכת העדפות</h2>
                    <button onClick={() => setIsEditingPrefs(false)} className="text-gray-500 hover:text-gray-700">
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <SmartPreferencesStep
                        preferences={preferences}
                        onUpdate={onPreferencesUpdate}
                    />
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setIsEditingPrefs(false)}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-all"
                        >
                            שמור וסגור
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Sidebar Mode
    return (
        <div
            className={`
                bg-white border text-right shadow-sm flex flex-col transition-all duration-300 ease-in-out h-full rounded-2xl overflow-hidden
                ${isExpanded ? 'w-80 border-gray-100' : 'w-16 border-transparent bg-transparent shadow-none'}
            `}
        >
            {/* Header */}
            <div className={`p-4 border-b border-gray-50 flex items-center bg-white ${isExpanded ? 'justify-between' : 'justify-center flex-col gap-4'}`}>
                {isExpanded ? (
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
                            <Layers className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-gray-800 text-sm">תארים במעקב</span>
                    </div>
                ) : (
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-2" title="תארים במעקב">
                        <Layers className="w-5 h-5 text-indigo-600" />
                    </div>
                )}

                <div className="flex items-center gap-1">
                    {/* Only show 'Edit' in expanded mode for now */}
                    {isExpanded && (
                        <button
                            onClick={() => setIsEditingPrefs(true)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="ערוך העדפות"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors ${!isExpanded && 'bg-white shadow-sm border border-gray-100'}`}
                    >
                        {isExpanded ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Content (Only Visible When Expanded) */}
            {isExpanded && (
                <>
                    {/* Controls & Search */}
                    <div className="p-3 bg-gray-50/30 space-y-3 border-b border-gray-50">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="סינון מהיר..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg py-1.5 pr-8 pl-3 text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>

                        {/* Group By Toggle */}
                        <div className="flex p-0.5 bg-gray-100 rounded-lg">
                            <button
                                onClick={() => setGroupBy('university')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold rounded-md transition-all ${groupBy === 'university' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Building2 className="w-3 h-3" />
                                לפי מוסד
                            </button>
                            <button
                                onClick={() => setGroupBy('field')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold rounded-md transition-all ${groupBy === 'field' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <GraduationCap className="w-3 h-3" />
                                לפי תחום
                            </button>
                        </div>
                    </div>

                    {/* Groups List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-3">
                        {Object.entries(groupedDegrees).map(([groupName, groupItems]) => {
                            const isGroupExpanded = expandedGroups[groupName] ?? true; // Default expanded
                            const logoUrl = getGroupIcon(groupName);

                            return (
                                <div key={groupName} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                                    {/* Group Header */}
                                    <button
                                        onClick={() => toggleGroup(groupName)}
                                        className="w-full flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            {logoUrl ? (
                                                <div className="w-5 h-5 bg-white rounded-full border border-gray-100 p-0.5 flex items-center justify-center">
                                                    <img src={logoUrl} alt={groupName} className="w-full h-full object-contain" />
                                                </div>
                                            ) : (
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                            )}
                                            <span className="text-xs font-bold text-gray-800">{groupName}</span>
                                            <span className="text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded-full border border-gray-100">
                                                {groupItems.length}
                                            </span>
                                        </div>
                                        {isGroupExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                                    </button>

                                    {/* Items */}
                                    {isGroupExpanded && (
                                        <div className="divide-y divide-gray-50">
                                            {groupItems.map((deg: any, idx: number) => {
                                                const threshold = getThreshold(deg.description);
                                                const score = deg.sechem[0]?.score || 0;
                                                const isPassed = score >= threshold;
                                                const isSelected = deg.name === targetDegree && (groupBy === 'field' ? deg.university : deg.name); // Simple match check

                                                return (
                                                    <button
                                                        key={`${groupName}-${idx}`}
                                                        onClick={() => setTargetDegree(deg.name)}
                                                        className={`w-full text-right p-3 hover:bg-indigo-50/30 transition-all flex items-center justify-between group ${isSelected ? 'bg-indigo-50/50' : ''}`}
                                                    >
                                                        <div className="min-w-0 flex-1 ml-2">
                                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                                <span className="text-xs font-medium text-gray-700 truncate block group-hover:text-indigo-700 transition-colors">
                                                                    {groupBy === 'university' ? deg.name : deg.university}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                                <span>צפי: <span className="font-mono font-bold text-gray-600">{threshold}</span></span>
                                                                <span className="text-gray-300">|</span>
                                                                <span>שלי: <span className={`font-mono font-bold ${isPassed ? 'text-green-600' : 'text-red-500'}`}>{score.toFixed(0)}</span></span>
                                                            </div>
                                                        </div>

                                                        {/* Status Icon */}
                                                        <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isPassed ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                                            {isPassed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {Object.keys(groupedDegrees).length === 0 && (
                            <div className="text-center py-10 px-4">
                                <div className="bg-gray-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                    <Search className="w-5 h-5 text-gray-300" />
                                </div>
                                <p className="text-xs text-gray-500">לא נמצאו תארים התואמים את הסינון</p>
                                <button
                                    onClick={() => setIsEditingPrefs(true)}
                                    className="text-[10px] text-indigo-600 font-bold mt-2 hover:underline"
                                >
                                    שנה העדפות
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
