import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';
import { EXPLANATIONS } from '../../data/explanations';

interface InfoTooltipProps {
    contentKey?: keyof typeof EXPLANATIONS;
    customContent?: string;
    customTitle?: string;
    className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
    contentKey,
    customContent,
    customTitle,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const data = contentKey ? EXPLANATIONS[contentKey] : null;
    const title = customTitle || data?.title;
    const content = customContent || data?.content;

    if (!content) return null;

    return (
        <div className={`relative inline-block ${className}`}>
            <button
                type="button"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent affecting parent forms
                    setIsOpen(!isOpen);
                }}
                className="text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
                aria-label="Show explanation"
            >
                <HelpCircle className="w-4 h-4" />
            </button>

            {/* Tooltip Popup */}
            {isOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <div>
                            {title && <h4 className="text-sm font-semibold text-gray-900 mb-1">{title}</h4>}
                            <p className="text-xs text-gray-600 leading-relaxed text-right">{content}</p>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-gray-200"></div>
                </div>
            )}
        </div>
    );
};
