import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAnalytics } from '../hooks/useAnalytics';
import { motion } from 'framer-motion';
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
    const [submitting, setSubmitting] = useState(false); // Kept as it's used later
    const [error, setError] = useState('');
    const { trackEvent } = useAnalytics();

    // Local state to bypass the check immediately after successful update without waiting for session subscription
    const [profileCompleted, setProfileCompleted] = useState(false);

    // Track when results are unlocked (strictly once)
    useEffect(() => {
        if (session && hasPhone) {
            trackEvent('results_unlocked', {
                verified: true,
                method: 'google_auth_phone'
            });
        }
    }, [session, hasPhone, trackEvent]); // Added trackEvent to dependency array

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
            const { data, error } = await supabase.auth.updateUser({
                data: { mobile_phone: phone, terms_accepted: true }
            });

            if (error) throw error;

            trackEvent('profile_completed', { phone: 'collected' });
            setProfileCompleted(true);
            setHasPhone(true); // Update local state immediately

            // Refresh session to Ensure downstream components get the latest metadata if needed
            await supabase.auth.refreshSession();

        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError('שגיאה בשמירת הנתונים, נסה שוב');
        } finally {
            setSubmitting(false);
        }
    };

    const canViewResults = session && (hasPhone || profileCompleted);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">בודק הרשאות...</div>;
    }

    if (canViewResults) {
        return <>{children}</>;
    }

    // If session exists but phone is not collected, show phone collection form
    if (session && !canViewResults) {
        return (
            <div className="relative min-h-[500px]">
                {/* Blurred Content Preview */}
                <div className="filter blur-lg pointer-events-none select-none opacity-30 relative h-96 overflow-hidden" aria-hidden="true">
                    {children}
                </div>

                {/* Phone Collection Overlay */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 bg-white/60">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border border-gray-200"
                    >
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">פרט אחד אחרון...</h3>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                            כדי לשמור את התוצאות ולהציג לך התאמות מדויקות, אנו זקוקים למספר הנייד שלך.
                        </p>

                        <div className="space-y-4">
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="מספר נייד (לדוגמה: 050-1234567)"
                                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center font-medium text-lg"
                                dir="ltr"
                            />

                            <label className="flex items-start gap-3 text-xs text-gray-600 text-right cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span>
                                    אני מאשר/ת את <a href="/terms" target="_blank" className="text-blue-600 underline hover:text-blue-700">תנאי השימוש</a> ומדיניות הפרטיות, ומסכים/ה לקבל עדכונים והצעות רלוונטיות.
                                </span>
                            </label>

                            {error && (
                                <p className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg animate-in fade-in slide-in-from-top-1">
                                    {error}
                                </p>
                            )}

                            <button
                                onClick={handlePhoneSubmit}
                                disabled={submitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {submitting ? 'שומר נתונים...' : 'הצג תוצאות'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // User is not logged in, show gate
    return (
        <div className="relative isolate">
            {/* Main Content - Blurred when locked */}
            <div className={`transition-all duration-700 ${!canViewResults ? 'blur-2xl opacity-20 pointer-events-none select-none grayscale' : ''}`}>
                {children}
            </div>

            {/* Gate Overlay */}
            {!canViewResults && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-white/50"
                    >
                        <div className="w-16 h-16 bg-blue-100/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-2">רוצים לראות את התוצאות?</h3>
                        <p className="text-gray-600 mb-6">התחברו כדי לראות את סיכויי הקבלה שלכם לכל האוניברסיטאות ולשמור את הנתונים להמשך.</p>

                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            <span>התחברות עם Google</span>
                        </button>

                        <p className="mt-4 text-xs text-gray-400">
                            בהתחברות אני מאשר/ת את תנאי השימוש ומדיניות הפרטיות
                        </p>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
