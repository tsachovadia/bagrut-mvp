import { motion } from 'framer-motion';
import { trackEvent } from '../../utils/gtm';
import { useEffect } from 'react';

interface ConversationalHeroProps {
    onStartUpload: () => void;
    onManual: () => void;
}

export function ConversationalHero({ onStartUpload, onManual }: ConversationalHeroProps) {

    useEffect(() => {
        trackEvent('hero_impression', { source: 'mobile_redesign_v1' });
    }, []);

    // Stagger animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto px-4 py-8 relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-lg pointer-events-none opacity-30 blur-3xl -z-10">
                <div className="absolute top-10 left-10 w-40 h-40 bg-brand-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-10 right-10 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-40 h-40 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="w-full max-w-md flex flex-col gap-6"
            >
                {/* Header Section */}
                <motion.div variants={item} className="text-center space-y-2">
                    <span className="inline-block text-4xl mb-2 animate-bounce-slow">🚀</span>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                        בוא נבדוק את<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple-600 to-brand-green-600">סיכויי הקבלה שלך</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg px-4">
                        הדרך המהירה והמדויקת ביותר, בחינם.
                    </p>
                </motion.div>

                {/* Cards Container */}
                <div className="flex flex-col-reverse md:flex-col gap-4 mt-4">

                    {/* Card 2: Manual Entry - Clean Option */}
                    <motion.button
                        variants={item}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            trackEvent('interaction_start', { method: 'manual', source: 'hero_card' });
                            onManual();
                        }}
                        className="group bg-white/40 backdrop-blur-md border border-white/50 hover:border-brand-green-300 shadow-lg shadow-brand-green-500/5 rounded-3xl p-6 text-right transition-all duration-300"
                    >
                        <div className="flex items-center gap-5">
                            <div className="bg-brand-green-50/80 p-3.5 rounded-2xl group-hover:bg-brand-green-100 transition-colors">
                                <span className="text-3xl">✏️</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">הקלדה ידנית</h3>
                                <p className="text-sm text-gray-500 mt-1 font-medium">למי שאין קובץ זמין כרגע, הזנה מהירה ב-30 שניות</p>
                            </div>
                        </div>
                    </motion.button>

                    {/* Card 1: AI / Upload - Primary Premium Option */}
                    <motion.button
                        variants={item}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            trackEvent('interaction_start', { method: 'ai', source: 'hero_card' });
                            onStartUpload();
                        }}
                        className="relative group overflow-hidden bg-white/60 backdrop-blur-xl border border-white/60 hover:border-brand-purple-300 shadow-xl shadow-brand-purple-500/10 rounded-3xl p-6 text-right transition-all duration-300 opacity-80 md:opacity-100"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple-50/50 to-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="absolute top-4 left-4">
                            <div className="bg-gradient-to-r from-brand-purple-600 to-brand-purple-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-brand-purple-500/30 animate-pulse hidden md:block">
                                מומלץ ✨
                            </div>
                        </div>

                        <div className="relative flex items-center gap-5">
                            <div className="bg-brand-purple-100/80 p-3.5 rounded-2xl shadow-inner group-hover:bg-brand-purple-100 transition-colors">
                                <span className="text-3xl">📸</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">סריקה חכמה ב-AI</h3>
                                <p className="text-sm text-gray-500 mt-1 font-medium">מעלים צילום של הבגרות והמערכת מחשבת הכל לבד</p>
                            </div>
                        </div>
                    </motion.button>
                </div>

                {/* Trust/Ministry Link - Microcopy */}
                <motion.div variants={item} className="mt-6 text-center">
                    <a
                        href="https://students.education.gov.il/matriculation-exams/grades"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('interaction_start', { method: 'ministry_link' })}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors py-2 px-4 rounded-full hover:bg-gray-50"
                    >
                        <span>חסרים לך ציונים?</span>
                        <span className="underline decoration-dashed decoration-gray-300 underline-offset-4">כניסה לפורטל משרד החינוך</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </motion.div>

            </motion.div>
        </div>
    );
}
