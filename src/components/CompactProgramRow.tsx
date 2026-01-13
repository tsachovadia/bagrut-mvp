import { useState } from 'react';
import { Building2, CheckCircle2, AlertCircle, ChevronLeft, Heart } from 'lucide-react';
import type { Program, AdmissionRequirement } from '../types/admission';
import { checkReachable, type UserAdmissionStats } from '../utils/admission-evaluation';
import { useTrackedDegrees } from '../context/TrackedDegreesContext';
import { cn } from '../lib/utils';

interface CompactProgramRowProps {
    program: Program;
    admission: AdmissionRequirement;
    userStats?: UserAdmissionStats;
    isSelected?: boolean;
    onClick?: () => void;
}

export const CompactProgramRow: React.FC<CompactProgramRowProps> = ({
    program,
    admission,
    userStats,
    isSelected,
    onClick
}) => {
    const [imageError, setImageError] = useState(false);
    const { isTracked, toggleTrack } = useTrackedDegrees();
    const isHearted = isTracked(program.id);

    // Calculate reachability
    const isReachable = userStats ? checkReachable(userStats, admission) : null;

    // Logo handling
    const logoUrl = program.institution?.logo_url;

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative flex items-center gap-3 p-2 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-xs",
                isSelected
                    ? "bg-indigo-50/60 border-indigo-200 shadow-sm"
                    : "bg-white border-transparent hover:bg-gray-50 border-gray-50 hover:border-gray-100"
            )}
        >
            {/* 1. Logo */}
            <div className="shrink-0 w-8 h-8 rounded-full border border-gray-100 bg-white shadow-sm flex items-center justify-center overflow-hidden">
                {logoUrl && !imageError ? (
                    <img
                        src={logoUrl}
                        alt={program.institution?.name}
                        className="w-full h-full object-contain p-1"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <Building2 className="w-4 h-4 text-gray-400" />
                )}
            </div>

            {/* 2. Main Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                    <h3 className={cn(
                        "text-sm font-bold truncate transition-colors",
                        isSelected ? "text-indigo-700" : "text-gray-900 group-hover:text-indigo-600"
                    )}>
                        {program.name}
                    </h3>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span className="truncate max-w-[120px]">{program.faculty?.name}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>{program.degree_type}</span>
                </div>
            </div>

            {/* 3. Duration & Status (Right Side) */}
            <div className="shrink-0 flex items-center gap-3">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleTrack(program.id);
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <Heart
                        className={cn("w-4 h-4 transition-all", isHearted ? "fill-red-500 text-red-500" : "text-gray-400")}
                    />
                </button>

                <span className="hidden sm:inline-block text-[10px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded">
                    {program.duration_years} שנים
                </span>

                {isReachable !== null && (
                    <div className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
                        isReachable
                            ? "bg-green-50 text-green-600 border-green-100"
                            : "bg-orange-50 text-orange-600 border-orange-100"
                    )}>
                        {isReachable ? (
                            <CheckCircle2 className="w-3 h-3" />
                        ) : (
                            <AlertCircle className="w-3 h-3" />
                        )}
                        <span className="hidden md:inline">{isReachable ? 'קבלה' : 'גבולי'}</span>
                    </div>
                )}

                <ChevronLeft className={cn(
                    "w-4 h-4 text-gray-300 transition-transform duration-200",
                    isSelected ? "text-indigo-400 -translate-x-1" : "opacity-0 group-hover:opacity-100 group-hover:-translate-x-0.5"
                )} />
            </div>
        </div>
    );
};
