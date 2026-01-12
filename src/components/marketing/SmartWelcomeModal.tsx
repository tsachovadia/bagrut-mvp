import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { trackEvent } from '../../utils/gtm';

interface SmartWelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SmartWelcomeModal({ isOpen, onClose }: SmartWelcomeModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [interest, setInterest] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone) return;

        setIsSubmitting(true);
        trackEvent('soft_lead_submit_attempt', { source: 'welcome_modal' });

        try {
            const { error } = await supabase
                .from('soft_leads')
                .insert([{
                    full_name: name,
                    phone: phone,
                    email: email, // Optional
                    interest: interest, // Optional
                    source: 'welcome_modal'
                }]);

            if (error) {
                console.error('Error saving lead:', error);
                // We continue anyway not to block the user
            }

            localStorage.setItem('has_seen_welcome_v2', 'true');
            localStorage.setItem('lead_captured', 'true');

            trackEvent('soft_lead_captured', {
                source: 'welcome_modal',
                has_email: !!email,
                has_interest: !!interest
            });

            setTimeout(() => {
                setIsSubmitting(false);
                onClose();
            }, 500);

        } catch (err) {
            console.error('Unexpected error:', err);
            setIsSubmitting(false);
            onClose(); // Fallback
        }
    };

    const handleSkip = () => {
        trackEvent('soft_lead_skipped', { source: 'welcome_modal' });
        localStorage.setItem('has_seen_welcome_v2', 'true');
        localStorage.setItem('lead_captured', 'skipped');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-gray-100"
                    >
                        {/* Clean aesthetic header without heavy background */}
                        <div className="pt-8 px-8 pb-4 text-center">
                            <div className="inline-block p-4 bg-indigo-50 rounded-2xl mb-4 text-4xl shadow-sm">
                                👋
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">ברוכים הבאים!</h2>
                            <p className="text-gray-500 text-sm">נשמח להכיר אותך כדי להתאים את החוויה</p>
                        </div>

                        <div className="px-8 pb-8">
                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* Name Input - Required */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 mr-1">
                                        שם מלא <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                                        placeholder="ישראל ישראלי"
                                    />
                                </div>

                                {/* Phone Input - Required */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 mr-1">
                                        טלפון <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                                        placeholder="050-0000000"
                                        dir="ltr"
                                        style={{ textAlign: 'right' }}
                                    />
                                </div>

                                {/* Email Input - Optional */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 mr-1">
                                        אימייל <span className="text-gray-400 font-normal">(אופציונלי)</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                                        placeholder="me@example.com"
                                        dir="ltr"
                                        style={{ textAlign: 'right' }}
                                    />
                                </div>

                                {/* Interest Input - Optional */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 mr-1">
                                        מה מעניין אותך ללמוד? <span className="text-gray-400 font-normal">(אופציונלי)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={interest}
                                        onChange={(e) => setInterest(e.target.value)}
                                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                                        placeholder="מדעי המחשב, משפטים..."
                                    />
                                </div>

                                <div className="space-y-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !name || !phone}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                שומר פרטים...
                                            </span>
                                        ) : (
                                            <span>המשך</span>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSkip}
                                        className="w-full py-2 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        דלג/י כרגע
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
