import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Calculator, Target } from 'lucide-react';

export interface PsychometricData {
  total: number;
  quantitative: number;
  verbal: number;
  english: number;
}

interface PsychometricFormProps {
  onDataUpdate: (data: PsychometricData) => void;
  initialData?: PsychometricData;
  onSkip?: () => void;
}

export const PsychometricForm = ({ onDataUpdate, initialData, onSkip }: PsychometricFormProps) => {
  const [formData, setFormData] = useState<PsychometricData>({
    total: initialData?.total || 0,
    quantitative: initialData?.quantitative || 0,
    verbal: initialData?.verbal || 0,
    english: initialData?.english || 0
  });

  const [hasData, setHasData] = useState(
    !!(initialData?.total || initialData?.quantitative || initialData?.verbal || initialData?.english)
  );

  const updateField = (field: keyof PsychometricData, value: number) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Check if user has any psychometric data
    const hasAnyData = Object.values(newData).some(val => val > 0);
    setHasData(hasAnyData);
  };

  const handleSubmit = () => {
    onDataUpdate(formData);
  };

  const handleSkip = () => {
    // Submit empty data
    const emptyData: PsychometricData = { total: 0, quantitative: 0, verbal: 0, english: 0 };
    onDataUpdate(emptyData);
  };

  const isFormValid = formData.total > 0 || formData.quantitative > 0 || formData.verbal > 0 || formData.english > 0;

  return (
    <div className="space-y-6">
      {/* Explanation Section */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              למה אנחנו צריכים את ציוני הפסיכומטרי?
            </h4>
            <ul className="space-y-1 text-sm">
              <li>• <strong>חישוב סכם מדויק:</strong> כל אוניברסיטה משתמשת בנוסחת סכם שונה המשלבת בגרות ופסיכומטרי</li>
              <li>• <strong>דיוק התוצאות:</strong> בלי פסיכומטרי לא נוכל לתת לך תוצאות מדויקות</li>
              <li>• <strong>המלצות מותאמות:</strong> נוכל להמליץ על תוכניות שמתאימות לפרופיל שלך</li>
            </ul>
            <p className="text-sm font-medium mt-2">
              אם אין לך ציון פסיכומטרי כרגע, אתה יכול לדלג ולחזור מאוחר יותר
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calculator className="h-5 w-5 text-primary" />
            ציוני פסיכומטרי
          </CardTitle>
          <p className="text-muted-foreground">
            הזן את ציוני הפסיכומטרי שלך. אם יש לך רק חלק מהציונים, זה בסדר - הזן מה שיש לך
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="psychometric-total" className="font-semibold">
                ציון כללי
                <span className="text-sm font-normal text-muted-foreground block">
                  הציון הכללי שמופיע בתעודה
                </span>
              </Label>
              <Input
                id="psychometric-total"
                type="number"
                min="200"
                max="800"
                value={formData.total || ''}
                onChange={(e) => updateField('total', parseInt(e.target.value) || 0)}
                placeholder="לדוגמה: 650"
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="psychometric-quantitative" className="font-semibold">
                חשיבה כמותית
                <span className="text-sm font-normal text-muted-foreground block">
                  חשוב במיוחד להנדסה ומדעים מדויקים
                </span>
              </Label>
              <Input
                id="psychometric-quantitative"
                type="number"
                min="200"
                max="800"
                value={formData.quantitative || ''}
                onChange={(e) => updateField('quantitative', parseInt(e.target.value) || 0)}
                placeholder="לדוגמה: 700"
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="psychometric-verbal" className="font-semibold">
                חשיבה מילולית
                <span className="text-sm font-normal text-muted-foreground block">
                  חשוב לתחומי חברה ומשפטים
                </span>
              </Label>
              <Input
                id="psychometric-verbal"
                type="number"
                min="200"
                max="800"
                value={formData.verbal || ''}
                onChange={(e) => updateField('verbal', parseInt(e.target.value) || 0)}
                placeholder="לדוגמה: 600"
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="psychometric-english" className="font-semibold">
                אנגלית
                <span className="text-sm font-normal text-muted-foreground block">
                  נדרש ברוב האוניברסיטאות
                </span>
              </Label>
              <Input
                id="psychometric-english"
                type="number"
                min="200"
                max="800"
                value={formData.english || ''}
                onChange={(e) => updateField('english', parseInt(e.target.value) || 0)}
                placeholder="לדוגמה: 550"
                className="text-lg"
              />
            </div>
          </div>

          {/* Status indicators */}
          {hasData && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  מצוין! עם ציוני הפסיכומטרי נוכל לתת לך תוצאות מדויקות
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {isFormValid ? (
              <Button 
                onClick={handleSubmit}
                className="flex-1 bg-primary text-white hover:bg-primary/90 h-12 text-lg"
              >
                המשך עם הציונים
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button 
                  onClick={handleSkip}
                  variant="outline"
                  className="flex-1 h-12 text-lg border-muted-foreground/30"
                >
                  דלג לעת עתה (אפשר לחזור מאוחר יותר)
                </Button>
              </div>
            )}
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              💡 <strong>טיפ:</strong> אם אין לך פסיכומטרי, עדיין נוכל לתת לך מידע רב ערך על בסיס ציוני הבגרות
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};