import React from 'react';
import { Building2, GraduationCap, ArrowRight, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Badge } from './ui/shim';
import type { Program, AdmissionRequirement } from '../types/admission';
import { checkReachable, type UserAdmissionStats } from '../utils/admission-evaluation';

interface CompactProgramCardProps {
    program: Program;
    admission: AdmissionRequirement;
    userStats?: UserAdmissionStats;
    onClick?: () => void;
}

export const CompactProgramCard: React.FC<CompactProgramCardProps> = ({
    program,
    admission,
    userStats,
    onClick
}) => {
    const [imageError, setImageError] = React.useState(false);

    // Calculate reachability only if we have stats
    const isReachable = userStats ? checkReachable(userStats, admission) : null;

    // Faculty color mapping (simple hash or preset)
    const getFacultyColor = (name: string = '') => {
        if (name.includes('הנדסה') || name.includes('טכנולוג')) return 'bg-blue-500';
        if (name.includes('רפואה') || name.includes('בריאות')) return 'bg-red-500';
        if (name.includes('רוח') || name.includes('חברה')) return 'bg-yellow-500';
        if (name.includes('טבע') || name.includes('מדעים')) return 'bg-green-500';
        if (name.includes('משפטים')) return 'bg-purple-500';
        return 'bg-gray-500';
    };

    const facultyColor = getFacultyColor(program.faculty?.name);

    // Logo handling
    const logoUrl = program.institution?.logo_url;
    const websiteUrl = program.institution?.website_url;

    const handleLogoClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (websiteUrl) {
            window.open(websiteUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div
            onClick={onClick}
            className="group relative bg-white rounded-xl border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col h-full min-h-[max-content]"
        >
            {/* Left Color Bar (Faculty indicator) */}
            <div className={`absolute top-0 bottom-0 right-0 w-1 ${facultyColor} opacity-80 group-hover:opacity-100 transition-opacity`} />

            <div className="p-3 flex flex-col h-full pr-4">
                {/* Header: Logo & Faculty */}
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 line-clamp-1 max-w-[80%] pt-0.5">
                        {program.faculty?.name}
                    </span>

                    {/* Institution Logo or Fallback */}
                    {logoUrl && !imageError ? (
                        <div
                            onClick={handleLogoClick}
                            title={program.institution?.name}
                            className="w-8 h-8 rounded-full border border-gray-100 bg-white shadow-sm flex items-center justify-center overflow-hidden hover:scale-110 transition-transform z-10"
                        >
                            <img
                                src={logoUrl}
                                alt={program.institution?.name}
                                className="w-full h-full object-contain p-1"
                                onError={() => setImageError(true)}
                            />
                        </div>
                    ) : (
                        <div
                            onClick={handleLogoClick}
                            className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors z-10"
                        >
                            <Building2 className="w-4 h-4" />
                        </div>
                    )}
                </div>

                {/* Main: Title & Degree */}
                <div className="mb-auto">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-blue-700 transition-colors">
                            {program.name}
                        </h3>
                    </div>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-gray-50 text-gray-400 border-0 h-5 inline-flex">
                        {program.degree_type}
                    </Badge>
                </div>

                {/* Footer: Stats & Reachability */}
                <div className="mt-4 flex items-end justify-between border-t border-gray-50 pt-3">
                    <div className="text-xs text-gray-400 font-medium">
                        {program.duration_years} שנים
                    </div>

                    {isReachable !== null && (
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold transition-colors ${isReachable
                            ? 'bg-green-50 text-green-600'
                            : 'bg-orange-50 text-orange-600'
                            }`}>
                            {isReachable ? (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>קבלה</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>גבולי</span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Hover Arrow */}
                    <div className={`absolute bottom-4 left-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 ${isReachable !== null ? 'hidden' : ''}`}>
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                    </div>
                </div>
            </div>
        </div>
    );
};
