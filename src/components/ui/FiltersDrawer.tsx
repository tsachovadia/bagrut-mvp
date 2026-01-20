import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ProgramFilterPanel } from '../ProgramFilterPanel';
import { cn } from '../../lib/utils';

interface FiltersDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    selectedFields: string[];
    selectedInstitutions: string[];
    onUpdate: (fields: string[], institutions: string[]) => void;
    programs: any[];
}

export function FiltersDrawer({
    isOpen,
    onClose,
    selectedFields,
    selectedInstitutions,
    onUpdate,
    programs
}: FiltersDrawerProps) {

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
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
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
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-50 h-[85vh] flex flex-col lg:hidden"
                    >
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing shrink-0">
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                        </div>

                        {/* Title & Close */}
                        <div className="px-6 pb-4 pt-2 flex items-center justify-between border-b border-gray-100 shrink-0">
                            <h3 className="text-lg font-black text-gray-800">סינון מתקדם</h3>
                            <button
                                onClick={onClose}
                                className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <ProgramFilterPanel
                                selectedFields={selectedFields}
                                selectedInstitutions={selectedInstitutions}
                                onUpdate={onUpdate}
                                programs={programs}
                                variant="wizard" // Rich UI for mobile drawer
                                className="space-y-6"
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
