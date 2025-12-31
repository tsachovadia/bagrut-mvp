import { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/shim';
import type { SubjectGrade } from '../utils/calculator';
import { InfoBox } from './ui/InfoBox';

interface GradeUploadProps {
    onGradesExtracted: (grades: SubjectGrade[]) => void;
}

export const GradeUpload = ({ onGradesExtracted }: GradeUploadProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file) return;

        // Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setError('אנא העלה קובץ תמונה (JPG, PNG) או PDF');
            return;
        }

        if (file.size > 4 * 1024 * 1024) { // 4MB Limit (Vercel limit is 4.5MB)
            setError('הקובץ גדול מדי. הגודל המקסימלי הוא 4MB');
            return;
        }

        setError(null);
        setIsUploading(true);

        try {
            // Convert to Base64
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            // Call API
            const response = await fetch('/api/extract-grades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileBase64: base64,
                    fileType: file.type
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'שגיאה בעיבוד הקובץ');
            }

            if (!Array.isArray(data.grades) || data.grades.length === 0) {
                throw new Error('לא זוהו ציונים בקובץ. נסה תמונה ברורה יותר.');
            }

            // Map to internal structure
            const mappedGrades: SubjectGrade[] = data.grades.map((g: any, index: number) => ({
                id: `uploaded-${Date.now()}-${index}`,
                subject: g.subject,
                units: g.units || 3,
                grade: g.grade || 0
            }));

            onGradesExtracted(mappedGrades);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'אירעה שגיאה בעת הפענוח. נסה שנית.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
            <div
                className={`border-3 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer
                    ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-blue-300'}
                    ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                `}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.[0]) {
                        handleFile(e.dataTransfer.files[0]);
                    }
                }}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                {isUploading ? (
                    <div className="space-y-4 py-8">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                        <div>
                            <p className="text-gray-800 font-bold text-lg">מעבד את הקובץ...</p>
                            <p className="text-gray-500 text-sm">זה עשוי לקחת מספר שניות</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">גרור לכאן צילום של גליון הציונים</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
                            תומך בתמונות (JPG, PNG) וקבצי PDF בגודל עד 4MB
                        </p>
                        <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 pointer-events-none">
                            או בחר קובץ מהמחשב
                        </Button>
                    </>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-right">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-red-800 text-sm">שגיאה בהעלאה</h4>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                </div>
            )}

            <InfoBox
                title="איך זה עובד?"
                text="המערכת משתמשת בבינה מלאכותית כדי לקרוא את הציונים מהתמונה. מומלץ להעלות צילום ברור ומואר של טבלת הציונים המלאה. תמיד כדאי לעבור על הנתונים ולוודא שהם נקלטו נכון."
            />
        </div>
    );
};
