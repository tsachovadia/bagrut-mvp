import React, { useMemo } from 'react';
import { Info, BookOpen, Trophy, School, Star } from 'lucide-react';
import { calculateUniversityBonuses } from '../utils/bonuses';
import type { SubjectGrade } from '../utils/calculator';
import { AverageDisplay } from './AverageDisplay';
import type { Sector } from '../utils/subjects';

interface DynamicInfoSidepanelProps {
    sector: Sector;
    hasGrades: boolean;
    grades?: SubjectGrade[];
}

const SECTOR_INFO: Record<string, { title: string; description: string; requirements: string[] }> = {
    'mamlachti': {
        title: 'ממלכתי (יהודי)',
        description: 'בתי ספר ממלכתיים במגזר היהודי. תוכנית הלימודים כוללת מקצועות חובה כמו תנ"ך, ספרות ואזרחות.',
        requirements: [
            'חובה: תנ"ך (2 יח"ל)',
            'חובה: ספרות (2 יח"ל)',
            'חובה: אזרחות (2 יח"ל)',
            'חובה: היסטוריה (2 יח"ל)',
            'חובה: מתמטיקה ואנגלית'
        ]
    },
    'mamlachti_dati': {
        title: 'ממלכתי-דתי',
        description: 'בתי ספר ממלכתיים-דתיים. דגש מוגבר על לימודי קודש (תנ"ך מוגבר, תושב"ע/מחשבת ישראל).',
        requirements: [
            'חובה: תנ"ך מוגבר',
            'חובה: תושב"ע או מחשבת ישראל',
            'חובה: אזרחות והיסטוריה',
            'דרישות נוספות בהתאם למוסד'
        ]
    },
    'arab': {
        title: 'ערבי',
        description: 'בתי ספר במגזר הערבי. שפת ההוראה היא ערבית, עם דגש על השפה והתרבות הערבית.',
        requirements: [
            'חובה: ערבית (עברית כשפה שנייה)',
            'חובה: היסטוריה לערבים',
            'אזרחות (תוכנית מותאמת)'
        ]
    },
    'druze': {
        title: 'דרוזי',
        description: 'בתי ספר במגזר הדרוזי. תוכנית לימודים ייחודית הכוללת מורשת דרוזית.',
        requirements: [
            'חובה: עברית וערבית',
            'חובה: מורשת דרוזית',
            'היסטוריה ואזרחות'
        ]
    }
};

export const DynamicInfoSidepanel: React.FC<DynamicInfoSidepanelProps> = ({ sector, hasGrades, grades = [] }) => {
    const info = SECTOR_INFO[sector] || {
        title: 'ברוכים הבאים',
        description: 'בחרו את מגזר בית הספר שלכם כדי לראות את מקצועות החובה הרלוונטיים.',
        requirements: []
    };

    const bonuses = useMemo(() => calculateUniversityBonuses(grades), [grades]);
    const maxBonus = Math.max(...bonuses.map(b => b.totalBonus));

    return (
        <div className="h-full bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col gap-6 overflow-y-auto">

            {/* Average Display - Always visible if there are grades, otherwise hidden or empty state */}
            {hasGrades && grades.length > 0 && (
                <AverageDisplay grades={grades} sector={sector} className="animate-in fade-in slide-in-from-top-4 duration-500" />
            )}

            {/* Sector Info */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-700">
                    <BookOpen className="w-5 h-5" />
                    <h3 className="font-bold text-lg">{info.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {info.description}
                </p>
                {info.requirements.length > 0 && (
                    <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2">דרישות בגרות עיקריות:</p>
                        <ul className="text-xs space-y-1 text-gray-600 list-disc list-inside">
                            {info.requirements.map((req, idx) => (
                                <li key={idx}>{req}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Bonuses Section - Only show if there are bonuses */}
            {maxBonus > 0 && (
                <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 text-indigo-700">
                        <Trophy className="w-5 h-5" />
                        <div>
                            <h3 className="font-bold text-sm">בונוסים לאוניברסיטה</h3>
                            <p className="text-[10px] text-indigo-500 font-medium">הבונוס מתווסף לציון המקצוע בשקלול</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {bonuses.map((uni) => (
                            <div key={uni.university} className="border-b last:border-0 border-indigo-50 pb-2 last:pb-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <School className="w-3.5 h-3.5 text-indigo-500" />
                                    <span className="text-xs font-bold text-gray-700">{uni.university}</span>
                                </div>

                                <div className="space-y-1.5 pr-2">
                                    {uni.details.length > 0 ? (
                                        uni.details.map((detail, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-[11px] text-gray-600 bg-indigo-50/30 p-1.5 rounded-md">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{detail.subject}</span>
                                                    <span className="text-[10px] text-gray-400">{detail.units} יח״ל</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-indigo-600 font-bold dir-ltr">
                                                    <span>+{detail.points}</span>
                                                    <span className="text-[9px] font-normal text-indigo-400">to grade</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[10px] text-gray-400 pr-1">- אין בונוסים עבור המקצועות שהוזנו -</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-2 border-t border-indigo-50">
                        <div className="flex items-start gap-2">
                            <Star className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-gray-400 leading-tight">
                                * הבונוסים משתנים בין מוסדות. החישוב כאן הוא הערכה לתוספת שניתנת לציון המקצוע עצמו לפני הממוצע.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* General Tip */}
            {!hasGrades && (
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm mt-auto">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="font-bold text-sm text-gray-800">טיפ לממלאים</p>
                            <p className="text-xs text-gray-500">
                                כדי לקבל חישוב מדויק, חשוב להזין את כל מקצועות החובה ואת המקצועות המורחבים (5 יח"ל). הבונוסים משמעותיים!
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
