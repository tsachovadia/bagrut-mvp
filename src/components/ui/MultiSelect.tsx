import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from './shim';

export interface Option {
    label: string;
    value: string;
    icon?: string;
}

interface MultiSelectProps {
    label: string;
    options: Option[];
    selected: string[];
    onChange: (values: string[]) => void;
    className?: string;
    placeholder?: string;
}

export function MultiSelect({
    label,
    options,
    selected,
    onChange,
    className,
    placeholder = "בחר..."
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleOption = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter(v => v !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const removeSelected = (e: React.MouseEvent, value: string) => {
        e.stopPropagation();
        onChange(selected.filter(v => v !== value));
    };

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            {/* Trigger Button */}
            <div
                className={cn(
                    "flex items-center justify-between w-full p-2.5 bg-white border rounded-xl cursor-pointer transition-all",
                    isOpen ? "border-indigo-500 ring-2 ring-indigo-500/10" : "border-slate-200 hover:border-indigo-300"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-wrap gap-1 items-center overflow-hidden">
                    {selected.length === 0 && (
                        <span className="text-slate-500 text-sm px-1">{placeholder}</span>
                    )}
                    {selected.length > 0 && (
                        <div className="flex gap-1">
                            {selected.slice(0, 2).map(val => {
                                const opt = options.find(o => o.value === val);
                                return (
                                    <Badge key={val} variant="secondary" className="bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1 text-xs py-0.5 pl-1 pr-2">
                                        {opt?.label}
                                        <div
                                            role="button"
                                            onClick={(e) => removeSelected(e, val)}
                                            className="hover:text-red-500 rounded-full p-0.5"
                                        >
                                            <X size={10} />
                                        </div>
                                    </Badge>
                                );
                            })}
                            {selected.length > 2 && (
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border border-slate-200 text-xs py-0.5">
                                    +{selected.length - 2}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
                <ChevronDown size={16} className={cn("text-slate-400 transition-transform", isOpen && "rotate-180")} />
            </div>

            {/* Dropdown Content */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                    {/* Search Header */}
                    <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                className="w-full pl-3 pr-9 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                placeholder="חפש..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                autoFocus
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {filteredOptions.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-400">
                                לא נמצאו תוצאות
                            </div>
                        ) : (
                            <div className="space-y-0.5">
                                {filteredOptions.map(option => {
                                    const isSelected = selected.includes(option.value);
                                    return (
                                        <div
                                            key={option.value}
                                            onClick={() => toggleOption(option.value)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors",
                                                isSelected ? "bg-indigo-50 text-indigo-900" : "hover:bg-slate-50 text-slate-700"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                                isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300 bg-white"
                                            )}>
                                                {isSelected && <Check size={10} className="text-white" />}
                                            </div>

                                            {option.icon && (
                                                <img src={option.icon} alt="" className="w-5 h-5 object-contain opacity-80" />
                                            )}

                                            <span className="flex-1 truncate font-medium">{option.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions (Optional) */}
                    {selected.length > 0 && (
                        <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                            <button
                                onClick={(e) => { e.stopPropagation(); onChange([]); }}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2"
                            >
                                נקה הכל
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
