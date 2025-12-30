
import { AlertCircle, FileText, TrendingUp, GraduationCap } from 'lucide-react';
import type { SubjectGrade, PsychometricScores } from '../../utils/calculator';
import { Card } from '../ui/shim';

interface Props {
    stats: any;
    bagrut: SubjectGrade[];
    psychometric: PsychometricScores;
}

export const MyDataPanel = ({ stats, psychometric }: Props) => {
    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-3xl">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <FileText className="w-5 h-5 text-blue-500" />
                    נתוני מקור
                </h2>
                <p className="text-xs text-gray-500 mt-1">המצב הנוכחי שלך לפני שיפורים</p>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <div className="text-xs text-blue-600 mb-1">ממוצע בגרות</div>
                        <div className="text-2xl font-bold text-blue-900">{stats?.bagrutAverage?.toFixed(2)}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                        <div className="text-xs text-purple-600 mb-1">פסיכומטרי</div>
                        <div className="text-2xl font-bold text-purple-900">{psychometric.general}</div>
                    </div>
                </div>

                {/* Admission Status Per Uni */}
                <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        סכם נוכחי במוסדות
                    </h3>
                    <div className="space-y-3">
                        {stats?.degrees?.slice(0, 5).map((d: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-200 transition-colors">
                                <span className="text-sm font-medium text-gray-700">{d.university}</span>
                                <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg text-xs">
                                    {d.sechem[0]?.score?.toFixed(0)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800 leading-relaxed">
                        אלו הם נתוני האמת שלך. כל שינוי שתעשה בעמודה המרכזית הוא סימולציה בלבד ולא ישמור את השינויים בנתונים אלו.
                    </p>
                </div>
            </div>
        </div>
    );
};
