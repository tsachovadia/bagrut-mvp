import React from 'react';
import type { Segment } from '../../../hooks/useMetrics';

interface SegmentDonutProps {
    segments: Segment[];
    title: string;
}

const COLORS = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
    'bg-red-500', 'bg-teal-500', 'bg-pink-500', 'bg-yellow-500',
];

const DOT_COLORS = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
    'bg-red-500', 'bg-teal-500', 'bg-pink-500', 'bg-yellow-500',
];

export const SegmentDonut: React.FC<SegmentDonutProps> = ({ segments, title }) => {
    const total = segments.reduce((sum, s) => sum + s.count, 0) || 1;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-4">{title}</h3>

            {/* Horizontal stacked bar (simpler than donut, more readable) */}
            <div className="h-6 bg-gray-100 rounded-full overflow-hidden flex mb-4">
                {segments.map((seg, i) => {
                    const pct = (seg.count / total) * 100;
                    if (pct < 1) return null;
                    return (
                        <div
                            key={seg.label}
                            className={`${COLORS[i % COLORS.length]} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                            title={`${seg.label}: ${seg.count}`}
                        />
                    );
                })}
            </div>

            {/* Legend */}
            <div className="space-y-2">
                {segments.slice(0, 8).map((seg, i) => {
                    const pct = Math.round((seg.count / total) * 100);
                    return (
                        <div key={seg.label} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${DOT_COLORS[i % DOT_COLORS.length]}`} />
                                <span className="text-xs text-gray-600">{seg.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-900">{seg.count}</span>
                                <span className="text-[10px] text-gray-400">({pct}%)</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
