import { useState, useEffect } from 'react';
import { isProduction } from '../utils/env';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from './ui/shim';
import { Plus, Trash2, GraduationCap, UploadCloud, FileText, ExternalLink, BookOpen, AlertCircle, RefreshCw, Sparkles, ChevronDown } from 'lucide-react';
import { SECTOR_MANDATORY_SUBJECTS, SECTOR_NAMES, type Sector, getSubjectByName, ELECTIVE_SUBJECTS, type BagrutSubject } from '../utils/subjects';
import type { SubjectGrade } from '../utils/calculator';
import { InfoBox } from './ui/InfoBox';
import { calculateBonus } from '../utils/bonuses';
import { BagrutSubjectCard } from './ui/BagrutSubjectCard';
import { GradeEditDrawer } from './ui/GradeEditDrawer';
import { GradeUpload } from './GradeUpload';
import { DynamicInfoSidepanel } from './DynamicInfoSidepanel';
import { AverageDisplay } from './AverageDisplay';

interface BagrutFormProps {
    onDataUpdate: (grades: SubjectGrade[]) => void;
    initialData?: SubjectGrade[];
    fillSampleData?: () => void;
    variant?: 'default' | 'compact';
    sector: Sector;
    onSectorChange: (sector: Sector) => void;
    initialTab?: InputMethod;
}

type InputMethod = 'manual' | 'upload' | 'link';

export const BagrutForm = ({ onDataUpdate, initialData, fillSampleData, variant = 'default', sector, onSectorChange, initialTab = 'manual' }: BagrutFormProps) => {
    const [activeTab, setActiveTab] = useState<InputMethod>(initialTab);
    // const [sector, setSector] = useState<Sector>('mamlachti'); // Lifted

    const [grades, setGrades] = useState<SubjectGrade[]>(initialData || []);

    const [availableElectives] = useState(ELECTIVE_SUBJECTS);
    const [selectedElective, setSelectedElective] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);

    // State for Drawer
    const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

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

    const handleSaveGrade = (grade: number, units: number) => {
        if (!editingSubjectId) return;

        setGrades(prev => prev.map(g => {
            if (g.id === editingSubjectId) {
                return { ...g, grade, units };
            }
            return g;
        }));
    };

    const handleRemoveSubject = () => {
        if (!editingSubjectId) return;
        setGrades(prev => prev.filter(g => g.id !== editingSubjectId));
        setEditingSubjectId(null);
    };

    const addElective = () => {
        if (!selectedElective) return;
        const subjectDef = getSubjectByName(selectedElective);
        if (!subjectDef) return;

        const newId = `elective-${Date.now()}`;
        const newGrade: SubjectGrade = {
            id: newId,
            subject: subjectDef.name,
            units: subjectDef.defaultUnits || 5,
            grade: 0
        };

        setGrades(prev => [...prev, newGrade]);
        setSelectedElective('');
        // Optional: Immediately open drawer for the new elective
        // setEditingSubjectId(newId); 
    };

    const handleScanError = (errorMessage: string) => {
        setScanError(errorMessage);
        setActiveTab('manual');
    };

    // Helper to find currently editing subject
    const activeSubject = grades.find(g => g.id === editingSubjectId);

    const renderManualInput = () => {
        return (
            <div className={`space-y-6 ${variant === 'compact' ? 'space-y-4' : ''} pb-24`}>
                {scanError && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 relative group">
                        <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-orange-800">
                                {scanError}
                            </p>
                        </div>
                        <button
                            onClick={() => setScanError(null)}
                            className="text-orange-400 hover:text-orange-600 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Sector Selection */}
                <div className="relative">
                    <Label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">מגזר בית הספר</Label>
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
                <div className="space-y-3">
                    <h3 className="font-bold flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider">
                        מקצועות חובה
                    </h3>
                    <div className="space-y-2">
                        {grades.filter(g => SECTOR_MANDATORY_SUBJECTS[sector].includes(g.subject)).map((gradeItem) => (
                            <BagrutSubjectCard
                                key={gradeItem.id}
                                subjectName={gradeItem.subject}
                                grade={gradeItem.grade}
                                units={gradeItem.units}
                                onClick={() => setEditingSubjectId(gradeItem.id)}
                                isMandatory={true}
                            />
                        ))}
                    </div>
                </div>

                {/* Electives */}
                <div className="space-y-3 pt-2">
                    <h3 className="font-bold flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider">
                        מגמות הרחבה
                    </h3>

                    {/* Add Elective Row */}
                    <div className="flex gap-2 mb-2">
                        <div className="relative flex-1">
                            <select
                                value={selectedElective}
                                onChange={(e) => setSelectedElective(e.target.value)}
                                className="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            >
                                <option value="">בחר מגמה להוספה...</option>
                                {availableElectives.filter(s => !grades.some(g => g.subject === s.name)).map(subject => (
                                    <option key={subject.name} value={subject.name}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <Button
                            onClick={addElective}
                            disabled={!selectedElective}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border border-blue-100 shadow-sm w-12 p-0 rounded-xl"
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {grades.filter(g => !SECTOR_MANDATORY_SUBJECTS[sector].includes(g.subject)).map((gradeItem) => (
                            <BagrutSubjectCard
                                key={gradeItem.id}
                                subjectName={gradeItem.subject}
                                grade={gradeItem.grade}
                                units={gradeItem.units}
                                onClick={() => setEditingSubjectId(gradeItem.id)}
                                isMandatory={false}
                            />
                        ))}
                    </div>

                    {/* Empty State for Electives if none */}
                    {grades.filter(g => !SECTOR_MANDATORY_SUBJECTS[sector].includes(g.subject)).length === 0 && (
                        <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                            <p className="text-sm text-gray-400">לא הוספו מגמות</p>
                        </div>
                    )}
                </div>

                {/* Drawer Component */}
                <GradeEditDrawer
                    isOpen={!!editingSubjectId}
                    onClose={() => setEditingSubjectId(null)}
                    subjectName={activeSubject?.subject || ''}
                    initialGrade={activeSubject?.grade || 0}
                    initialUnits={activeSubject?.units || 3}
                    onSave={handleSaveGrade}
                    // Only pass remove if not mandatory
                    onRemove={activeSubject && !SECTOR_MANDATORY_SUBJECTS[sector].includes(activeSubject.subject) ? handleRemoveSubject : undefined}
                    isMandatory={activeSubject && SECTOR_MANDATORY_SUBJECTS[sector].includes(activeSubject.subject)}
                />
            </div>
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
        <GradeUpload
            onGradesExtracted={handleExtractedGrades}
            onSwitchToManual={() => setActiveTab('manual')}
            onScanError={handleScanError}
        />
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
                <div className="flex bg-gray-100/50 p-1 rounded-xl self-start md:self-auto w-full md:w-auto overflow-x-auto border border-white/50 mb-4">
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

            <CardContent className="p-0 px-1">
                {activeTab === 'manual' && renderManualInput()}
                {activeTab === 'upload' && renderUpload()}
                {activeTab === 'link' && renderLink()}
            </CardContent>
        </Card>
    );
};
