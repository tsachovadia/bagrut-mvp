import React from 'react';
import { Info, AlertCircle, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/shim';

interface DynamicInfoSidepanelProps {
    sector: string;
    hasGrades: boolean;
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

export const DynamicInfoSidepanel: React.FC<DynamicInfoSidepanelProps> = ({ sector, hasGrades }) => {
    const info = SECTOR_INFO[sector] || {
        title: 'ברוכים הבאים',
        description: 'בחרו את מגזר בית הספר שלכם כדי לראות את מקצועות החובה הרלוונטיים.',
        requirements: []
    };

    return (
        <div className="h-full bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col gap-6 overflow-y-auto">
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

            {hasGrades && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm mt-auto animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-start gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="font-bold text-sm text-gray-800">נראה טוב!</p>
                            <p className="text-xs text-gray-500">
                                המערכת מזהה שהזנת ציונים. ודאו שכל המקצועות מופיעים לפני המעבר לשלב הבא.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

function CheckCircleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    );
}
