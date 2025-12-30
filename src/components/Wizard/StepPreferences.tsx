import { Card, CardContent, CardHeader, CardTitle, Label, Input } from '../ui/shim';
import { Building2, BookOpen } from 'lucide-react';
import type { ChangeEvent } from 'react';

interface PreferencesFilters {
    institution: string;
    degree: string;
}

interface StepPreferencesProps {
    filters: PreferencesFilters;
    onFilterChange: (filters: PreferencesFilters) => void;
}

export function StepPreferences({ filters, onFilterChange }: StepPreferencesProps) {
    const handleChange = (field: keyof PreferencesFilters, value: string) => {
        onFilterChange({
            ...filters,
            [field]: value
        });
    };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-700 pb-2 border-b flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                העדפות סינון
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Institution Filter */}
                <div className="space-y-1">
                    <Label className="text-sm">מוסד לימודים</Label>
                    <Input
                        placeholder="חפש מוסד (לדוגמה: טכניון)"
                        value={filters.institution}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('institution', e.target.value)}
                        className="bg-white h-9"
                    />
                </div>

                {/* Degree Filter */}
                <div className="space-y-1">
                    <Label className="text-sm">תחום לימודים</Label>
                    <Input
                        placeholder="חפש תואר (לדוגמה: מדעי המחשב)"
                        value={filters.degree}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('degree', e.target.value)}
                        className="bg-white h-9"
                    />
                </div>
            </div>
            <p className="text-xs text-gray-500 pt-1">
                * השאירו ריק כדי לראות את כל האפשרויות
            </p>
        </div>
    );
}
