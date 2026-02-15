import { Link } from 'react-router-dom';
import { useState } from 'react';
import { trackEvent } from '../utils/gtm';
import { BugReportWidget } from './BugReportWidget';
import { clearAllUserData } from '../lib/userData';
import { isProduction } from '../utils/env';
import { supabase } from '../lib/supabase';

export function Footer() {
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone && !email) return;
        trackEvent('footer_lead_submit', { has_email: !!email, has_phone: !!phone });

        // Save to Supabase
        const { error } = await supabase
            .from('soft_leads')
            .insert([{
                phone,
                email: email || null,
                interest: 'general',
                source: 'footer_form',
            }]);

        if (error) console.error('Footer lead save error:', error);

        setSubmitted(true);
    };

    return (
        <footer className="bg-white border-t border-gray-100 mt-auto" dir="rtl">
            {/* Lead Capture Strip */}
            <div className="bg-brand-purple-50/50 border-b border-brand-purple-100">
                <div className="max-w-3xl mx-auto px-4 py-6">
                    {!submitted ? (
                        <form onSubmit={handleLeadSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                            <p className="text-sm font-bold text-gray-800 shrink-0">
                                השאירו פרטים ונחזור אליכם
                            </p>
                            <input
                                type="tel"
                                placeholder="טלפון"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full sm:w-40 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-purple-400 focus:ring-1 focus:ring-brand-purple-200"
                                dir="ltr"
                            />
                            <input
                                type="email"
                                placeholder="אימייל (אופציונלי)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full sm:w-48 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-purple-400 focus:ring-1 focus:ring-brand-purple-200"
                                dir="ltr"
                            />
                            <button
                                type="submit"
                                className="w-full sm:w-auto bg-brand-purple-600 hover:bg-brand-purple-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors shrink-0"
                            >
                                שלחו לי
                            </button>
                        </form>
                    ) : (
                        <p className="text-center text-sm font-bold text-brand-purple-700">
                            תודה! נחזור אליכם בהקדם
                        </p>
                    )}
                </div>
            </div>

            {/* Footer Content */}
            <div className="max-w-7xl mx-auto px-4 py-4 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                <div className="flex justify-center gap-6 mb-1">
                    <a
                        href="https://www.facebook.com/groups/mlimudim"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('social_exit', { platform: 'facebook', source: 'footer' })}
                        className="flex items-center gap-2 text-gray-400 hover:text-[#1877F2] transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        <span className="text-xs">פייסבוק</span>
                    </a>
                    <a
                        href="https://t.me/MitlabtimBot"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('social_exit', { platform: 'telegram', source: 'footer' })}
                        className="flex items-center gap-2 text-gray-400 hover:text-[#0088cc] transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                        <span className="text-xs">טלגרם</span>
                    </a>
                </div>

                <p>© 2026 מתלבטים בלימודים. נבנה לתלמידים, על ידי סטודנטים.</p>
                <div className="flex gap-4 items-center">
                    <Link
                        to="/blog"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="text-gray-400 hover:text-blue-500 underline decoration-gray-300 underline-offset-4 transition-colors text-xs"
                    >
                        בלוג
                    </Link>
                    <Link
                        to="/write-for-us"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="text-gray-400 hover:text-blue-500 underline decoration-gray-300 underline-offset-4 transition-colors text-xs"
                    >
                        כתבו אצלנו
                    </Link>
                    <Link
                        to="/terms"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="text-gray-400 hover:text-blue-500 underline decoration-gray-300 underline-offset-4 transition-colors text-xs"
                    >
                        תנאי שימוש
                    </Link>
                    {!isProduction && (
                        <button
                            onClick={async () => {
                                await clearAllUserData();
                                window.location.reload();
                            }}
                            className="text-xs text-red-300 hover:text-red-500 transition-colors opacity-50 hover:opacity-100"
                            title="Debug: Reset Welcome Flow"
                        >
                            [אפס משתמש]
                        </button>
                    )}
                    <BugReportWidget />
                </div>
            </div>
        </footer>
    );
}
