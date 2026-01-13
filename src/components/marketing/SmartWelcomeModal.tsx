import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAnalytics } from '../../hooks/useAnalytics';

interface SmartWelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SmartWelcomeModal({ isOpen, onClose }: SmartWelcomeModalProps) {
    const { trackEvent } = useAnalytics();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone || !agreed) return;

        setIsSubmitting(true);

        try {
            // Extract UTM parameters
            const params = new URLSearchParams(window.location.search);
            const utmPayload = {
                utm_source: params.get('utm_source'),
                utm_medium: params.get('utm_medium'),
                utm_campaign: params.get('utm_campaign'),
                utm_content: params.get('utm_content'),
                utm_term: params.get('utm_term')
            };

            const { error } = await supabase
                .from('soft_leads')
                .insert([{
                    full_name: name,
                    phone: phone,
                    email: email, // Optional
                    interest: 'onboarding_flow',
                    source: 'welcome_modal_v2',
                    ...utmPayload
                }]);

            if (error) {
                console.error('Error saving lead:', error);
            }

            localStorage.setItem('has_seen_welcome_v2', 'true');
            localStorage.setItem('lead_captured', 'true');

            trackEvent('lead_generated', {
                lead_type: 'soft',
                source: 'welcome_modal_v2',
                ...utmPayload
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
        trackEvent('lead_skipped', { source: 'welcome_modal_v2' });
        localStorage.setItem('has_seen_welcome_v2', 'true');
        localStorage.setItem('lead_captured', 'skipped');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-gray-100"
                    >
                        {/* Decorative gradient header */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 pb-6 border-b border-indigo-100/50">
                            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center leading-tight">
                                ברוכים הבאים למחשבון הבגרויות<br /><span className="text-indigo-600">המדויק בישראל 🎓</span>
                            </h2>
                            <p className="text-gray-600 text-sm leading-relaxed text-center max-w-md mx-auto">
                                לקחנו מאות אלפי תגובות מקבוצת הפייסבוק (הפעילה כבר 6 שנים!) ואימנו מודל חכם על כל תנאי הקבלה של האוניברסיטאות.
                                המטרה שלנו היא לעשות לך סדר בבלאגן: מה הממוצע שלך, מה הסכם, ואיך הכי נכון לשפר.
                            </p>
                        </div>

                        <div className="p-8 pt-6">
                            <div className="mb-6 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                <p className="text-indigo-900 font-medium text-center text-sm">
                                    נוסיף אתכם לקהילה השקטה שלנו לקבלת עדכונים רלוונטיים ונקשר אותך עם סטודנטים שבאמת לומדים את התואר שמעניין אותך.
                                    <br />
                                    <strong>תרשו לנו לחזור אליכם?</strong>
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 mr-1">
                                            שם ושם משפחה <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-gray-900"
                                            placeholder="ישראל ישראלי"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1.5 mr-1">
                                                טלפון נייד <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-gray-900 text-right"
                                                placeholder="050-0000000"
                                                dir="ltr"
                                                style={{ textAlign: 'right' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1.5 mr-1">
                                                דואר אלקטרוני <span className="text-gray-400 font-normal">(אופציונלי)</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none text-gray-900 text-right"
                                                placeholder="me@example.com"
                                                dir="ltr"
                                                style={{ textAlign: 'right' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 py-2">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="terms-checkbox"
                                            name="terms"
                                            type="checkbox"
                                            required
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500 leading-tight">
                                        <label htmlFor="terms-checkbox" className="font-medium text-gray-700 cursor-pointer">
                                            אני מאשר/ת את <a href="/terms" target="_blank" className="text-indigo-600 underline hover:text-indigo-800">תנאי השימוש</a>
                                        </label>
                                        {' '}
                                        ומאשר/ת קבלת מידע והצעות בטלפון, בדוא"ל, במסרון וכדומה.
                                    </div>
                                </div>

                                <div className="pt-2 space-y-3">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !name || !phone || !agreed}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#1877F2] hover:bg-[#1559B2] text-white font-bold rounded-xl shadow-lg shadow-blue-200 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-lg"
                                    >
                                        {isSubmitting ? 'שולח...' : 'שליחת פרטים >'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSkip}
                                        className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
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

