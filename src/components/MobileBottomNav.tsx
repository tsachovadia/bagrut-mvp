import { useState } from 'react';
import { Home, Search, BookOpen, BarChart2, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useTrackedDegrees } from '../context/TrackedDegreesContext';
import { motion, AnimatePresence } from 'framer-motion';
import { TrackedDegreesWidget } from './TrackedDegreesWidget';

export function MobileBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { trackedIds } = useTrackedDegrees();
    const [isTrackedOpen, setIsTrackedOpen] = useState(false);

    const navItems = [
        { label: 'בית', icon: Home, path: '/', action: () => navigate('/') },
        { label: 'חיפוש תארים', icon: Search, path: '/programs', action: () => navigate('/programs') },
        { label: 'התארים שלי', icon: BookOpen, path: '/tracking', action: () => setIsTrackedOpen(true), badge: trackedIds.length },
        { label: 'סימולטור', icon: BarChart2, path: '/dashboard', action: () => navigate('/dashboard') },
    ];

    return (
        <>
            {/* Slide-up tracked degrees panel */}
            <AnimatePresence>
                {isTrackedOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsTrackedOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            drag="y"
                            dragConstraints={{ top: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(_, info) => {
                                if (info.offset.y > 100) setIsTrackedOpen(false);
                            }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[28px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-50 h-[70vh] flex flex-col md:hidden"
                            dir="rtl"
                        >
                            {/* Drag handle */}
                            <div className="w-full flex justify-center pt-3 pb-1">
                                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                            </div>
                            {/* Header */}
                            <div className="px-4 pb-3 flex items-center justify-between border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800">התארים שלי</h3>
                                <button onClick={() => setIsTrackedOpen(false)} className="p-2 bg-gray-50 rounded-full">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>
                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <TrackedDegreesWidget className="border-0 shadow-none" />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Nav Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe md:hidden">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const isActive = item.path === '/tracking' ? isTrackedOpen : location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={item.action}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full space-y-1 relative",
                                    isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
                                )}
                            >
                                <item.icon className={cn("w-6 h-6", isActive && "fill-current")} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                                {item.badge != null && item.badge > 0 && (
                                    <span className="absolute top-1 left-1/2 translate-x-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
