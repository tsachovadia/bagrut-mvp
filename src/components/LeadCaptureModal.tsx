import { useState, useEffect } from 'react';
import { trackEvent } from '../utils/gtm';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LeadCaptureModal({ isOpen, onClose }: LeadCaptureModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone || !agreed) return;

        setIsSubmitting(true);

        try {
            // Track to GTM
            trackEvent('generate_lead', {
                lead_source: 'landing_modal',
            });

            // Save to Supabase
            const { error } = await supabase
                .from('soft_leads')
                .insert({
                    name,
                    phone,
                    source: 'landing_modal',
                    metadata: {
                        page_url: window.location.href,
                        referrer: document.referrer
                    }
                });

            if (error) {
                console.error('Error saving lead:', error);
                // We still close the modal to not block the user
            }

            localStorage.setItem('lead_captured', 'true');

            setTimeout(() => {
                setIsSubmitting(false);
                onClose();
            }, 500);
        } catch (err) {
            console.error('Lead capture exception:', err);
            setIsSubmitting(false);
            onClose();
        }
    };

    const handleSkip = () => {
        trackEvent('lead_skipped', {
            lead_source: 'landing_modal'
        });
        localStorage.setItem('lead_captured', 'skipped');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">ברוכים הבאים! 👋</h2>
                                <button
                                    onClick={handleSkip}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="סגור"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 mb-6">לפני שמתחילים, נשמח להכיר אותך כדי שנוכל לתת לך את התוצאות המדויקות ביותר.</p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="ישראל ישראלי"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">מספר נייד</label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="050-0000000"
                                        dir="ltr"
                                    />
                                </div>

                                <div className="flex items-start gap-2">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        required
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor="terms" className="text-sm text-gray-600">
                                        אני מאשר/ת את <a href="#" className="text-indigo-600 hover:text-indigo-800 underline">תנאי השימוש</a> ומדיניות הפרטיות.
                                    </label>
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !name || !phone || !agreed}
                                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'שולח...' : 'מתחילים! 🚀'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSkip}
                                        className="text-sm text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors"
                                    >
                                        דלג על השלב הזה
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center">
                            <p className="text-xs text-gray-500">הפרטים שלך שמורים אצלנו ולא יועברו לצד שלישי ללא אישורך.</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
