import { motion, AnimatePresence } from 'framer-motion';
import { ProgramSummaryPanel } from '../ProgramSummaryPanel';
import type { Program, AdmissionRequirement } from '../../types/admission';
import type { UserAdmissionStats } from '../../utils/admission-evaluation';

interface ProgramDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    program: Program | null;
    admission: AdmissionRequirement | null;
    userStats: UserAdmissionStats;
}

export function ProgramDetailsDrawer({
    isOpen,
    onClose,
    program,
    admission,
    userStats
}: ProgramDetailsDrawerProps) {
    if (!program || !admission) return null;

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
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-50 h-[90vh] flex flex-col lg:hidden"
                    >
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing shrink-0 z-10 bg-white rounded-t-[32px]">
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                        </div>

                        {/* Content - ProgramSummaryPanel handles its own scrolling and internal layout */}
                        <div className="flex-1 overflow-hidden relative">
                            <ProgramSummaryPanel
                                program={program}
                                admission={admission}
                                userStats={userStats}
                                onClose={onClose}
                                className="h-full border-none rounded-none shadow-none"
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
