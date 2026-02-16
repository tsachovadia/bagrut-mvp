import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAnalytics } from '../hooks/useAnalytics';
import { trackFbEvent } from '../utils/fb-pixel';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

interface ResultsAuthGateProps {
    children: React.ReactNode;
}

export function ResultsAuthGate({ children }: ResultsAuthGateProps) {
    const [session, setSession] = useState<Session | null>(null);
    const [hasPhone, setHasPhone] = useState(false);
    const [loading, setLoading] = useState(true);
    const [phone, setPhone] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [phoneBannerDismissed, setPhoneBannerDismissed] = useState(false);
    const { trackEvent } = useAnalytics();

    const [profileCompleted, setProfileCompleted] = useState(false);

    useEffect(() => {
        if (session && hasPhone) {
            trackEvent('results_unlocked', {
                verified: true,
                method: 'google_auth_phone'
            });
            trackFbEvent('CompleteRegistration');
        }
    }, [session, hasPhone, trackEvent]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user?.user_metadata?.mobile_phone) {
                setHasPhone(true);
            }
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user?.user_metadata?.mobile_phone) {
                setHasPhone(true);
            } else {
                setHasPhone(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleGoogleLogin = async () => {
        trackEvent('login_attempt', { method: 'google', source: 'results_gate' });
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.href
            }
        });
        if (error) console.error('Error logging in:', error.message);
    };

    const handlePhoneSubmit = async () => {
        setError('');

        if (!phone || phone.length < 9) {
            setError('נא להזין מספר נייד תקין');
            return;
        }

        if (!agreed) {
            setError('חובה לאשר את תנאי השימוש');
            return;
        }

        setSubmitting(true);

        try {
            const { error } = await supabase.auth.updateUser({
                data: { mobile_phone: phone, terms_accepted: true }
            });

            if (error) throw error;

            trackEvent('profile_completed', { phone: 'collected' });
            setProfileCompleted(true);
            setHasPhone(true);
            setPhoneBannerDismissed(true);

            await supabase.auth.refreshSession();

        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError('שגיאה בשמירת הנתונים, נסה שוב');
        } finally {
            setSubmitting(false);
        }
    };

    // Gate only requires session — phone is collected non-blocking
    const canViewResults = !!session;
    const needsPhone = session && !hasPhone && !profileCompleted && !phoneBannerDismissed;

    if (loading) {
        return <div className="p-8 text-center text-gray-500">בודק הרשאות...</div>;
    }

    // Logged in — show results immediately + optional phone banner
    if (canViewResults) {
        return (
            <>
                {children}

                {/* Non-blocking phone collection banner */}
                <AnimatePresence>
                    {needsPhone && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            transition={{ delay: 2, duration: 0.4 }}
                            className="fixed bottom-20 md:bottom-4 left-4 right-4 z-[80] max-w-md mx-auto"
                        >
                            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 relative">
                                <button
                                    onClick={() => setPhoneBannerDismissed(true)}
                                    className="absolute top-2 left-2 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Phone className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">רוצה שנעדכן אותך?</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">השאר מספר ונשלח לך עדכונים רלוונטיים</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="050-1234567"
                                        className="flex-1 p-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all text-center font-medium text-sm"
                                        dir="ltr"
                                    />
                                    <button
                                        onClick={handlePhoneSubmit}
                                        disabled={submitting}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-all shrink-0"
                                    >
                                        {submitting ? '...' : 'שלח'}
                                    </button>
                                </div>

                                <label className="flex items-start gap-2 text-[10px] text-gray-400 mt-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="mt-0.5 w-3 h-3 rounded border-gray-300"
                                    />
                                    <span>
                                        מאשר/ת <a href="/terms" target="_blank" className="underline">תנאי שימוש</a> וקבלת עדכונים
                                    </span>
                                </label>

                                {error && (
                                    <p className="text-red-500 text-xs mt-1.5">{error}</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    }

    // Not logged in — show gate with blurred preview
    return (
        <div className="relative isolate min-h-[600px]">
            {/* Main Content - Blurred but visible as preview */}
            <div className="blur-lg opacity-40 pointer-events-none select-none transition-all duration-700">
                {children}
            </div>

            {/* Login Gate */}
            <div className="absolute inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white p-7 rounded-2xl shadow-xl max-w-sm w-full text-center border border-gray-100"
                >
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-blue-600">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">התוצאות מוכנות!</h3>
                    <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                        התחברו כדי לגלות את סיכויי הקבלה שלכם ולשמור את כל הנתונים.
                        זה לוקח 3 שניות.
                    </p>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 font-bold py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                        <span>התחברות מהירה עם Google</span>
                    </button>

                    <p className="mt-4 text-[11px] text-gray-400 leading-relaxed">
                        ככה אנחנו שומרים לך את הנתונים למפגש הבא.
                        בהתחברות אני מאשר/ת את <a href="/terms" className="underline">תנאי השימוש</a>.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
