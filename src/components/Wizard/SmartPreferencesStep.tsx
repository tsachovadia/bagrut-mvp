import { useState, useMemo } from 'react';
import { Card, Button, Badge } from '../ui/shim';
import { HelpCircle, Compass } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ProgramFilterPanel } from '../ProgramFilterPanel';

interface SmartPreferencesStepProps {
    preferences: {
        fields: string[];
        institutions: string[];
        isUndecided: boolean;
    };
    onUpdate: (prefs: { fields: string[]; institutions: string[]; isUndecided: boolean }) => void;
}

export function SmartPreferencesStep({ preferences, onUpdate }: SmartPreferencesStepProps) {

    const handleFilterUpdate = (fields: string[], institutions: string[]) => {
        onUpdate({
            ...preferences,
            fields,
            institutions,
            isUndecided: false // Clear undecided if interacting with filters
        });
    };

    const toggleUndecided = () => {
        onUpdate({
            ...preferences,
            isUndecided: !preferences.isUndecided,
            fields: !preferences.isUndecided ? [] : preferences.fields
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Top Bar: Undecided Toggle */}
            <div className="flex items-center justify-between bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50">
                <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium text-slate-700">עדיין מתלבטים?</span>
                </div>
                <Button
                    variant={preferences.isUndecided ? "default" : "outline"}
                    onClick={toggleUndecided}
                    className={cn(
                        "text-sm gap-2 transition-all shadow-sm",
                        preferences.isUndecided ? "bg-indigo-600 hover:bg-indigo-700" : "hover:bg-indigo-50 border-indigo-200 text-indigo-700"
                    )}
                >
                    <HelpCircle size={16} />
                    טרם החלטתי
                </Button>
            </div>

            {/* Main Filter Panel */}
            <div className={cn("transition-all duration-300", preferences.isUndecided ? "opacity-50 pointer-events-none grayscale" : "opacity-100")}>
                <ProgramFilterPanel
                    selectedFields={preferences.fields}
                    selectedInstitutions={preferences.institutions}
                    onUpdate={handleFilterUpdate}
                    variant="wizard"
                />
            </div>
        </div>
    );
}
