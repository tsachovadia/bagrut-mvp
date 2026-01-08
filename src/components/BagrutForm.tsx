import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from './ui/shim';
import { Plus, Trash2, GraduationCap, UploadCloud, FileText, ExternalLink, BookOpen, AlertCircle, RefreshCw, Sparkles, ChevronDown } from 'lucide-react';
import { SECTOR_MANDATORY_SUBJECTS, SECTOR_NAMES, type Sector, getSubjectByName, ELECTIVE_SUBJECTS, type BagrutSubject } from '../utils/subjects';
import type { SubjectGrade } from '../utils/calculator';
import { InfoBox } from './ui/InfoBox';
import { calculateBonus } from '../utils/bonuses';
import { BagrutSubjectRow } from './BagrutSubjectRow';
import { GradeUpload } from './GradeUpload';
import { DynamicInfoSidepanel } from './DynamicInfoSidepanel';
import { AverageDisplay } from './AverageDisplay';

interface BagrutFormProps {
    onDataUpdate: (grades: SubjectGrade[]) => void;
    initialData?: SubjectGrade[];
    onAutoFill?: () => void;
    variant?: 'default' | 'compact';
    sector: Sector;
    onSectorChange: (sector: Sector) => void;
}

type InputMethod = 'manual' | 'upload' | 'link';

