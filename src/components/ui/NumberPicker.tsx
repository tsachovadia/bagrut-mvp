import React, { useState, useEffect } from 'react';

interface NumberPickerProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    variant?: 'default' | 'compact';
    className?: string;
}

export const NumberPicker: React.FC<NumberPickerProps> = ({
    value,
    onChange,
    min = 0,
    max = 100,
    variant = 'default',
    className = ''
}) => {
    // Local state for the input value to allow typing freely before validation on blur
    const [inputValue, setInputValue] = useState(value.toString());

    // Sync input value when prop value changes externally
    useEffect(() => {
        setInputValue(value.toString());
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleBlur = () => {
        let newValue = parseInt(inputValue, 10);

        if (isNaN(newValue)) {
            newValue = value; // Revert to current prop value if invalid
        } else {
            // Clamp value
            if (newValue < min) newValue = min;
            if (newValue > max) newValue = max;
        }

        setInputValue(newValue.toString());
        onChange(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
        }
    };

    const isCompact = variant === 'compact';

    return (
        <div className={`flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all ${isCompact ? 'h-7' : 'h-9'} ${className}`}>
            <input
                type="text"
                inputMode="numeric"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={`w-full bg-transparent text-center font-bold text-gray-800 tabular-nums leading-none outline-none ${isCompact ? 'text-xs' : 'text-sm'}`}
            />
        </div>
    );
};
