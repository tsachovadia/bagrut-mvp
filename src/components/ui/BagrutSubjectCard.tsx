import { ChevronLeft, GraduationCap, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';
import { calculateBonus } from '../../utils/bonuses';

interface BagrutSubjectCardProps {
    subjectName: string;
    grade: number;
    units: number;
    onClick: () => void;
    isMandatory?: boolean;
}

export function BagrutSubjectCard({
    subjectName,
    grade,
    units,
    onClick,
    isMandatory = false
}: BagrutSubjectCardProps) {
    const hasGrade = grade > 0;
    const bonus = calculateBonus(subjectName, units, grade);

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 group relative overflow-hidden",
                hasGrade
                    ? "bg-white border-blue-100 shadow-sm hover:border-blue-300"
                    : "bg-gray-50/50 border-transparent hover:bg-gray-50 border-dashed border-gray-200"
            )}
        >
            {/* Background Gradient for completed items */}
            {hasGrade && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            )}

            <div className="flex items-center gap-3 relative z-10">
                {/* Icon / Status */}
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    hasGrade ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-400"
                )}>
                    {hasGrade ? (
                        <span className="font-bold text-sm">{grade}</span>
                    ) : (
                        <GraduationCap size={18} />
                    )}
                </div>

                {/* Text Info */}
                <div className="flex flex-col items-start gap-0.5">
                    <span className={cn(
                        "font-bold text-right",
                        hasGrade ? "text-gray-900" : "text-gray-500"
                    )}>
                        {subjectName}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-medium">
                            {units} יח"ל
                        </span>
                        {bonus > 0 && (
                            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <Trophy size={10} />
                                +{bonus}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Trailing Action */}
            <div className="relative z-10 text-gray-300 group-hover:text-blue-400 transition-colors">
                <ChevronLeft size={20} />
            </div>
        </button>
    );
}
