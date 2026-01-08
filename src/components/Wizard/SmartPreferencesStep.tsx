import { useState, useMemo } from 'react';
import { Card, Button, Badge } from '../ui/shim';
import { Search, X, Check, Building2, HelpCircle, Compass } from 'lucide-react';
import { getProgramFilterOptions } from '../../utils/program-filters';
import { cn } from '../../lib/utils';

interface SmartPreferencesStepProps {
    preferences: {
        fields: string[];
        institutions: string[];
        isUndecided: boolean;
    };
    onUpdate: (prefs: { fields: string[]; institutions: string[]; isUndecided: boolean }) => void;
}

export function SmartPreferencesStep({ preferences, onUpdate }: SmartPreferencesStepProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const options = useMemo(() => getProgramFilterOptions(), []);

    const filteredFields = useMemo(() => {
        if (!searchTerm) return options.fields.slice(0, 15); // Show top 15 initially
        return options.fields.filter(f => f.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [options.fields, searchTerm]);

    const toggleField = (field: string) => {
        const newFields = preferences.fields.includes(field)
            ? preferences.fields.filter(f => f !== field)
            : [...preferences.fields, field];

        onUpdate({
            ...preferences,
            fields: newFields,
            isUndecided: false // Clear undecided if selecting specific fields
        });
    };

    const toggleInstitution = (instId: string) => {
        const newInsts = preferences.institutions.includes(instId)
            ? preferences.institutions.filter(i => i !== instId)
            : [...preferences.institutions, instId];

        onUpdate({ ...preferences, institutions: newInsts });
    };

    const toggleUndecided = () => {
        onUpdate({
            ...preferences,
            isUndecided: !preferences.isUndecided,
            fields: !preferences.isUndecided ? [] : preferences.fields // Optional: clear fields if Undecided? Or keep them? Let's clear for clarity.
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Section 1: The Dilemma (Fields) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Compass className="w-6 h-6 text-indigo-600" />
                        מה הכיוון שלך?
                    </h3>
                    <Button
                        variant={preferences.isUndecided ? "default" : "outline"}
                        onClick={toggleUndecided}
                        className={cn(
                            "text-sm gap-2 transition-all",
                            preferences.isUndecided ? "bg-indigo-600 hover:bg-indigo-700" : "hover:bg-indigo-50 border-indigo-200 text-indigo-700"
                        )}
                    >
                        <HelpCircle size={16} />
                        טרם החלטתי
                    </Button>
                </div>

                <p className="text-slate-500 text-sm">
                    ספרו לנו מה מעניין אתכם, או בין מה אתם מתלבטים (אפשר לבחור כמה). בחירות אלו יישמרו כרשימת המעקב שלכם.
                </p>

                {/* Selected Tags Display */}
                {!preferences.isUndecided && preferences.fields.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
                        {preferences.fields.map(field => (
                            <Badge
                                key={field}
                                variant="secondary"
                                className="pl-1 pr-3 py-1 bg-white border-indigo-100 text-indigo-700 hover:bg-indigo-50 gap-2 cursor-pointer group shadow-sm"
                                onClick={() => toggleField(field)}
                            >
                                {field}
                                <X size={12} className="text-indigo-400 group-hover:text-red-500 transition-colors" />
                            </Badge>
                        ))}
                        <button
                            onClick={() => onUpdate({ ...preferences, fields: [] })}
                            className="text-xs text-slate-400 hover:text-red-500 underline px-2"
                        >
                            נקה הכל
                        </button>
                    </div>
                )}

                {/* Search & Suggestions */}
                <div className={cn("transition-all duration-300", preferences.isUndecided ? "opacity-50 pointer-events-none grayscale" : "opacity-100")}>
                    <div className="relative mb-3">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="חפש תחום לימודים (למשל: מדעי המחשב)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-sm"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {filteredFields.map(field => {
                            const isSelected = preferences.fields.includes(field);
                            return (
                                <button
                                    key={field}
                                    onClick={() => toggleField(field)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-sm border transition-all duration-200",
                                        isSelected
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
                                    )}
                                >
                                    {field}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2: Institutions */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                    איפה בא לך ללמוד?
                </h3>
                <p className="text-slate-500 text-sm">
                    בחרו את המוסדות המועדפים עליכם. אם לא תבחרו, נציג את כולם.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {options.institutions.map(inst => (
                        <InstitutionButton
                            key={inst.id}
                            inst={inst}
                            isSelected={preferences.institutions.includes(inst.id)}
                            onClick={() => toggleInstitution(inst.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function InstitutionButton({ inst, isSelected, onClick }: { inst: { id: string; name: string; logo?: string }; isSelected: boolean; onClick: () => void }) {
    const [imgError, setImgError] = useState(false);

    return (
        <button
            onClick={onClick}
            className={cn(
                "relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 h-24",
                isSelected
                    ? "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 shadow-sm"
                    : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm"
            )}
        >
            {isSelected && (
                <div className="absolute top-2 right-2 text-indigo-600">
                    <CheckCircleSmall className="w-4 h-4" />
                </div>
            )}
            {inst.logo && !imgError ? (
                <img
                    src={inst.logo}
                    alt={inst.name}
                    className="w-8 h-8 object-contain opacity-90"
                    onError={() => setImgError(true)}
                />
            ) : (
                <Building2 className="w-8 h-8 text-slate-300" />
            )}
            <span className={cn(
                "text-xs text-center font-medium leading-tight",
                isSelected ? "text-indigo-900" : "text-slate-600"
            )}>
                {inst.name}
            </span>
        </button>
    );
}


function CheckCircleSmall({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
        </svg>
    );
}
