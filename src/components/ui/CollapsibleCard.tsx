import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '../../lib/utils'; // Assuming cn utility exists, usually does in shadcn/tailwind projects

interface CollapsibleCardProps {
    title: string;
    icon?: React.ReactNode;
    isOpen: boolean;
    onToggle?: () => void;
    children: React.ReactNode;
    summary?: React.ReactNode;
    isCompleted?: boolean;
    isLocked?: boolean;
    className?: string;
}

export const CollapsibleCard = ({
    title,
    icon,
    isOpen,
    onToggle,
    children,
    summary,
    isCompleted = false,
    isLocked = false,
    className
}: CollapsibleCardProps) => {

    return (
        <div className={cn(
            "rounded-2xl transition-all duration-300 overflow-hidden border",
            isOpen
                ? "bg-white/80 backdrop-blur-xl border-blue-100 shadow-xl shadow-blue-900/5 my-4"
                : "bg-white/40 backdrop-blur-sm border-white/50 my-2",
            isLocked && "opacity-60 grayscale pointer-events-none",
            className
        )}>
            {/* Header / Trigger */}
            <button
                onClick={!isLocked ? onToggle : undefined}
                className={cn(
                    "w-full flex items-center justify-between p-4 text-right transition-colors",
                    !isOpen && "hover:bg-white/50"
                )}
            >
                <div className="flex items-center gap-3">
                    {/* Status Icon */}
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm",
                        isCompleted ? "bg-green-100 text-green-600" :
                            isOpen ? "bg-blue-100 text-blue-600" :
                                "bg-gray-100 text-gray-400"
                    )}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : (icon || <div className="w-2 h-2 rounded-full bg-current" />)}
                    </div>

                    <div className="flex flex-col items-start gap-0.5">
                        <span className={cn(
                            "text-sm font-bold",
                            isOpen ? "text-gray-900" : "text-gray-600"
                        )}>
                            {title}
                        </span>
                        {/* Summary when closed */}
                        {!isOpen && summary && (
                            <span className="text-xs text-gray-400 font-medium truncate max-w-[200px]">
                                {summary}
                            </span>
                        )}
                    </div>
                </div>

                {/* Chevron */}
                {!isLocked && (
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-400"
                    >
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                )}
                {isLocked && <Lock className="w-4 h-4 text-gray-300" />}
            </button>

            {/* Content */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="border-t border-blue-50/50">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
