import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from './ui/shim';
import { Plus, Trash2, GraduationCap, UploadCloud, FileText, ExternalLink, BookOpen, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { SECTOR_MANDATORY_SUBJECTS, SECTOR_NAMES, type Sector, getSubjectByName, ELECTIVE_SUBJECTS, type BagrutSubject } from '../utils/subjects';
import type { SubjectGrade } from '../utils/calculator';
import { InfoBox } from './ui/InfoBox';
import { InfoTooltip } from './ui/InfoTooltip';
import { calculateBonus } from '../utils/bonuses';
import { BagrutSubjectRow } from './BagrutSubjectRow';

interface BagrutFormProps {
    onDataUpdate: (grades: SubjectGrade[]) => void;
    initialData?: SubjectGrade[];
    onAutoFill?: () => void;
}

type InputMethod = 'manual' | 'upload' | 'link';

export const BagrutForm = ({ onDataUpdate, initialData, onAutoFill }: BagrutFormProps) => {
    const [activeTab, setActiveTab] = useState<InputMethod>('manual');
    const [sector, setSector] = useState<Sector>('mamlachti');

    const [grades, setGrades] = useState<SubjectGrade[]>(initialData || []);

    const [availableElectives] = useState(ELECTIVE_SUBJECTS);
    const [selectedElective, setSelectedElective] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Sync to parent
    useEffect(() => {
        onDataUpdate(grades);
    }, [grades, onDataUpdate]);

    // Handle Sector Change Logic
    useEffect(() => {
        const mandatoryNames = SECTOR_MANDATORY_SUBJECTS[sector];

        setGrades(prevGrades => {
            const newGrades = [...prevGrades];
            const existingSubjects = new Set(newGrades.map(g => g.subject));

            mandatoryNames.forEach(name => {
                if (!existingSubjects.has(name)) {
                    const def = getSubjectByName(name);
                    newGrades.push({
                        id: `mandatory-${name}`,
                        subject: name,
                        units: def?.defaultUnits || 3,
                        grade: 0
                    });
                }
            });
            return newGrades;
        });
    }, [sector]);

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
            units: subjectDef.defaultUnits || 5,
            grade: 0
        };

        setGrades(prev => [...prev, newGrade]);
        setSelectedElective('');
    };

    const removeGrade = (id: string) => {
        setGrades(prev => prev.filter(g => g.id !== id));
    };

    const handleGradeChange = (subjectName: string, field: keyof SubjectGrade, value: any) => {
        setGrades(prev => prev.map(g => {
            if (g.subject === subjectName) {
                return { ...g, [field]: value };
            }
            return g;
        }));
    };

    const handleRemoveSubject = (id: string) => {
        setGrades(prev => prev.filter(g => g.id !== id));
    };

    const renderManualInput = () => {
        const mandatoryForSector = SECTOR_MANDATORY_SUBJECTS[sector];
        const mandatorySubjectsList = mandatoryForSector.map(name => {
            const def = getSubjectByName(name);
            return { name: name, category: 'mandatory', units: def?.defaultUnits || 3 };
        });

        return (
            <div className="space-y-4 animate-in fade-in duration-500">
                {/* Sector Selector */}
                <div className="flex items-center justify-between mb-1.5 px-1">
                    <div className="flex items-center gap-1.5">
                        <Label className="text-sm font-semibold text-[#1d1d1f]">מגזר לימוד</Label>
                        <InfoTooltip contentKey="sector" />
                    </div>
                </div>

                <div className="bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/60 shadow-sm inline-flex w-full relative overflow-hidden">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full relative z-10">
                        {(Object.entries(SECTOR_NAMES) as [Sector, string][]).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setSector(key)}
                                className={`py-2.5 px-4 text-sm font-medium rounded-xl transition-all duration-300 ease-out ${sector === key
                                    ? 'bg-white text-[#1d1d1f] shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-black/5'
                                    : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <InfoBox
                    title={SECTOR_NAMES[sector]}
                    text={`נבחרו מקצועות החובה עבור ${SECTOR_NAMES[sector]}. ניתן להוסיף מקצועות בחירה נוספים ידנית בהמשך.`}
                />

                {/* Mandatory Subjects */}
                <div>
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        מקצועות חובה
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mandatorySubjectsList.map((subject, index) => {
                            // Find existing grade for this subject
                            const existing = grades.find((s: SubjectGrade) => s.subject === subject.name);
                            const grade = existing?.grade || 0;
                            const units = existing?.units || subject.units;

                            return (
                                <BagrutSubjectRow
                                    key={subject.name}
                                    subjectName={subject.name}
                                    grade={grade}
                                    units={units}
                                    isMandatory={true}
                                    onChange={(name, field, value) => handleGradeChange(name, field, value)}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Elective Subjects */}
                <div>
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-gray-500" />
                        מקצועות בחירה / נוספים
                    </h3>

                    <div className="space-y-3">
                        {/* Only render subjects that are NOT in mandatory list to avoid dupes if any overlap */}
                        {grades
                            .filter((s: SubjectGrade) => !mandatorySubjectsList.find(m => m.name === s.subject))
                            .map((subjectGrade: SubjectGrade) => (
                                <BagrutSubjectRow
                                    key={subjectGrade.id}
                                    subjectName={subjectGrade.subject}
                                    grade={subjectGrade.grade}
                                    units={subjectGrade.units}
                                    isMandatory={false}
                                    onChange={(name, field, value) => handleGradeChange(name, field, value)}
                                    onRemove={() => handleRemoveSubject(subjectGrade.id)}
                                />
                            ))
                        }

                        {grades.filter((s: SubjectGrade) => !mandatorySubjectsList.find(m => m.name === s.subject)).length === 0 && (
                            <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed text-sm">
                                לא הוזנו מקצועות בחירה
                            </div>
                        )}

                        <div className="flex gap-3 items-end pt-2">
                            <div className="flex-1">
                                <Label className="text-xs font-medium text-gray-400 mb-1.5 block px-1">הוספת מקצוע בחירה</Label>
                                <select
                                    className="w-full h-11 px-3 border border-gray-200 rounded-2xl bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent transition-all"
                                    value={selectedElective}
                                    onChange={(e) => setSelectedElective(e.target.value)}
                                >
                                    <option value="">בחר מהרשימה...</option>
                                    {availableElectives.map((subj: BagrutSubject) => (
                                        <option key={subj.name} value={subj.name}>{subj.name}</option>
                                    ))}
                                </select>
                            </div>
                            <Button onClick={addElective} disabled={!selectedElective} className="h-11 px-8 rounded-full bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-lg shadow-blue-500/30">
                                <Plus className="h-5 w-5 mr-1.5" /> הוסף
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderUpload = () => (
        <div className="animate-in fade-in zoom-in-95 duration-300">
            <div
                className={`border-3 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all
                        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'}
                    `}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    setIsUploading(true);
                    setTimeout(() => setIsUploading(false), 2000);
                }}
            >
                {isUploading ? (
                    <div className="space-y-4 py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 font-medium">מנתח את קובץ הציונים...</p>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">גרור לכאן את קובץ הציונים</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
                            ניתן להעלות קובץ PDF של גליון הציונים הרשמי ממשרד החינוך
                        </p>
                        <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                            או בחר קובץ מהמחשב
                        </Button>
                    </>
                )}
            </div>

            <InfoBox
                className="mt-6"
                title="איך משיגים את הקובץ?"
                text="ניתן להוריד את גליון הציונים המלא מאתר התלמידים של משרד החינוך (פורטל תלמידים). בחרו באפשרות 'הורדת גליון ציונים' ושמרו כ-PDF."
            />
        </div>
    );

    const renderLink = () => (
        <div className="animate-in fade-in zoom-in-95 duration-300 text-center space-y-8 py-8">
            <div className="max-w-md mx-auto space-y-6">
                <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto rotate-3">
                    <ExternalLink className="w-10 h-10" />
                </div>

                <div>
                    <h3 className="text-xl font-bold text-gray-900">מעבר לפורטל התלמידים</h3>
                    <p className="text-gray-500 mt-2">
                        המערכת שלנו יודעת להתממשק לפורטל משרד החינוך כדי לייבא את הציונים שלך באופן אוטומטי.
                    </p>
                </div>

                <Button
                    className="w-full h-12 text-lg bg-[#FB8C00] hover:bg-[#F57C00] text-white shadow-lg shadow-orange-200"
                    onClick={() => window.open('https://pop.education.gov.il/personal-area/grades/', '_blank')}
                >
                    מעבר לאתר משרד החינוך
                </Button>

                <p className="text-xs text-gray-400">
                    * בלחיצה על הכפתור יפתח חלון חדש
                </p>
            </div>
        </div>
    );

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="flex items-center justify-between text-xl mb-3">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-7 w-7 text-blue-600" />
                        ציוני בגרות
                    </div>
                    {onAutoFill && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onAutoFill}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs font-bold"
                        >
                            ✨ מלא נתונים לדוגמה
                        </Button>
                    )}
                </CardTitle>

                <div className="flex bg-gray-100/50 p-1 rounded-xl mb-4 self-start md:self-auto w-full md:w-auto overflow-x-auto border border-white/50">
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'manual' ? 'bg-white text-[#1d1d1f] shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'}`}
                    >
                        <FileText className="w-4 h-4" />
                        הזנה ידנית
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'upload' ? 'bg-white text-[#1d1d1f] shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'}`}
                    >
                        <UploadCloud className="w-4 h-4" />
                        העלאת קובץ ציונים
                    </button>
                    <button
                        onClick={() => setActiveTab('link')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'link' ? 'bg-white text-[#1d1d1f] shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'}`}
                    >
                        <ExternalLink className="w-4 h-4" />
                        ייבוא ממשרד החינוך
                    </button>
                </div>
            </CardHeader>

            <CardContent className="px-0">
                {activeTab === 'manual' && renderManualInput()}
                {activeTab === 'upload' && renderUpload()}
                {activeTab === 'link' && renderLink()}
            </CardContent>
        </Card>
    );
};
