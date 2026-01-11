import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../utils/gtm';
import { motion } from 'framer-motion';
import type { Session } from '@supabase/supabase-js';

interface ResultsAuthGateProps {
    children: React.ReactNode;
}


export function ResultsAuthGate({ children }: ResultsAuthGateProps) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleGoogleLogin = async () => {
        trackEvent('login_attempt', { method: 'google', source: 'results_gate' });
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) console.error('Error logging in:', error.message);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">בודק הרשאות...</div>;
    }

    if (session) {
        // User is logged in, show content
        return <>{children}</>;
    }

    // User is not logged in, show gate
    return (
        <div className="relative">
            {/* Blurred Content Preview */}
            <div className="filter blur-md pointer-events-none select-none opacity-50 relative h-96 overflow-hidden">
                {children}
            </div>

            {/* Gate Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-transparent to-white/90">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-gray-100"
                >
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
        </div>
    );
}