export const BagrutForm = ({ onDataUpdate, initialData, onAutoFill, variant = 'default', sector, onSectorChange }: BagrutFormProps) => {
    const [activeTab, setActiveTab] = useState<InputMethod>('manual');
    // const [sector, setSector] = useState<Sector>('mamlachti'); // Lifted

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

    const renderManualInput = () => {
        // Main Content - Form inputs (Right side on PC)
        const formContent = (
            <div className={`space-y-4 ${variant === 'compact' ? 'space-y-2' : ''}`}>
                {/* Mobile Average Display - Removed (Lifted to Wizard) */}

                {/* Sector Selection (Dropdown Picker) */}
                <div className="relative">
                    <Label className="text-xs font-bold text-gray-500 mb-1.5 block">מגזר בית הספר</Label>
                    <div className="relative">
                        <select
                            value={sector}
                            onChange={(e) => onSectorChange(e.target.value as Sector)}
                            className="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        >
                            {(Object.entries(SECTOR_NAMES) as [Sector, string][]).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Mandatory Subjects */}
                <div className="space-y-2">
                    <h3 className={`font-bold flex items-center gap-2 ${variant === 'compact' ? 'text-xs text-gray-400 uppercase tracking-wider' : 'text-gray-800'}`}>
                        {variant !== 'compact' && <BookOpen className="w-4 h-4 text-blue-500" />}
                        מקצועות חובה
                    </h3>
                    <div className="grid gap-2 md:grid-cols-2 md:gap-x-4 md:gap-y-3">
                        {grades.filter(g => {
                            const isMandatory = SECTOR_MANDATORY_SUBJECTS[sector].includes(g.subject);
                            return isMandatory;
                        }).map((gradeItem) => (
                            <BagrutSubjectRow
                                key={gradeItem.id}
                                subjectName={gradeItem.subject}
                                grade={gradeItem.grade}
                                units={gradeItem.units}
                                onChange={(name, field, val) => handleGradeChange(name, field, val)}
                                isMandatory={true}
                            />
                        ))}
                    </div>
                </div>

                {/* Electives */}
                <div className="space-y-2 pt-2">
                    <h3 className={`font-bold flex items-center gap-2 ${variant === 'compact' ? 'text-xs text-gray-400 uppercase tracking-wider' : 'text-gray-800'}`}>
                        {variant !== 'compact' && <Sparkles className="w-4 h-4 text-amber-500" />}
                        מגמות הרחבה
                    </h3>

                    {/* Add Elective Row */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <select
                                value={selectedElective}
                                onChange={(e) => setSelectedElective(e.target.value)}
                                className={`w-full appearance-none border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${variant === 'compact' ? 'text-xs h-8 px-2 border-gray-200' : 'p-2 border-gray-200 pr-2 pl-8'}`}
                            >
                                <option value="">בחר מגמה להוספה...</option>
                                {availableElectives.filter(s => !grades.some(g => g.subject === s.name)).map(subject => (
                                    <option key={subject.name} value={subject.name}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                            {variant !== 'compact' && (
                                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            )}
                        </div>
                        <Button
                            onClick={addElective}
                            disabled={!selectedElective}
                            variant="outline"
                            className={`${variant === 'compact' ? 'h-8 w-8 p-0' : ''} border-blue-200 hover:bg-blue-50 text-blue-600`}
                        >
                            <Plus className="w-4 h-4" />
                            {variant !== 'compact' && "הוסף"}
                        </Button>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2 md:gap-x-4 md:gap-y-3">
                        {grades.filter(g => !SECTOR_MANDATORY_SUBJECTS[sector].includes(g.subject)).map((gradeItem) => (
                            <BagrutSubjectRow
                                key={gradeItem.id}
                                subjectName={gradeItem.subject}
                                grade={gradeItem.grade}
                                units={gradeItem.units}
                                onChange={(name, field, val) => handleGradeChange(name, field, val)}
                                onRemove={() => removeGrade(gradeItem.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );

        if (variant === 'compact') return formContent;

        // Default Variant Layout with Side Panel
        return (
            <Card className="border-gray-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row h-[65vh]"> {/* Constraint height for layout */}

                        {/* Right Column (Form) - Scrollable */}
                        {/* In RTL flex-row, first child is Right. */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            {formContent}
                        </div>

                        {/* Left Column (Info Panel) - Sticky/Fixed height */}
                        {/* Visually left in RTL means it should be the 2nd child in DOM if direction is RTL? */}
                        {/* Actually standard flex-row in RTL: Start (Right) -> End (Left). */}
                        {/* So if we want Panel on Left, it should be the second child. */}
                        <div className="hidden md:flex w-80 bg-blue-50/30 border-r border-gray-100 p-4 flex-col gap-4">
                            {/* AverageDisplay removed from here - moved to WizardContainer */}
                            <div className="flex-1 overflow-hidden">
                                <DynamicInfoSidepanel sector={sector} grades={grades} hasGrades={grades.some(g => g.grade > 0)} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };


    const handleExtractedGrades = (extractedGrades: SubjectGrade[]) => {
        setGrades(prev => {
            const newGrades = [...prev];

            extractedGrades.forEach(extracted => {
                const existingIndex = newGrades.findIndex(g => g.subject === extracted.subject);

                if (existingIndex >= 0) {
                    // Update existing
                    newGrades[existingIndex] = {
                        ...newGrades[existingIndex],
                        grade: extracted.grade,
                        units: extracted.units
                    };
                } else {
                    // Add new (likely elective)
                    newGrades.push({
                        ...extracted,
                        id: `extracted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                    });
                }
            });

            return newGrades;
        });

        // Switch to manual view to show results and show success message (optional)
        setActiveTab('manual');
    };

    const renderUpload = () => (
        <GradeUpload onGradesExtracted={handleExtractedGrades} />
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
            {/* Header is ONLY for tabs now. Title was redundant inside specific variants usually, or we can keep it. */}
            <CardHeader className="p-0 space-y-0 text-right">
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

                <div className="flex bg-gray-100/50 p-1 rounded-xl self-start md:self-auto w-full md:w-auto overflow-x-auto border border-white/50">
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

            <CardContent className="p-0 mt-4">
                {/* mt-4 to add back some space ONLY inside the logic if needed, but keeping it tight for now */}
                {activeTab === 'manual' && renderManualInput()}
                {activeTab === 'upload' && renderUpload()}
                {activeTab === 'link' && renderLink()}
            </CardContent>
        </Card>
    );
};
