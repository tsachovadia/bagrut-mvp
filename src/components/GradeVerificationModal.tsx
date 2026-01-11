
import { useState, useEffect } from 'react';
import { Button, Input } from './ui/shim';
import { X, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import type { SubjectGrade } from '../utils/calculator';

interface GradeVerificationModalProps {
    initialGrades: SubjectGrade[];
    isOpen: boolean;
    onClose: () => void;
    onSave: (grades: SubjectGrade[]) => void;
}

export const GradeVerificationModal = ({ initialGrades, isOpen, onClose, onSave }: GradeVerificationModalProps) => {
    const [grades, setGrades] = useState<SubjectGrade[]>(initialGrades);
    const [reviewedIndices, setReviewedIndices] = useState<Set<number>>(new Set());

    // Update local state when props change
    useEffect(() => {
        if (isOpen) {
            setGrades(initialGrades);
            // Auto-mark all as "needs review" initially, or auto-verified? 
            // User requested: "default it is correct but encourage user to mark if mistake".
            // Implementation: We will just show them.
        }
    }, [initialGrades, isOpen]);

    if (!isOpen) return null;

    const handleUpdate = (index: number, field: keyof SubjectGrade, value: any) => {
        const newGrades = [...grades];
        newGrades[index] = { ...newGrades[index], [field]: value };
        setGrades(newGrades);
    };

    const handleDelete = (index: number) => {
        setGrades(grades.filter((_, i) => i !== index));
    };

    const handleAddRow = () => {
        setGrades([...grades, { id: `new-${Date.now()}`, subject: 'מקצוע חדש', units: 3, grade: 0 }]);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-blue-50/50 rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Check className="w-6 h-6 text-green-600" />
                            אימות נתונים מסכם
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">המערכת סיננה רכיבי משנה והשאירה רק ציונים סופיים. אנא אשר את הנתונים.</p>
                    </div>
                    <Button variant="ghost" onClick={onClose} className="hover:bg-gray-200 rounded-full w-10 h-10 p-0">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Alert Bar */}
                <div className="bg-yellow-50 px-6 py-3 border-b border-yellow-100 flex items-center gap-3 text-sm text-yellow-800">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span>טיפ: וודא שמופיעים רק ציונים סופיים (בלי שאלונים כמו 806/807). מחק שורות כפולות אם יש.</span>
                </div>

                {/* Table - Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {grades.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            לא נמצאו ציונים. נסה להוסיף שורה ידנית.
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-gray-100 text-gray-600 font-medium">
                                    <tr>
                                        <th className="p-3 w-10"></th>
                                        <th className="p-3">מקצוע (חובה/בחירה)</th>
                                        <th className="p-3 w-24 text-center">סמל שאלון</th>
                                        <th className="p-3 w-24 text-center">מועד</th>
                                        <th className="p-3 w-20 text-center">יח״ל</th>
                                        <th className="p-3 w-20 text-center">ציון סופי</th>
                                        <th className="p-3 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y bg-white">
                                    {grades.map((grade, index) => (
                                        <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="p-3 text-center text-gray-300 text-xs">{index + 1}</td>
                                            <td className="p-2">
                                                <Input
                                                    value={grade.subject}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdate(index, 'subject', e.target.value)}
                                                    className="border-transparent bg-transparent hover:bg-gray-50 focus:bg-white focus:border-blue-500 h-9 text-right font-medium w-full"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    value={grade.semel || ''}
                                                    placeholder="-"
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdate(index, 'semel', e.target.value)}
                                                    className="border-transparent bg-transparent hover:bg-gray-50 focus:bg-white focus:border-blue-500 h-9 text-center w-full font-mono text-xs text-gray-500"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    value={grade.examDate || ''}
                                                    placeholder="-"
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdate(index, 'examDate', e.target.value)}
                                                    className="border-transparent bg-transparent hover:bg-gray-50 focus:bg-white focus:border-blue-500 h-9 text-center w-full"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    value={grade.units}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdate(index, 'units', Number(e.target.value))}
                                                    className="border-transparent bg-transparent hover:bg-gray-50 focus:bg-white focus:border-blue-500 h-9 text-center font-bold w-full"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    value={grade.grade}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdate(index, 'grade', Number(e.target.value))}
                                                    className={`border-transparent bg-transparent hover:bg-gray-50 focus:bg-white focus:border-blue-500 h-9 text-center font-bold w-full text-lg
                                                        ${grade.grade >= 90 ? 'text-green-600' : grade.grade < 55 ? 'text-red-600' : 'text-blue-900'}`}
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(index)}
                                                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <Button variant="outline" onClick={handleAddRow} className="mt-4 w-full border-dashed border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 py-4 h-auto">
                        <Plus className="w-4 h-4 ml-2" />
                        הוסף מקצוע ידנית
                    </Button>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-white rounded-b-2xl flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-10 relative">
                    <div className="text-xs text-gray-400 flex flex-col gap-1">
                        <span>* המערכת סיננה אוטומטית כפילויות.</span>
                        <span>* לחץ על "אשר והזן" כדי לחשב את הממוצע.</span>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} className="px-6">
                            חזור לעריכה
                        </Button>
                        <Button onClick={() => onSave(grades)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-11 text-base shadow-lg shadow-blue-200">
                            <Check className="w-5 h-5 ml-2" />
                            אשר והזן ציונים
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
