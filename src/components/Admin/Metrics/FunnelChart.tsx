import React from 'react';
import type { FunnelStage } from '../../../hooks/useMetrics';

interface FunnelChartProps {
    stages: FunnelStage[];
    title: string;
    color?: string;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
    stages, title, color = 'blue',
}) => {
    const maxCount = Math.max(...stages.map(s => s.count), 1);

    const barColor = color === 'purple' ? 'bg-purple-500' : color === 'green' ? 'bg-green-500' : 'bg-blue-500';

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-4">{title}</h3>
            <div className="space-y-3">
                {stages.map((stage, i) => {
                    const pct = Math.round((stage.count / maxCount) * 100);
                    const conversionFromPrev = i > 0 && stages[i - 1].count > 0
                        ? Math.round((stage.count / stages[i - 1].count) * 100)
                        : null;

                    return (
                        <div key={stage.name}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600">{stage.label}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-900">{stage.count.toLocaleString('he-IL')}</span>
                                    {conversionFromPrev !== null && (
                                        <span className="text-[10px] text-gray-400">({conversionFromPrev}%)</span>
                                    )}
                                </div>
                            </div>
                            <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
