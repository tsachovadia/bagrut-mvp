import React from 'react';
import type { TimeSeriesPoint } from '../../../hooks/useMetrics';

interface TimeSeriesChartProps {
    data: TimeSeriesPoint[];
    title: string;
    color?: string;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
    data, title, color = 'blue',
}) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const avg = data.length > 0 ? Math.round(total / data.length) : 0;

    const barColor = color === 'purple' ? 'bg-purple-400' : color === 'green' ? 'bg-green-400' : 'bg-blue-400';
    const barHover = color === 'purple' ? 'hover:bg-purple-500' : color === 'green' ? 'hover:bg-green-500' : 'hover:bg-blue-500';

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800">{title}</h3>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400">סה"כ: {total.toLocaleString('he-IL')}</span>
                    <span className="text-[10px] text-gray-400">ממוצע: {avg}/יום</span>
                </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-px h-32">
                {data.map((point) => {
                    const height = (point.value / maxValue) * 100;
                    const day = new Date(point.date).getDate();
                    return (
                        <div key={point.date} className="flex-1 flex flex-col items-center group relative">
                            <div
                                className={`w-full ${barColor} ${barHover} rounded-t transition-all duration-300 cursor-pointer`}
                                style={{ height: `${Math.max(height, 2)}%` }}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                                {point.date}: {point.value}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* X-axis labels (every 5th day) */}
            <div className="flex justify-between mt-1">
                {data.filter((_, i) => i % 5 === 0 || i === data.length - 1).map(point => (
                    <span key={point.date} className="text-[9px] text-gray-400">
                        {new Date(point.date).getDate()}/{new Date(point.date).getMonth() + 1}
                    </span>
                ))}
            </div>
        </div>
    );
};
