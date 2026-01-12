import { useState, useRef } from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { ProcessModal } from './ProcessModal';
import { GradeVerificationModal } from './GradeVerificationModal';
import { Button } from './ui/shim';
import type { SubjectGrade } from '../utils/calculator';
import { InfoBox } from './ui/InfoBox';

interface GradeUploadProps {
    onGradesExtracted: (grades: SubjectGrade[]) => void;
    onSwitchToManual: () => void;
    onScanError?: (error: string) => void;
}

export const GradeUpload = ({ onGradesExtracted, onSwitchToManual, onScanError }: GradeUploadProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Process Modal State
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [extractionPhase, setExtractionPhase] = useState<'scanning' | 'processing' | 'complete'>('scanning');
    const [rawDebugText, setRawDebugText] = useState<string>('');
    const [jsonDebugData, setJsonDebugData] = useState<any>(null);

    const [error, setError] = useState<string | null>(null);
    const [pendingGrades, setPendingGrades] = useState<SubjectGrade[]>([]);
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file) return;

        // Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setError('אנא העלה קובץ תמונה (JPG, PNG) או PDF');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('הקובץ גדול מדי. הגודל המקסימלי הוא 10MB');
            return;
        }

        setError(null);
        setIsUploading(true);
        setExtractionPhase('scanning');
        setRawDebugText('');     // Reset debug
        setJsonDebugData(null);  // Reset debug
        setIsProcessModalOpen(true); // Open Modal

        try {
            // Convert to Base64
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            // --- PHASE 1: OCR ---
            console.log("Starting Phase 1: OCR via Google Gemini 2.0...");
            const ocrResponse = await fetch('/api/ocr/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileBase64: base64 })
            });

            if (!ocrResponse.ok) throw new Error('שגיאה בסריקת המסמך (Phase 1)');
            const ocrData = await ocrResponse.json();
            const rawText = ocrData.rawText;

            setRawDebugText(rawText); // Update Debug View

            if (!rawText) throw new Error('לא זוהה טקסט במסמך');

            // --- PHASE 2: PROCESSING ---
            setExtractionPhase('processing');
            console.log("Starting Phase 2: Normalization...");

            const normResponse = await fetch('/api/ocr/normalize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawText })
            });

            if (!normResponse.ok) throw new Error('שגיאה בפענוח הציונים (Phase 2)');
            const normData = await normResponse.json();

            setJsonDebugData(normData); // Update Debug View

            if (!Array.isArray(normData.grades) || normData.grades.length === 0) {
                // We DON'T throw here immediately so user can see the debug info if they want?
                // Or we throw to show error?
                // User asked to see results. If empty array, we show that in JSON tab.
                throw new Error('לא זוהו ציונים בקובץ. נסה תמונה ברורה יותר.');
            }

            // --- COMPLETE ---
            setExtractionPhase('complete');
            await new Promise(r => setTimeout(r, 1500)); // Longer delay to let user see "Complete" and potentially debug info

            // Map to internal structure
            const mappedGrades: SubjectGrade[] = normData.grades.map((g: any, index: number) => ({
                id: `extracted-${Date.now()}-${index}`,
                subject: g.subject,
                units: g.units || 3,
                grade: g.grade || 0,
                semel: g.semel,
                examDate: g.examDate
            }));

            setPendingGrades(mappedGrades);
            setIsProcessModalOpen(false); // Close Process Modal
            setIsVerificationModalOpen(true); // Open Verification Modal

        } catch (err: any) {
            console.error(err);
            // setError(err.message || 'אירעה שגיאה בעת הפענוח. נסה שנית.');
            setIsUploading(false);

            if (onScanError) {
                // If parent provided error handler, use it:
                // 1. Close modal
                setIsProcessModalOpen(false);
                // 2. Notify parent (which will switch tab and show banner)
                onScanError('אופס, נתקלנו בבעיה זמנית בסריקת הקובץ. לא נורא, אפשר להזין את הציונים ידנית 👇');
            } else {
                // Fallback to old behavior (keep modal open with error)
                setError(err.message || 'אירעה שגיאה בעת הפענוח. נסה שנית.');
                setIsProcessModalOpen(true);
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleModalSave = (finalGrades: SubjectGrade[]) => {
        setIsVerificationModalOpen(false);
        setIsUploading(false);
        onGradesExtracted(finalGrades);
    };

    return (
        <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">

            <ProcessModal
                isOpen={isProcessModalOpen}
                phase={extractionPhase}
                rawText={rawDebugText}
                extractedJson={jsonDebugData}
                error={error}
                onClose={() => { setIsProcessModalOpen(false); setIsUploading(false); }}
            />

            <GradeVerificationModal
                isOpen={isVerificationModalOpen}
                initialGrades={pendingGrades}
                onClose={() => { setIsVerificationModalOpen(false); setIsUploading(false); }}
                onSwitchToManual={onSwitchToManual}
                onSave={handleModalSave}
            />

            <div
                className={`border-3 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer overflow-hidden relative
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
                onClick={() => !isUploading && fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">גרור לכאן צילום של גליון הציונים</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6 leading-relaxed">
                    המערכת תפענח את הציונים אוטומטית (Gemini 2.0).<br />
                    תומך בתמונות (JPG, PNG) וקבצי PDF
                </p>
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 pointer-events-none">
                    או בחר קובץ מהמחשב
                </Button>
            </div>

            {error && (
                <div className="border border-red-200 bg-red-50 rounded-lg p-4 flex items-start gap-3 text-right animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-sm text-red-800">שגיאה בהעלאה</h4>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
            )}

            {!isUploading && !isVerificationModalOpen && (
                <InfoBox
                    title="איך זה עובד?"
                    text="המערכת סורקת את הקובץ בשני שלבים: זיהוי טקסט (OCR) וניתוח ציונים החכם של Gemini 2.0. בסיום תוכלו לאמת ולערוך את הנתונים."
                />
            )}
        </div>
    );
};
