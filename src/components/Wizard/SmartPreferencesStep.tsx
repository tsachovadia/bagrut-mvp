import { useState } from 'react';
import { cn } from '../../lib/utils';

const FIELD_OPTIONS = [
    'מדעי המחשב',
    'הנדסה',
    'רפואה',
    'משפטים',
    'פסיכולוגיה',
    'כלכלה וניהול',
    'ביולוגיה',
    'חינוך',
    'אדריכלות',
    'מדעי החברה',
    'תקשורת',
    'אמנות ועיצוב',
];

interface SmartPreferencesStepProps {
    preferences: {
        fields: string[];
        institutions: string[];
        isUndecided: boolean;
    };
    onUpdate: (prefs: { fields: string[]; institutions: string[]; isUndecided: boolean }) => void;
}

export function SmartPreferencesStep({ preferences, onUpdate }: SmartPreferencesStepProps) {
    const [isUndecided, setIsUndecided] = useState(preferences.isUndecided);

    const toggleField = (field: string) => {
        if (isUndecided) {
            setIsUndecided(false);
            onUpdate({ ...preferences, fields: [field], isUndecided: false });
            return;
        }
        const newFields = preferences.fields.includes(field)
            ? preferences.fields.filter(f => f !== field)
            : [...preferences.fields, field];
        onUpdate({ ...preferences, fields: newFields, isUndecided: false });
    };

    const handleUndecided = () => {
        const next = !isUndecided;
        setIsUndecided(next);
        onUpdate({ ...preferences, fields: [], isUndecided: next });
    };

    return (
        <div className="space-y-5 py-2" dir="rtl">
            {/* Question */}
            <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-800">מה התחומים שמעניינים אותך?</h3>
                <p className="text-xs text-gray-400">אפשר לבחור כמה שרוצים. לא בטוח? אפשר לדלג.</p>
            </div>

            {/* Field chips */}
            <div className="flex flex-wrap gap-2">
                {FIELD_OPTIONS.map(field => {
                    const selected = preferences.fields.includes(field);
                    return (
                        <button
                            key={field}
                            onClick={() => toggleField(field)}
                            className={cn(
                                'px-3.5 py-2 rounded-full text-sm font-medium border transition-all',
                                selected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                            )}
                        >
                            {field}
                        </button>
                    );
                })}
            </div>

            {/* Undecided toggle */}
            <button
                onClick={handleUndecided}
                className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium border transition-all',
                    isUndecided
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400'
                )}
            >
                טרם החלטתי
            </button>

            {/* Summary */}
            {(preferences.fields.length > 0 || isUndecided) && (
                <p className="text-xs text-gray-400 pt-1">
                    {isUndecided
                        ? 'אין בעיה! נציג לך מגוון רחב של אפשרויות.'
                        : `נבחרו ${preferences.fields.length} תחומים`}
                </p>
            )}
        </div>
    );
}
