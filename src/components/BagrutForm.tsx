import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Badge } from './ui/shim';
import { Plus, Trash2, GraduationCap } from 'lucide-react';
import { MANDATORY_SUBJECTS, ELECTIVE_SUBJECTS, getSubjectByName } from '../utils/subjects';
import type { SubjectGrade } from '../utils/calculator';
import type { BagrutSubject } from '../utils/subjects';

interface BagrutFormProps {
    onDataUpdate: (grades: SubjectGrade[]) => void;
    initialData?: SubjectGrade[];
}

export const BagrutForm = ({ onDataUpdate, initialData }: BagrutFormProps) => {
    // Initialize with mandatory subjects
    const [grades, setGrades] = useState<SubjectGrade[]>(() => {
        if (initialData && initialData.length > 0) return initialData;

        return MANDATORY_SUBJECTS.map((subj: BagrutSubject, idx: number) => ({
            id: `mandatory-${idx}`,
            subject: subj.name,
            units: subj.defaultUnits || 3,
            grade: 0
        }));
    });

    const [availableElectives, setAvailableElectives] = useState(ELECTIVE_SUBJECTS);
    const [selectedElective, setSelectedElective] = useState<string>('');

    useEffect(() => {
        onDataUpdate(grades);
    }, [grades, onDataUpdate]);

    const updateGrade = (id: string, field: keyof SubjectGrade, value: any) => {
        setGrades(prev => prev.map(g => {
            if (g.id === id) {
                return { ...g, [field]: value };
            }
            return g;
        }));
    };

    const addElective = () => {
        if (!selectedElective) return;

        const subjectDef = getSubjectByName(selectedElective);
        if (!subjectDef) return;

        const newGrade: SubjectGrade = {
            id: `elective-${Date.now()}`,
            subject: subjectDef.name,
            units: subjectDef.defaultUnits || 5, // Default to max for electives usually
            grade: 0
        };

        setGrades(prev => [...prev, newGrade]);
        setSelectedElective('');
    };

    const removeGrade = (id: string) => {
        setGrades(prev => prev.filter(g => g.id !== id));
    };

    // Split into mandatory and others for display
    const mandatoryGrades = grades.filter(g => MANDATORY_SUBJECTS.some((m: BagrutSubject) => m.name === g.subject));
    const electiveGrades = grades.filter(g => !MANDATORY_SUBJECTS.some((m: BagrutSubject) => m.name === g.subject));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    ציוני בגרות
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Mandatory Subjects */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">מקצועות חובה</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mandatoryGrades.map(grade => {
                            const def = getSubjectByName(grade.subject);
                            return (
                                <div key={grade.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <Label className="mb-2 block font-bold text-gray-800">{grade.subject}</Label>
                                    <div className="flex gap-2">
                                        <div className="w-1/3">
                                            <Label className="text-xs text-gray-500">יחידות</Label>
                                            <select
                                                className="w-full p-2 border rounded-md"
                                                value={grade.units}
                                                onChange={(e) => updateGrade(grade.id, 'units', parseInt(e.target.value))}
                                            >
                                                {def?.units.map((u: number) => (
                                                    <option key={u} value={u}>{u} יח"ל</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <Label className="text-xs text-gray-500">ציון</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={grade.grade || ''}
                                                onChange={(e: any) => updateGrade(grade.id, 'grade', parseInt(e.target.value) || 0)}
                                                placeholder="ציון"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Elective Subjects */}
                <div className="space-y-4 pt-4">
                    <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">מקצועות הגבר (מגמות)</h3>

                    {/* List existing electives */}
                    <div className="space-y-3">
                        {electiveGrades.map(grade => {
                            const def = getSubjectByName(grade.subject);
                            return (
                                <div key={grade.id} className="flex flex-col sm:flex-row gap-3 items-end p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="flex-1 w-full">
                                        <Label className="font-bold text-blue-900">{grade.subject}</Label>
                                        <div className="flex gap-2 mt-1">
                                            <select
                                                className="w-20 p-2 border rounded-md"
                                                value={grade.units}
                                                onChange={(e) => updateGrade(grade.id, 'units', parseInt(e.target.value))}
                                            >
                                                {def?.units.map((u: number) => (
                                                    <option key={u} value={u}>{u} יח"ל</option>
                                                ))}
                                            </select>
                                            <Input
                                                className="flex-1"
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={grade.grade || ''}
                                                onChange={(e: any) => updateGrade(grade.id, 'grade', parseInt(e.target.value) || 0)}
                                                placeholder="ציון"
                                            />
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-700 mb-0.5" onClick={() => removeGrade(grade.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}

                        {electiveGrades.length === 0 && (
                            <div className="text-center py-4 text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                                לא הוזנו מקצועות הגבר
                            </div>
                        )}
                    </div>

                    {/* Add new elective */}
                    <div className="flex gap-2 items-end pt-2">
                        <div className="flex-1">
                            <Label>הוסף מקצוע</Label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={selectedElective}
                                onChange={(e) => setSelectedElective(e.target.value)}
                            >
                                <option value="">בחר מקצוע...</option>
                                {availableElectives.map((subj: BagrutSubject) => (
                                    // Filter out already selected ones? No, user might want double? Usually not.
                                    <option key={subj.name} value={subj.name}>{subj.name}</option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={addElective} disabled={!selectedElective} className="bg-blue-600 text-white">
                            <Plus className="h-4 w-4 mr-1" /> הוסף
                        </Button>
                    </div>

                </div>

            </CardContent>
        </Card>
    );
};
