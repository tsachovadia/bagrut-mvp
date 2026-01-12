import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Input } from './ui/shim';
import { X, Plus, Check, AlertCircle } from 'lucide-react';
import type { SubjectGrade } from '../utils/calculator';
import { SECTOR_MANDATORY_SUBJECTS, ELECTIVE_SUBJECTS } from '../utils/subjects';

interface GradeVerificationModalProps {
    initialGrades: SubjectGrade[];
    isOpen: boolean;
    onClose: () => void;
    onSwitchToManual: () => void;
    onSave: (grades: SubjectGrade[]) => void;
}

export const GradeVerificationModal = ({ initialGrades, isOpen, onClose, onSwitchToManual, onSave }: GradeVerificationModalProps) => {
    const [grades, setGrades] = useState<SubjectGrade[]>(initialGrades);

    // Prepare lists
    const mandatorySubjectsList = SECTOR_MANDATORY_SUBJECTS['mamlachti']; // Default for now

    // Helper to check if a subject is mandatory
    // We check via exact match or keyword match for the alert, but for grouping we prefer exact match or flexible logic
    const isMandatory = (subjectName: string) => {
        if (!subjectName) return false;
        // Check exact match in list
        if (mandatorySubjectsList.includes(subjectName)) return true;
        // Check keywords for extracted subjects that might not match exactly yet
        const keywords = ['מתמטיקה', 'אנגלית', 'עברית', 'הבעה', 'לשון', 'ספרות', 'היסטוריה', 'אזרחות', 'תנ"ך', 'תנ״ך', 'מקרא'];
        return keywords.some(k => subjectName.includes(k));
    };

    // Filter lists for dropdowns
    const electiveDropdownOptions = ELECTIVE_SUBJECTS.map(s => s.name).filter(n => !mandatorySubjectsList.includes(n));

    // Update local state when props change, with Smart Merging
    useEffect(() => {
        if (isOpen) {
            const smartMerge = (rawGrades: SubjectGrade[]) => {
                const mergedMap = new Map<string, SubjectGrade>();
                const mandatoryList = SECTOR_MANDATORY_SUBJECTS['mamlachti'];

                // 1. First pass: Map existing grades
                rawGrades.forEach(g => {
                    mergedMap.set(g.subject, g);
                });

                // 2. Scan for variations and merge into canonical mandatory subjects
                // If we have "Bible General" (85) and "Bible" (0), we want "Bible" (85)
                const variationsMap: Record<string, string> = {
                    'תנ"ך': 'תנ"ך',
                    'תנ״ך': 'תנ"ך',
                    'תנ"ך כללי': 'תנ"ך',
                    'תנ״ך כללי': 'תנ"ך',
                    'מקרא': 'תנ"ך',
                    'ספרות': 'ספרות',
                    'ספרות כללי': 'ספרות',
                    'ספרות עברית': 'ספרות',
                    'ספרות (כללי)': 'ספרות',
                    'היסטוריה': 'היסטוריה',
                    'היסטוריה כללית': 'היסטוריה',
                    'היסטוריה (כללי)': 'היסטוריה',
                    'היסטוריה ממלכתי': 'היסטוריה',
                    'אזרחות': 'אזרחות',
                    'עברית - הבעה ולשון': 'עברית - הבעה ולשון',
                    'הבעה עברית': 'עברית - הבעה ולשון',
                    'הבעה ולשון': 'עברית - הבעה ולשון',
                    'לשון עברית': 'עברית - הבעה ולשון',
                    'אנגלית': 'אנגלית',
                    'מתמטיקה': 'מתמטיקה'
                };

                const result: SubjectGrade[] = [];
                const processedIndices = new Set<string>();

                // Helper to get grade value
                const getGradeVal = (s: string) => mergedMap.get(s)?.grade || 0;

                // Go through all raw grades
                rawGrades.forEach((g) => {
                    // Normalize name
                    let canonicalName = g.subject;
                    // Check direct map or fuzzy contains
                    for (const [variation, target] of Object.entries(variationsMap)) {
                        if (g.subject.includes(variation) && mandatoryList.includes(target)) {
                            canonicalName = target;
                            break;
                        }
                    }

                    // If we already have this canonical name in our result map (or state), check if we should overwrite
                    // But here we are building a fresh list. 
                    // We need to check if we already processed a grade designated for this canonical name.
                });

                // Simpler approach:
                // 1. Identify "Generic Mandatories" that are empty (grade 0)
                // 2. Identify "Specific Variations" that have grades
                // 3. Move Specific data to Generic slot
                // 4. Filter out Specifics

                let processedGrades = [...rawGrades];

                // Iterate backwards to safely splice if needed, or just map/filter
                // We'll create a new list

                const finalGrades: SubjectGrade[] = [];
                const handledMandatories = new Set<string>();

                // Prioritize: Actual Mandatory entries with grades > Empty Mandatory > Variations with grades

                // Actually, best way is to bucket them
                const bucket: Record<string, SubjectGrade[]> = {};

                processedGrades.forEach(g => {
                    let key = g.subject;
                    // Normalize key if it matches a mandatory variation
                    for (const [variation, target] of Object.entries(variationsMap)) {
                        if (g.subject === target || g.subject === variation || (g.subject.includes(variation) && variation.length > 3)) {
                            // Only strictly map if it's a known variation or contains the core keyword
                            key = target;
                            break;
                        }
                    }
                    if (!bucket[key]) bucket[key] = [];
                    bucket[key].push(g);
                });

                // Reconstruct
                Object.entries(bucket).forEach(([key, items]) => {
                    if (items.length === 1) {
                        finalGrades.push({ ...items[0], subject: key });
                    } else {
                        // Conflict resolution: take the one with highest grade or first non-zero
                        const best = items.reduce((prev, curr) => (curr.grade > prev.grade ? curr : prev), items[0]);
                        finalGrades.push({ ...best, subject: key });
                    }
                });

                return finalGrades;
            };

            setGrades(smartMerge(initialGrades));
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

    // Mandatory subjects check for Alert
    // We use the simpler checklist approach for the top banner
    const MANDATORY_CHECKLIST = [
        { name: 'מתמטיקה', keywords: ['מתמטיקה'] },
        { name: 'אנגלית', keywords: ['אנגלית'] },
        { name: 'לשון/הבעה', keywords: ['עברית', 'הבעה', 'לשון'] },
        { name: 'ספרות', keywords: ['ספרות'] },
        { name: 'היסטוריה', keywords: ['היסטוריה'] },
        { name: 'אזרחות', keywords: ['אזרחות'] },
        { name: 'תנ״ך', keywords: ['תנ"ך', 'תנ״ך', 'מקרא'] },
    ];

    const missingSubjects = MANDATORY_CHECKLIST.filter(m =>
        !grades.some(g => m.keywords.some(k => g.subject.includes(k)))
    );

    // Group grades for rendering (keeping original index for updates)
    const gradesWithIndex = grades.map((g, i) => ({ ...g, originalIndex: i }));
    const mandatoryRows = gradesWithIndex.filter(g => isMandatory(g.subject));
    const electiveRows = gradesWithIndex.filter(g => !isMandatory(g.subject));

    const renderTableSection = (rows: typeof gradesWithIndex, title: string, emptyText: string) => (
        <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3 border-r-4 border-blue-500 pr-3">
                {title}
            </h3>
            {rows.length === 0 ? (
                <div className="text-gray-400 text-sm italic pr-4 mb-4">{emptyText}</div>
            ) : (
                <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="p-3 w-10">#</th>
                                <th className="p-3">מקצוע</th>
                                <th className="p-3 w-24 text-center">סמל</th>
                                <th className="p-3 w-32 text-center">מועד</th>
                                <th className="p-3 w-20 text-center">יח״ל</th>
                                <th className="p-3 w-24 text-center">ציון</th>
                                <th className="p-3 w-24"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map((row) => (
                                <tr key={row.originalIndex} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="p-3 text-center text-gray-300 text-xs">{row.originalIndex + 1}</td>
                                    <td className="p-2 relative">
                                        <select
                                            value={row.subject}
                                            onChange={(e) => handleUpdate(row.originalIndex, 'subject', e.target.value)}
                                            className="appearance-none border-transparent bg-transparent hover:bg-gray-50 focus:bg-white focus:border-blue-500 h-9 w-full text-right font-medium pr-2 pl-2 cursor-pointer text-gray-900 rounded transition-all"
                                        >
                                            {/* Custom value option if not in lists */}
                                            {!mandatorySubjectsList.includes(row.subject) && !electiveDropdownOptions.includes(row.subject) && row.subject !== 'מקצוע חדש' && (
                                                <option value={row.subject}>{row.subject}</option>
                                            )}
                                            <option value="מקצוע חדש" disabled>בחר מקצוע...</option>

                                            <optgroup label="מקצועות חובה">
                                                {mandatorySubjectsList.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="מקצועות הגבר">
                                                {electiveDropdownOptions.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            value={row.semel || ''}
                                            placeholder="-"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdate(row.originalIndex, 'semel', e.target.value)}
                                            className="border-transparent bg-transparent hover:bg-gray-50 focus:bg-white focus:border-blue-500 h-9 text-center w-full font-mono text-xs text-gray-500 rounded"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            value={row.examDate || ''}
                                            placeholder="-"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdate(row.originalIndex, 'examDate', e.target.value)}
                                            className="border-transparent bg-transparent hover:bg-gray-50 focus:bg-white focus:border-blue-500 h-9 text-center w-full rounded"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="number"
                                            value={row.units}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdate(row.originalIndex, 'units', Number(e.target.value))}
                                            className="border-transparent bg-transparent hover:bg-gray-50 focus:bg-white focus:border-blue-500 h-9 text-center font-bold w-full rounded"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="number"
                                            value={row.grade}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdate(row.originalIndex, 'grade', Number(e.target.value))}
                                            className={`border-transparent bg-transparent hover:bg-gray-50 focus:bg-white focus:border-blue-500 h-9 text-center font-bold w-full text-lg rounded
                                                ${row.grade >= 90 ? 'text-green-600' : row.grade < 55 ? 'text-red-600' : 'text-blue-900'}`}
                                        />
                                    </td>
                                    <td className="p-2 text-center">
                                        <button
                                            onClick={() => handleDelete(row.originalIndex)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs font-medium px-3 py-1.5 rounded transition-all"
                                        >
                                            מחק
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-blue-50/50 rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Check className="w-6 h-6 text-green-600" />
                            אימות נתונים מסכם
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">אנא וודא שהציונים שנקלטו תואמים לתעודת הבגרות שלך.</p>
                    </div>
                    <Button variant="ghost" onClick={onClose} className="hover:bg-gray-200 rounded-full w-10 h-10 p-0">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Missing Subjects Alert */}
                {missingSubjects.length > 0 && (
                    <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-start gap-4">
                        <div className="bg-orange-100 p-2 rounded-full shrink-0">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <span className="font-bold text-orange-900 block mb-1 text-sm">חסרים מקצועות חובה בתעודה!</span>
                            <p className="text-xs text-orange-800 mb-2">יתכן וחסרים לך מקצועות חובה לחישוב ממוצע תקין. אנא בדוק אם חסר:</p>
                            <div className="flex flex-wrap gap-2">
                                {missingSubjects.map(s => (
                                    <span key={s.name} className="bg-white border border-orange-200 px-2 py-1 rounded text-xs text-orange-700 font-bold shadow-sm">
                                        {s.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Table - Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-gray-50/50">
                    {grades.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            לא נמצאו ציונים. נסה להוסיף שורה ידנית.
                        </div>
                    ) : (
                        <>
                            {renderTableSection(mandatoryRows, 'מקצועות חובה', 'לא נמצאו מקצועות חובה. (זה לא תקין)')}
                            {renderTableSection(electiveRows, 'מקצועות הרחבה (מגמות)', 'לא נמצאו מקצועות הרחבה.')}
                        </>
                    )}

                    <Button variant="outline" onClick={handleAddRow} className="mt-4 w-full border-dashed border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 py-4 h-auto">
                        <Plus className="w-4 h-4 ml-2" />
                        הוסף מקצוע ידנית
                    </Button>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-white rounded-b-2xl flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-10 relative">
                    <div className="text-xs text-gray-400 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span>ציון מעל 90</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span>ציון נכשל (מתחת ל-55)</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                onClose(); // Close modal
                                onSwitchToManual(); // Switch tab
                            }}
                            className="px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            חזור להזנה ידנית
                        </Button>
                        <Button onClick={() => onSave(grades)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-11 text-base shadow-lg shadow-blue-200">
                            <Check className="w-5 h-5 ml-2" />
                            אשר והזן ציונים
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    ) : null;
};
