import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Alert, AlertDescription } from './ui/shim';
import { Info, Calculator, Target, ExternalLink, HelpCircle } from 'lucide-react';
import type { PsychometricScores } from '../utils/calculator';
import { InfoBox } from './ui/InfoBox';

interface PsychometricFormProps {
    onDataUpdate: (data: PsychometricScores) => void;
    initialData?: PsychometricScores;
    onSkip?: () => void;
}

export const PsychometricForm = ({ onDataUpdate, initialData, onSkip }: PsychometricFormProps) => {
    // Determine initial state based on data presence
    const hasInitialData = !!(initialData?.general && initialData.general > 0);
    const [hasScore, setHasScore] = useState<boolean | null>(hasInitialData ? true : null);

    const [formData, setFormData] = useState<PsychometricScores>({
        general: initialData?.general || 0,
        quantitative: initialData?.quantitative || 0,
        verbal: initialData?.verbal || 0,
        english: initialData?.english || 0
    });

    // Real-time update to parent
    useEffect(() => {
        if (hasScore === false) {
            onDataUpdate({ general: 0, quantitative: 0, verbal: 0, english: 0, total: 0 });
        } else if (hasScore === true) {
            onDataUpdate({
                ...formData,
                total: formData.general // Verify if total is needed separately
            });
        }
    }, [formData, hasScore, onDataUpdate]);

    const updateField = (field: keyof PsychometricScores, value: number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const renderQuestion = () => (
        <div className="text-center space-y-3 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-blue-100">
                <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-[#1d1d1f]">האם יש לך ציון פסיכומטרי?</h3>
            <p className="text-gray-500 max-w-sm mx-auto leading-relaxed text-sm">
                הציון הפסיכומטרי הוא מרכיב משמעותי בחישוב סיכויי הקבלה למרבית התארים האקדמיים.
            </p>

            <div className="flex gap-2 justify-center mt-3">
                <Button
                    onClick={() => setHasScore(true)}
                    className="flex-1 max-w-[140px] h-auto py-2.5 rounded-xl bg-[#0071E3] text-white font-semibold text-sm shadow-md shadow-blue-500/30 hover:bg-[#0077ED] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border-0"
                >
                    כן, יש לי
                </Button>
                <Button
                    variant="outline"
                    onClick={() => setHasScore(false)}
                    className="flex-1 max-w-[140px] h-auto py-2.5 rounded-xl bg-white text-[#1d1d1f] font-semibold text-sm border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                    עדיין לא
                </Button>
            </div>
        </div>
    );

    const renderInputs = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    הזנת ציונים
                </h3>
                <Button
                    variant="ghost"
                    onClick={() => setHasScore(false)}
                    className="text-xs text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 px-3 rounded-full"
                >
                    מחק ציונים וחדש
                </Button>
            </div>

            <InfoBox
                title="מהו ציון פסיכומטרי?"
                text="הציון הפסיכומטרי מורכב מ-3 תחומים: חשיבה מילולית, חשיבה כמותית ואנגלית. הציון הכללי נע בין 200 ל-800."
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="space-y-1">
                    <Label htmlFor="psychometric-general" className="text-xs font-medium text-[#1d1d1f] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 block"></span>
                        ציון כללי
                    </Label>
                    <Input
                        id="psychometric-general"
                        type="number"
                        className="h-9 text-sm font-medium bg-white/60 border-blue-200 focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10"
                        min="200"
                        max="800"
                        value={formData.general || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('general', parseInt(e.target.value) || 0)}
                        placeholder="600"
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="psychometric-quantitative" className="text-xs font-medium text-gray-500">כמותי</Label>
                    <Input
                        id="psychometric-quantitative"
                        type="number"
                        className="h-9 bg-white/40 border-gray-200 focus:border-gray-400 text-sm"
                        min="50"
                        max="150"
                        value={formData.quantitative || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('quantitative', parseInt(e.target.value) || 0)}
                        placeholder="120"
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="psychometric-verbal" className="text-xs font-medium text-gray-500">מילולי</Label>
                    <Input
                        id="psychometric-verbal"
                        type="number"
                        className="h-9 bg-white/40 border-gray-200 focus:border-gray-400 text-sm"
                        min="50"
                        max="150"
                        value={formData.verbal || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('verbal', parseInt(e.target.value) || 0)}
                        placeholder="120"
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="psychometric-english" className="text-xs font-medium text-gray-500">אנגלית</Label>
                    <Input
                        id="psychometric-english"
                        type="number"
                        className="h-9 bg-white/40 border-gray-200 focus:border-gray-400 text-sm"
                        min="50"
                        max="150"
                        value={formData.english || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('english', parseInt(e.target.value) || 0)}
                        placeholder="120"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-center">
                <a
                    href="https://www.nite.org.il/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors font-medium"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    לאתר המרכז הארצי לבחינות והערכה (NITE)
                </a>
            </div>
        </div>
    );

    const renderNoScoreMessage = () => (
        <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-gray-100">
                <Target className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#1d1d1f]">הכל בסדר!</h3>
            <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                עדיין ניתן לחשב סיכויי קבלה על סמך הבגרויות בלבד עבור חלק מהמסלולים, או להשתמש בסימולטור שלנו כדי לבדוק איזה ציון תצטרך.
            </p>

            <div className="flex justify-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => setHasScore(null)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                    תיקון: יש לי ציון
                </Button>
            </div>

            <div className="bg-orange-50/50 backdrop-blur-sm border border-orange-100 rounded-2xl p-5 mt-6 max-w-md mx-auto text-right shadow-sm">
                <h4 className="font-semibold text-orange-800 text-sm mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    טיפ
                </h4>
                <p className="text-sm text-orange-800/80 leading-relaxed">
                    רוב האוניברסיטאות דורשות ציון פסיכומטרי לקבלה לפקולטות המבוקשות (הנדסה, מדעי המחשב, רפואה).
                </p>
            </div>
        </div>
    );

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="px-0">
                {hasScore === null && renderQuestion()}
                {hasScore === true && renderInputs()}
                {hasScore === false && renderNoScoreMessage()}
            </CardContent>
        </Card>
    );
};

