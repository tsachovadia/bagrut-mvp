import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Alert, AlertDescription } from './ui/shim';
import { Info, Calculator, Target } from 'lucide-react';
import type { PsychometricScores } from '../utils/calculator';

interface PsychometricFormProps {
    onDataUpdate: (data: PsychometricScores) => void;
    initialData?: PsychometricScores;
    onSkip?: () => void;
}

export const PsychometricForm = ({ onDataUpdate, initialData, onSkip }: PsychometricFormProps) => {
    const [formData, setFormData] = useState<PsychometricScores>({
        general: initialData?.general || 0,
        quantitative: initialData?.quantitative || 0,
        verbal: initialData?.verbal || 0,
        english: initialData?.english || 0
    });

    const [hasData, setHasData] = useState(
        !!(initialData?.general || initialData?.quantitative || initialData?.verbal || initialData?.english)
    );

    const updateField = (field: keyof PsychometricScores, value: number) => {
        const newData = { ...formData, [field]: value };
        // Auto specific logic for single score input
        if (field === 'general' && value > 0 && newData.quantitative === 0) {
            // Mock distribution if only general is provided? No, let user input.
        }
        setFormData(newData);
        const hasAnyData = Object.values(newData).some(val => (typeof val === 'number' && val > 0));
        setHasData(hasAnyData);
    };

    const handleSubmit = () => {
        // Adapter: If total is missing but parts are present, or vice versa
        const payload = {
            ...formData,
            total: formData.general // Map general input to total
        };
        onDataUpdate(payload);
    };

    const handleSkip = () => {
        const emptyData: PsychometricScores = { general: 0, quantitative: 0, verbal: 0, english: 0, total: 0 };
        onDataUpdate(emptyData);
    };

    const isFormValid = (formData.general > 0) || (formData.quantitative > 0 && formData.verbal > 0);

    return (
        <div className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600 inline mr-2" />
                <AlertDescription className="text-blue-800 inline">
                    הזן את ציוני הפסיכומטרי שלך לחישוב סיכויי קבלה
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Calculator className="h-5 w-5 text-blue-600" />
                        ציוני פסיכומטרי
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="psychometric-general">ציון כללי</Label>
                            <Input
                                id="psychometric-general"
                                type="number"
                                min="200"
                                max="800"
                                value={formData.general || ''}
                                onChange={(e: any) => updateField('general', parseInt(e.target.value) || 0)}
                                placeholder="לדוגמה: 650"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="psychometric-quantitative">חשיבה כמותית</Label>
                            <Input
                                id="psychometric-quantitative"
                                type="number"
                                min="50"
                                max="150"
                                value={formData.quantitative || ''}
                                onChange={(e: any) => updateField('quantitative', parseInt(e.target.value) || 0)}
                                placeholder="לדוגמה: 120"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="psychometric-verbal">חשיבה מילולית</Label>
                            <Input
                                id="psychometric-verbal"
                                type="number"
                                min="50"
                                max="150"
                                value={formData.verbal || ''}
                                onChange={(e: any) => updateField('verbal', parseInt(e.target.value) || 0)}
                                placeholder="לדוגמה: 120"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="psychometric-english">אנגלית</Label>
                            <Input
                                id="psychometric-english"
                                type="number"
                                min="50"
                                max="150"
                                value={formData.english || ''}
                                onChange={(e: any) => updateField('english', parseInt(e.target.value) || 0)}
                                placeholder="לדוגמה: 120"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button onClick={handleSubmit} className="w-full">
                            חשב סיכויי קבלה
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
