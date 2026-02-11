import React from 'react';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';

interface KPICardProps {
    label: string;
    value: number | string;
    delta?: number;
    icon: LucideIcon;
    color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
    format?: 'number' | 'currency' | 'percent';
}

const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
};

export const KPICard: React.FC<KPICardProps> = ({
    label, value, delta, icon: Icon, color = 'blue', format = 'number',
}) => {
    const formattedValue = format === 'currency'
        ? `${Number(value).toLocaleString('he-IL')}₪`
        : format === 'percent'
            ? `${value}%`
            : Number(value).toLocaleString('he-IL');

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 font-medium">{label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-gray-900">{formattedValue}</span>
                {delta !== undefined && (
                    <div className={`flex items-center gap-0.5 text-xs font-medium ${delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-gray-400'
                        }`}>
                        {delta > 0 ? <TrendingUp className="w-3 h-3" /> :
                            delta < 0 ? <TrendingDown className="w-3 h-3" /> :
                                <Minus className="w-3 h-3" />}
                        {delta > 0 ? '+' : ''}{delta}%
                    </div>
                )}
            </div>
        </div>
    );
};
