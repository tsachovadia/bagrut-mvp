import type { ChangeEvent } from 'react';
import React, { useState } from 'react';
import { Input } from './ui/shim';
import { Button } from './ui/shim';
import { Label } from './ui/shim';
import { Trash2, HelpCircle } from 'lucide-react';
import { calculateBonus } from '../utils/bonuses';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip"

interface BagrutSubjectRowProps {
    subjectName: string;
    grade: number;
    units: number;
    onChange: (id: string, field: 'grade' | 'units', value: number) => void;
    onRemove?: (id: string) => void;
    isMandatory?: boolean;
}

export const BagrutSubjectRow: React.FC<BagrutSubjectRowProps> = ({
    subjectName,
    grade,
    units,
    onChange,
    onRemove,
    isMandatory
}) => {

    // Calculate bonuses
    const currentBonus = calculateBonus(subjectName, units, grade);

    return (
        <div className={`p-4 rounded-xl border transition-all duration-300 bg-white border-gray-100`}>
            <div className="flex flex-col gap-3">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{subjectName}</span>
                        {currentBonus > 0 && (
                            <TooltipProvider>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full cursor-help hover:bg-green-100 transition-colors flex items-center gap-1">
                                            +{currentBonus} בונוס
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[200px] text-xs">
                                        <p>מקצוע זה מזכה בבונוס של {currentBonus} נקודות בחישוב הממוצע האוניברסיטאי.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>

                {/* Controls Row */}
                <div className="flex items-center gap-4">
                    {/* Units Input */}
                    <div className="w-20">
                        <Label className="text-xs text-gray-400 mb-1 block">יחידות</Label>
                        <Input
                            type="number"
                            min={1}
                            max={10}
                            value={units}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(subjectName, 'units', parseInt(e.target.value) || 0)}
                            className="h-9 text-center font-medium"
                        />
                    </div>

                    {/* Grade Input */}
                    <div className="flex flex-col gap-1.5 min-w-[80px] flex-1">
                        <Label className="text-xs text-gray-500 font-medium">ציון סופי</Label>
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            value={grade || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(subjectName, 'grade', parseInt(e.target.value) || 0)}
                            className="h-11 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-center font-bold text-lg"
                        />
                    </div>

                    {!isMandatory && onRemove && (
                        <div className="flex justify-end items-end h-[68px] pb-[2px]">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onRemove}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-10 w-10 p-0 rounded-full transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
