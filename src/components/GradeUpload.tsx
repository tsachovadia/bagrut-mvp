import { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { InteractiveLoader } from './InteractiveLoader';
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
                className={`border-3 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer overflow-hidden relative
                    ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-blue-300'}
                    ${isUploading ? 'opacity-100 pointer-events-none border-blue-200 bg-white' : ''}
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
                onClick={() => !isUploading && fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                {isUploading ? (
                    <div className="py-4 w-full h-full flex items-center justify-center min-h-[300px]">
                        <InteractiveLoader />
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">גרור לכאן צילום של גליון הציונים</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6 leading-relaxed">
                            המערכת תפענח את הציונים אוטומטית.<br />
                            תומך בתמונות (JPG, PNG) וקבצי PDF
                        </p>
                        <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 pointer-events-none">
                            או בחר קובץ מהמחשב
                        </Button>
                    </>
                )}
            </div>

            {error && (
                <div className={`border rounded-lg p-4 flex items-start gap-3 text-right animate-in slide-in-from-top-2 ${error.includes('High traffic') || error.includes('1 minute')
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                    {error.includes('High traffic') || error.includes('1 minute') ? (
                        <div className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5 font-bold">⚠️</div>
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                        <h4 className={`font-bold text-sm ${error.includes('High traffic') || error.includes('1 minute') ? 'text-yellow-800' : 'text-red-800'
                            }`}>
                            {error.includes('High traffic') || error.includes('1 minute') ? 'עומס זמני' : 'שגיאה בהעלאה'}
                        </h4>
                        <p className={`text-sm ${error.includes('High traffic') || error.includes('1 minute') ? 'text-yellow-700' : 'text-red-600'
                            }`}>
                            {error.includes('High traffic') || error.includes('1 minute')
                                ? 'יש עומס כרגע על מערכת הפענוח. אנא נסה שוב בעוד דקה.'
                                : error
                            }
                        </p>
                    </div>
                </div>
            )}

            {!isUploading && (
                <InfoBox
                    title="איך זה עובד?"
                    text="המערכת משתמשת בבינה מלאכותית המתקדמת ביותר (Gemini 2.0) כדי לקרוא את הציונים גם מצילומים לא מושלמים. בזמן ההמתנה, נשמח להכיר אותך קצת יותר!"
                />
            )}
        </div>
    );
};
