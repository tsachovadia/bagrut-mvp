import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Check, Minus, Plus } from 'lucide-react';
import { Button } from './shim'; // Adjust path
import { cn } from '../../lib/utils'; // Adjust path
// import { calculateBonus } from '../../utils/bonuses'; // Optional: Show bonus live

interface GradeEditDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    subjectName: string;
    initialGrade: number;
    initialUnits: number;
    onSave: (grade: number, units: number) => void;
    onRemove?: () => void; // If applicable (e.g. elective)
    isMandatory?: boolean;
    maxUnits?: number;
    minUnits?: number;
}

export function GradeEditDrawer({
    isOpen,
    onClose,
    subjectName,
    initialGrade,
    initialUnits,
    onSave,
    onRemove,
    isMandatory = false,
    maxUnits = 5, // Default max
    minUnits = 1
}: GradeEditDrawerProps) {
    const [grade, setGrade] = useState(initialGrade);
    const [units, setUnits] = useState(initialUnits);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setGrade(initialGrade);
            setUnits(initialUnits);
        }
    }, [isOpen, initialGrade, initialUnits]);

    const handleSave = () => {
        onSave(grade, units);
        onClose();
    };

    const handleRemove = () => {
        if (onRemove) {
            onRemove();
            onClose();
        }
    };

    // Quick grade buttons
    const quickGrades = [100, 95, 90, 85, 80, 75];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) onClose();
                        }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-50 max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                        </div>

                        {/* Title & Close */}
                        <div className="px-6 pb-4 pt-2 flex items-center justify-between border-b border-gray-100">
                            <div className="flex flex-col">
                                <h3 className="text-lg font-black text-gray-800">{subjectName}</h3>
                                <span className="text-xs text-gray-500">עריכת ציון ויחידות לימוד</span>
                            </div>

                            {!isMandatory && onRemove && (
                                <button
                                    onClick={handleRemove}
                                    className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-6 space-y-8 overflow-y-auto">

                            {/* Units Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-600 block">יחידות לימוד</label>
                                <div className="flex items-center gap-2">
                                    {[...Array(maxUnits - minUnits + 1)].map((_, i) => {
                                        const val = minUnits + i;
                                        // Some heuristics for common unit counts per subject could apply here, 
                                        // but showing range min-max is safer generic logic.
                                        // Filter unusual unit counts if needed? e.g. only 3,4,5 for Math
                                        // For now, simple range.
                                        if (val < 2 && subjectName === 'מתמטיקה') return null; // Math usually 3+

                                        return (
                                            <button
                                                key={val}
                                                onClick={() => setUnits(val)}
                                                className={cn(
                                                    "flex-1 h-12 rounded-2xl font-bold text-lg transition-all border-2",
                                                    units === val
                                                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                                                        : "border-gray-100 bg-white text-gray-400 hover:border-blue-200"
                                                )}
                                            >
                                                {val}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Grade Input */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-600 block">ציון סופי</label>

                                <div className="flex items-center justify-center gap-6">
                                    <button
                                        onClick={() => setGrade(Math.max(0, grade - 1))}
                                        className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
                                    >
                                        <Minus size={24} />
                                    </button>

                                    <div className="relative">
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={grade || ''}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (!isNaN(val) && val <= 120) setGrade(val);
                                                if (e.target.value === '') setGrade(0);
                                            }}
                                            className="w-32 h-20 text-center text-5xl font-black bg-transparent border-none outline-none text-gray-900 placeholder-gray-200"
                                            placeholder="0"
                                            autoFocus // Focus when drawer opens
                                        />
                                        <span className="absolute -top-2 -right-4 text-gray-400 font-medium">ציון</span>
                                    </div>

                                    <button
                                        onClick={() => setGrade(Math.min(120, grade + 1))}
                                        className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>

                                {/* Slider for coarser adjustment? Or quick pills */}
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {quickGrades.map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setGrade(g)}
                                            className="px-4 py-2 rounded-xl bg-gray-50 text-gray-500 font-medium text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors whitespace-nowrap"
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 pt-2 bg-white border-t border-gray-100 mt-auto pb-8 sm:pb-6">
                            <Button
                                onClick={handleSave}
                                className="w-full h-14 text-lg rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                            >
                                <Check size={20} />
                                שמור שינויים
                            </Button>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

