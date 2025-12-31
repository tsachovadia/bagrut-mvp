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
    variant?: 'default' | 'compact';
}

export const BagrutSubjectRow: React.FC<BagrutSubjectRowProps> = ({
    subjectName,
    grade,
    units,
    onChange,
    onRemove,
    isMandatory,
    variant = 'default'
}) => {

    // Calculate bonuses
    const currentBonus = calculateBonus(subjectName, units, grade);

    return (
        <div className={`rounded-xl border transition-all duration-300 bg-white border-gray-100 ${variant === 'compact' ? 'p-1' : 'p-3'}`}>
            <div className="flex flex-col gap-1.5 w-full">
                {/* Header Row */}
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-gray-800 text-sm truncate">{subjectName}</span>
                    {currentBonus > 0 && (
                        <TooltipProvider>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <span className={`font-bold text-green-600 bg-green-50 rounded-full cursor-help hover:bg-green-100 transition-colors flex items-center gap-1 whitespace-nowrap ${variant === 'compact' ? 'text-[9px] px-1 py-0' : 'text-[10px] px-1.5 py-0.5'}`}>
                                        +{currentBonus}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[200px] text-xs">
                                    <p>מקצוע זה מזכה בבונוס של {currentBonus} נקודות</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>

                {/* Controls Row */}
                <div className="flex items-end gap-3 w-full">
                    {/* Units Input */}
                    <div className="w-16">
                        <Label className="text-[10px] text-gray-400 mb-1 block text-center">יח"ל</Label>
                        <Input
                            type="number"
                            min={1}
                            max={10}
                            value={units}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(subjectName, 'units', parseInt(e.target.value) || 0)}
                            className={`text-center font-medium text-xs px-1 ${variant === 'compact' ? 'h-7' : 'h-8'}`}
                        />
                    </div>

                    {/* Grade Input */}
                    <div className="w-20">
                        <Label className="text-[10px] text-gray-500 font-medium mb-1 block text-center">ציון</Label>
                        <Input
                            type="number"
                            min={0}
                            max={120}
                            value={grade || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(subjectName, 'grade', parseInt(e.target.value) || 0)}
                            className={`bg-white border-gray-200 text-center font-medium text-sm px-1 shadow-sm ${variant === 'compact' ? 'h-7' : 'h-8'}`}
                        />
                    </div>



                    {!isMandatory && onRemove && (
                        <div className="mr-auto pb-[1px]">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onRemove}
                                className={`text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all ${variant === 'compact' ? 'h-7 px-2' : 'h-8 px-2.5'} gap-1.5`}
                            >
                                <Trash2 className={`${variant === 'compact' ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
                                <span className={`font-medium ${variant === 'compact' ? 'text-[10px]' : 'text-xs'}`}>הסר</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
