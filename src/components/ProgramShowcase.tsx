import React from 'react';
import { ProgramDetailsCard } from './ProgramDetailsCard';
import type { AdmissionRequirement, Program } from '../types/admission';

export const ProgramShowcase = () => {
    const [selectedUni, setSelectedUni] = React.useState<'BGU' | 'TAU'>('BGU');

    const bguData = {
        program: {
            id: 'prog_bgu',
            name: 'מדעי המחשב',
            degree_type: 'B.Sc',
            duration_years: 3,
            description: 'תואר ראשון יוקרתי במדעי המחשב המכשיר את בוגריו להשתלבות בתעשיית ההייטק ובמחקר אקדמי. התוכנית כוללת קורסים תיאורטיים ומעשיים בתחומי האלגוריתמים, מערכות הפעלה, בינה מלאכותית ועוד.',
            career_opportunities: 'בוגרי התוכנית משתלבים בתפקידי פיתוח תוכנה, מחקר, הנדסת נתונים וסייבר בחברות מובילות במשק ובעולם.',
            institution: { id: 'inst_1', name: 'אוניברסיטת בן-גוריון בנגב', type: 'university' as const },
            faculty: { id: 'fac_1', name: 'הפקולטה למדעי הטבע' }
        },
        admission: {
            id: 'req_1',
            program_id: 'prog_bgu',
            year: 2026,
            status: 'published' as const,
            logic_rules: {
                OR: [
                    {
                        name: "מסלול קבלה רגיל",
                        AND: [
                            { type: "sekhem_quant", operator: ">=" as const, value: 760, label: "סכם כמותי 760 ומעלה" },
                            { type: "psychometric_general", operator: ">=" as const, value: 660, label: "פסיכומטרי כללי 660 ומעלה" },
                            { type: "psychometric_quant", operator: ">=" as const, value: 135, label: "פסיכומטרי כמותי 135 ומעלה" },
                            {
                                label: "בגרות במתמטיקה בציון גבוה",
                                OR: [
                                    { AND: [{ type: "bagrut_subject", subject: "math", units: 5, operator: ">=" as const, value: 80, label: "5 יח״ל בציון 80+" }] },
                                    { AND: [{ type: "bagrut_subject", subject: "math", units: 4, operator: ">=" as const, value: 90, label: "4 יח״ל בציון 90+" }] }
                                ]
                            }
                        ]
                    },
                    {
                        name: "אפיק מעבר וקבלה (ללא פסיכומטרי)",
                        AND: [
                            { type: "full_bagrut", value: true, label: "זכאות לבגרות מלאה" },
                            { type: "bagrut_subject", subject: "english", units: 4, operator: ">=" as const, value: 56, label: "אנגלית 4 יח״ל ציון עובר" },
                            { type: "interview_pass", value: true, label: "מעבר ריאיון/ועדת קבלה" }
                        ]
                    }
                ]
            }
        }
    };

    const tauData = {
        program: {
            id: 'prog_tau',
            name: 'מדעי המחשב',
            degree_type: 'B.Sc',
            duration_years: 3,
            description: 'הלימודים מקנים ידע במדעי המחשב, אלגוריתמיקה ומערכות תוכנה. דגש על פתרון בעיות חישוביות מורכבות.',
            career_opportunities: 'בוגרי תל אביב הם המבוקשים ביותר בתעשיית ההייטק במרכז הארץ וחברות הטכנולוגיה העולמיות.',
            institution: { id: 'inst_2', name: 'אוניברסיטת תל אביב', type: 'university' as const },
            faculty: { id: 'fac_2', name: 'הפקולטה למדעים מדויקים' }
        },
        admission: {
            id: 'req_2',
            program_id: 'prog_tau',
            year: 2026,
            status: 'published' as const,
            logic_rules: {
                OR: [
                    {
                        name: "קבלה על סמך סכם (ציון התאמה)",
                        AND: [
                            { type: "sekhem_general", operator: ">=" as const, value: 700, label: "ציון התאמה 700 ומעלה" },
                            { type: "bagrut_subject", subject: "math", units: 5, operator: ">=" as const, value: 75, label: "5 יח״ל מתמטיקה ציון 75+" }
                        ]
                    },
                    {
                        name: "נתיב רישום ישיר (בגרות גבוהה)",
                        AND: [
                            { type: "bagrut_subject", subject: "math", units: 5, operator: ">=" as const, value: 90, label: "5 יח״ל מתמטיקה ציון 90+" },
                            { type: "psychometric_general", operator: ">=" as const, value: 680, label: "פסיכומטרי 680 ומעלה" }
                        ]
                    }
                ]
            }
        }
    };

    const activeData = selectedUni === 'BGU' ? bguData : tauData;

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg text-purple-800 text-sm font-bold border border-purple-200">
                    <span>✨</span>
                    <span>צפייה במידע מפורט מהדאטהבייס החכם</span>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
                    <button
                        onClick={() => setSelectedUni('BGU')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedUni === 'BGU' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        בן גוריון
                    </button>
                    <button
                        onClick={() => setSelectedUni('TAU')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedUni === 'TAU' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        תל אביב
                    </button>
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProgramDetailsCard program={activeData.program} admission={activeData.admission as any} />
            </div>
        </div>
    );
};
