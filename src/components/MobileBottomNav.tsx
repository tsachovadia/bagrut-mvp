import { useState } from 'react';
import { Home, Search, BookOpen, BarChart2, X, Users, Menu, FileText, Calendar, Heart } from 'lucide-react';
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { label: 'בית', icon: Home, path: '/', action: () => navigate('/') },
        { label: 'חיפוש', icon: Search, path: '/programs', action: () => navigate('/programs') },
        { label: 'סימולטור', icon: BarChart2, path: '/dashboard', action: () => navigate('/dashboard') },
        { label: 'קהילה', icon: Users, path: '/', action: () => {
            navigate('/');
            setTimeout(() => document.getElementById('community')?.scrollIntoView({ behavior: 'smooth' }), 100);
        } },
        { label: 'תפריט', icon: Menu, path: '#menu', action: () => setIsMenuOpen(true) },
    ];

    const menuItems = [
        { label: 'התארים שלי', icon: BookOpen, path: '/tracking', action: () => { setIsMenuOpen(false); setIsTrackedOpen(true); }, badge: trackedIds.length, highlight: true },
        { label: 'בלוג', icon: FileText, path: '/blog', action: () => { setIsMenuOpen(false); navigate('/blog'); } },
        { label: 'ימים פתוחים', icon: Calendar, path: '/open-days', action: () => { setIsMenuOpen(false); navigate('/open-days'); } },
        { label: 'שיתופי פעולה', icon: Heart, path: '/collaborations', action: () => { setIsMenuOpen(false); navigate('/collaborations'); } },
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
                            <div className="w-full flex justify-center pt-3 pb-1">
                                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                            </div>
                            <div className="px-4 pb-3 flex items-center justify-between border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800">התארים שלי</h3>
                                <button onClick={() => setIsTrackedOpen(false)} className="p-2 bg-gray-50 rounded-full">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                <TrackedDegreesWidget className="border-0 shadow-none" />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Menu Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
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
                                if (info.offset.y > 100) setIsMenuOpen(false);
                            }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[28px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-50 pb-safe md:hidden"
                            dir="rtl"
                        >
                            <div className="w-full flex justify-center pt-3 pb-4">
                                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                            </div>

                            <div className="px-6 pb-8 space-y-2">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={item.action}
                                        className={cn(
                                            "w-full flex items-center p-4 rounded-xl transition-colors",
                                            item.highlight
                                                ? "bg-brand-purple-50 text-brand-purple-700"
                                                : "hover:bg-gray-50 text-gray-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-2 rounded-lg ml-4",
                                            item.highlight ? "bg-white" : "bg-gray-100"
                                        )}>
                                            <item.icon size={20} className={item.highlight ? "text-brand-purple-600" : "text-gray-500"} />
                                        </div>
                                        <span className="font-medium text-lg">{item.label}</span>
                                        {item.badge != null && item.badge > 0 && (
                                            <span className="mr-auto bg-brand-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                                {!import.meta.env.PROD && (
                                    <button
                                        onClick={() => { setIsMenuOpen(false); navigate('/admin/shadow'); }}
                                        className="w-full flex items-center p-4 rounded-xl hover:bg-gray-50 text-gray-700"
                                    >
                                        <div className="p-2 rounded-lg ml-4 bg-gray-100">
                                            <Users size={20} className="text-gray-500" />
                                        </div>
                                        <span className="font-medium text-lg">Admin CRM</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Nav Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe md:hidden">
                <div className="flex justify-around items-center h-16 px-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path === '#menu' && isMenuOpen);
                        return (
                            <button
                                key={item.label}
                                onClick={item.action}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full space-y-1 relative active:scale-95 transition-transform",
                                    isActive ? "text-brand-purple-600" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <item.icon className={cn("w-6 h-6", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
