import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, GraduationCap, ChevronLeft, Building2 } from 'lucide-react';
import { Button } from './ui/shim';
import { trackEvent } from '../utils/gtm';

export const InteractiveWait = () => {
    const [mode, setMode] = useState<'loading' | 'lead-capture' | 'profiling' | 'done'>('loading');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [preference, setPreference] = useState('');

    useEffect(() => {
        // Initial delay to not overwhelm
        const initialTimer = setTimeout(() => {
            const hasLead = localStorage.getItem('lead_captured') === 'true';
            const hasSkipped = localStorage.getItem('lead_captured') === 'skipped'; // We might treat skipped as "try again" or "leave alone"
            // Let's be aggressive but polite: If they skipped, they might be willing now since they are waiting.
            // But let's check preference too.
            const hasPref = localStorage.getItem('user_preference_type');

            if (hasLead && !hasPref) {
                setMode('profiling');
            } else if (!hasLead) {
                setMode('lead-capture');
            } else {
                setMode('done'); // Nothing to ask
            }
        }, 1500);

        return () => clearTimeout(initialTimer);
    }, []);

    const handleLeadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone) return;

        localStorage.setItem('lead_captured', 'true');
        trackEvent('lead_generated', { lead_source: 'smart_wait' });

        // After lead, move to profiling
        setMode('profiling');
    };

    const handlePreference = (pref: string) => {
        setPreference(pref);
        localStorage.setItem('user_preference_type', pref);
        trackEvent('preference_selected', { preference: pref, source: 'smart_wait' });
        setMode('done');
    };

    if (mode === 'loading' || mode === 'done') return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mt-6 pt-6 border-t border-gray-100"
        >
            <AnimatePresence mode="wait">
                {mode === 'lead-capture' && (
                    <motion.div
                        key="lead-capture"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <User className="w-4 h-4" />
                            <h4 className="font-bold text-sm">בזמן שאנחנו מחשבים... נשמור על קשר?</h4>
                        </div>
                        <p className="text-xs text-gray-500">השאר פרטים וקבל את התוצאות גם לנייד.</p>
                        <form onSubmit={handleLeadSubmit} className="space-y-3">
                            <input
                                type="text"
                                placeholder="שם מלא"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input
                                type="tel"
                                placeholder="מספר נייד"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <div className="flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    onClick={() => setMode('done')}
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 text-xs hover:text-gray-600"
                                >
                                    לא תודה
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4"
                                    disabled={!name || !phone}
                                >
                                    שמור פרטים
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {mode === 'profiling' && (
                    <motion.div
                        key="profiling"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                            <GraduationCap className="w-4 h-4" />
                            <h4 className="font-bold text-sm">בזמן שאנחנו מחשבים...</h4>
                        </div>
                        <p className="text-sm font-medium text-gray-700">מה הכיוון שלך כרגע?</p>

                        <div className="grid grid-cols-1 gap-2">
                            <button
                                onClick={() => handlePreference('university')}
                                className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-right group"
                            >
                                <div className="p-1.5 bg-gray-100 group-hover:bg-white rounded-md transition-colors">
                                    <Building2 className="w-4 h-4 text-gray-500 group-hover:text-purple-600" />
                                </div>
                                <span className="text-sm text-gray-600 group-hover:text-purple-700 font-medium">אוניברסיטה</span>
                                <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-purple-400 mr-auto" />
                            </button>

                            <button
                                onClick={() => handlePreference('college')}
                                className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-right group"
                            >
                                <div className="p-1.5 bg-gray-100 group-hover:bg-white rounded-md transition-colors">
                                    <GraduationCap className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                                </div>
                                <span className="text-sm text-gray-600 group-hover:text-blue-700 font-medium">מכללה</span>
                                <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-blue-400 mr-auto" />
                            </button>

                            <button
                                onClick={() => handlePreference('undecided')}
                                className="text-xs text-gray-400 hover:text-gray-600 mt-1"
                            >
                                עדיין מתלבט/ת
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
