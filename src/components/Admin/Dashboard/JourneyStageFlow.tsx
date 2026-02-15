import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface JourneySegment {
    label: string;
    count: number;
}

interface JourneyStageFlowProps {
    segments: JourneySegment[];
}

const STAGE_ORDER = ['אנונימי', 'חוקר', 'משווה', 'מחליט', 'הגיש בקשה'];

const STAGE_COLORS = [
    'bg-gray-100 border-gray-300 text-gray-700',
    'bg-blue-50 border-blue-300 text-blue-700',
    'bg-purple-50 border-purple-300 text-purple-700',
    'bg-orange-50 border-orange-300 text-orange-700',
    'bg-green-50 border-green-300 text-green-700',
];

export const JourneyStageFlow: React.FC<JourneyStageFlowProps> = ({ segments }) => {
    // Map segments by label for quick lookup
    const segmentMap = new Map(segments.map(s => [s.label, s.count]));

    // Build ordered stages with counts
    const stages = STAGE_ORDER.map(label => ({
        label,
        count: segmentMap.get(label) ?? 0,
    }));

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-5">מסע המשתמש</h3>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                {stages.map((stage, i) => {
                    const conversionPct =
                        i > 0 && stages[i - 1].count > 0
                            ? Math.round((stage.count / stages[i - 1].count) * 100)
                            : null;

                    return (
                        <React.Fragment key={stage.label}>
                            {/* Arrow + conversion percentage between stages */}
                            {i > 0 && (
                                <div className="flex flex-col items-center gap-0.5 flex-shrink-0 px-0.5">
                                    <ArrowLeft className="w-4 h-4 text-gray-400" />
                                    {conversionPct !== null && (
                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                            {conversionPct}%
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Stage box */}
                            <div
                                className={`flex flex-col items-center justify-center rounded-lg border-2 px-4 py-3 min-w-[90px] flex-shrink-0 ${STAGE_COLORS[i % STAGE_COLORS.length]}`}
                            >
                                <span className="text-xs font-medium whitespace-nowrap">{stage.label}</span>
                                <span className="text-lg font-bold mt-1">
                                    {stage.count.toLocaleString('he-IL')}
                                </span>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
