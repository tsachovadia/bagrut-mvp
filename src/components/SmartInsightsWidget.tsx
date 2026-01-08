import React from 'react';
import type { Recommendation } from '../services/smart-recommendation';
import { Calendar, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';

interface Props {
    recommendations: Recommendation[];
    isLoading: boolean;
}

export const SmartInsightsWidget: React.FC<Props> = ({ recommendations, isLoading }) => {
    if (isLoading) {
        return <div className="animate-pulse bg-gray-100 h-32 rounded-lg"></div>;
    }

    if (recommendations.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                <span className="text-4xl">🎉</span>
                <h3 className="text-lg font-bold text-gray-800 mt-2">אין המלצות דחופות</h3>
                <p className="text-gray-500 text-sm">המצב שלך מצוין! או שלא הזנת מספיק נתונים לניתוח.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 font-sans" dir="rtl">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                <SparklesIcon />
                המלצות חכמות לשיפור סיכויים
            </h2>

            <div className="grid gap-3">
                {recommendations.map((rec) => (
                    <div
                        key={rec.id}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                        {/* Impact Badge */}
                        <div className="absolute top-0 left-0 bg-green-50 px-3 py-1 rounded-br-xl text-xs font-bold text-green-700 flex items-center gap-1">
                            <TrendingUp size={12} />
                            השפעה: {rec.impact_score}/10
                        </div>

                        <div className="flex justify-between items-start mt-2">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">
                                    {rec.action}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {rec.description}
                                </p>
                            </div>

                            <div className="text-left min-w-[100px]">
                                <div className="text-2xl font-black text-blue-600">
                                    +{rec.predicted_sekem_boost}
                                </div>
                                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                    נקודות סכם
                                </div>
                            </div>
                        </div>

                        {/* Date / Action Footer */}
                        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar size={14} className="text-indigo-500" />
                                {rec.next_exam_date ? (
                                    <span>
                                        מועד קרוב: <b>{new Date(rec.next_exam_date).toLocaleDateString('he-IL')}</b> ({rec.next_exam_season})
                                    </span>
                                ) : (
                                    <span className="italic text-gray-400 w-full">אין תאריך קרוב</span>
                                )}
                            </div>

                            <button className="text-indigo-600 text-sm font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                איך לשפר? <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SparklesIcon = () => (
    <svg
        className="w-5 h-5 text-yellow-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);
