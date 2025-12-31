import { useState } from 'react';
import { Target, CheckCircle, XCircle, ChevronDown, Trophy, Medal, Search, Building2 } from 'lucide-react';
import { Card } from '../ui/shim';
import { ALL_PROGRAMS } from '../../data/programs';

interface Props {
    simulatedStats: any;
    originalStats: any;
    targetDegree: string | null;
    setTargetDegree: (degree: string) => void;
}

const RadialWatch = ({
    score,
    threshold,
    label,
    size = 180,
    active = false
}: {
    score: number,
    threshold: number,
    label: string,
    size?: number,
    active?: boolean
}) => {
    const radius = size / 2 - 10;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min((score / threshold), 1.5); // Allow over-achievement visual
    const fillPercent = Math.min(progress, 1);
    const offset = circumference - (fillPercent * circumference);

    const isPassed = score >= threshold;
    const color = isPassed ? '#22c55e' : '#ef4444'; // Green or Red

    return (
        <div className="relative flex flex-col items-center justify-center p-4 transition-all duration-500">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background Track */}
                <svg className="transform -rotate-90 w-full h-full">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#f3f4f6"
                        strokeWidth="12"
                        fill="none"
                    />
                    {/* Progress Arc */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>

                {/* Inner Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">ציון נוכחי</span>
                    <span className={`text-4xl font-mono font-bold tracking-tighter ${isPassed ? 'text-gray-800' : 'text-gray-800'}`}>
                        {score.toFixed(0)}
                    </span>
                    <div className="w-12 h-0.5 bg-gray-100 my-2" />
                    <span className="text-xs font-medium text-gray-500">
                        יעד: <span className="font-bold text-gray-900">{threshold}</span>
                    </span>
                </div>

                {/* Status Icon Indicator */}
                <div className={`absolute top-0 right-0 p-2 rounded-full shadow-lg ${isPassed ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-500'}`}>
                    {isPassed ? <Trophy className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                </div>
            </div>

            <h3 className="mt-4 font-bold text-gray-900 text-center max-w-[200px] leading-tight">{label}</h3>
        </div>
    );
};

export const TargetsPanel = ({ simulatedStats, originalStats, targetDegree, setTargetDegree }: Props) => {
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Extract degrees
    const degrees = simulatedStats?.degrees || [];

    // Find selected or default to nothing (so user is forced to choose/search if not set)
    const selectedDegree = targetDegree
        ? degrees.find((d: any) => d.name === targetDegree)
        : null;

    // Helper to parse threshold
    const getThreshold = (desc: string) => {
        const match = desc.match(/\d+/);
        return match ? parseInt(match[0]) : 700; // Default fallback
    };

    const filteredDegrees = degrees.filter((d: any) =>
        (d?.name || '').includes(searchQuery) || (d?.university || '').includes(searchQuery)
    );

    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col relative overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-sm font-bold flex items-center gap-1.5 text-gray-800">
                    <Medal className="w-4 h-4 text-amber-500" />
                    {selectedDegree ? 'היעד שלי' : 'בחר יעד'}
                </h2>
                {selectedDegree && (
                    <button
                        onClick={() => { setIsSearching(true); setSearchQuery(''); }}
                        className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
                    >
                        שנה יעד
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative">

                {/* Search Overlay / Empty State */}
                {(!selectedDegree || isSearching) && (
                    <div className="absolute inset-0 z-20 bg-white flex flex-col">
                        <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="חפש תואר או מוסד..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pr-9 pl-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    autoFocus
                                />
                                {isSearching && selectedDegree && (
                                    <button
                                        onClick={() => setIsSearching(false)}
                                        className="absolute left-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                                    >
                                        ביטול
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filteredDegrees.map((deg: any, idx: number) => {
                                const prog = ALL_PROGRAMS.find(p => p?.program?.institution?.name === deg.university);
                                const logoUrl = prog?.program?.institution?.logo_url;
                                const hasError = imageErrors[`search-${idx}`];

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setTargetDegree(deg.name);
                                            setIsSearching(false);
                                        }}
                                        className="w-full text-right p-3 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full border border-gray-100 bg-white flex items-center justify-center overflow-hidden shrink-0">
                                                {logoUrl && !hasError ? (
                                                    <img
                                                        src={logoUrl}
                                                        alt={deg.university}
                                                        className="w-full h-full object-contain p-1"
                                                        onError={() => setImageErrors((prev: Record<string, boolean>) => ({ ...prev, [`search-${idx}`]: true }))}
                                                    />
                                                ) : (
                                                    <Building2 className="w-4 h-4 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 text-sm group-hover:text-blue-700">{deg.university}</div>
                                                <div className="text-xs text-gray-500">{deg.name}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-mono font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                            {getThreshold(deg.description)}
                                        </div>
                                    </button>
                                );
                            })}
                            {filteredDegrees.length === 0 && (
                                <div className="text-center py-8 text-gray-400 text-xs">
                                    לא נמצאו תוצאות ל"{searchQuery}"
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* The Main Watch (Featured Target) */}
                {selectedDegree && !isSearching && (
                    <>
                        <div className="bg-gradient-to-b from-white to-gray-50/30 border-b border-gray-100 pb-6 pt-2">
                            <RadialWatch
                                score={selectedDegree.sechem[0]?.score || 0}
                                threshold={getThreshold(selectedDegree.description)}
                                label={`${selectedDegree.university} - ${selectedDegree.name}`}
                                size={200}
                            />
                        </div>

                        {/* Compact List of Alternatives (Same Degree, Diff Unis) */}
                        <div className="p-3 space-y-2 bg-gray-50/50 min-h-full">
                            <label className="text-[10px] font-bold text-gray-400 px-1">אפשרויות נוספות</label>
                            {degrees
                                .filter((d: any) => d.name === selectedDegree.name && d.university !== selectedDegree.university) // Show same degree at other unis
                                .concat(degrees.slice(0, 3).filter((d: any) => d.name !== selectedDegree.name)) // Plus a few random recommendations
                                .slice(0, 5)
                                .map((deg: any, idx: number) => {
                                    const threshold = getThreshold(deg.description);
                                    const score = deg.sechem[0]?.score || 0;
                                    const isPassed = score >= threshold;

                                    const prog = ALL_PROGRAMS.find(p => p?.program?.institution?.name === deg.university);
                                    const logoUrl = prog?.program?.institution?.logo_url;
                                    const hasError = imageErrors[`alt-${idx}`];

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setTargetDegree(deg.name)}
                                            className="w-full text-right bg-white p-2.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-8 h-8 rounded-full border border-gray-100 bg-white flex items-center justify-center overflow-hidden shrink-0">
                                                    {logoUrl && !hasError ? (
                                                        <img
                                                            src={logoUrl}
                                                            alt={deg.university}
                                                            className="w-full h-full object-contain p-1"
                                                            onError={() => setImageErrors((prev: Record<string, boolean>) => ({ ...prev, [`alt-${idx}`]: true }))}
                                                        />
                                                    ) : (
                                                        <Building2 className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-gray-800 truncate group-hover:text-blue-700">
                                                        {deg.university}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 truncate">
                                                        {deg.name}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`text-[10px] font-bold shrink-0 ${isPassed ? 'text-green-600' : 'text-red-500'}`}>
                                                {isPassed ? 'מתקבל/ת' : 'לא מתקבל/ת'}
                                            </div>
                                        </button>
                                    );
                                })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
