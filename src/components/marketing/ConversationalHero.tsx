import { motion } from 'framer-motion';
import { trackEvent } from '../../utils/gtm';
import { useEffect } from 'react';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

interface ConversationalHeroProps {
    onStartUpload: () => void;
    onManual: () => void;
}

function StatNumber({ value, suffix = '+', label }: { value: number; suffix?: string; label: string }) {
    const { ref, displayValue } = useAnimatedCounter(value, 1.5);
    const formatted = displayValue >= 1000
        ? `${(displayValue / 1000).toFixed(displayValue >= 10000 ? 0 : 1)}K`
        : displayValue.toLocaleString('he-IL');
    return (
        <div className="flex flex-col items-center">
            <span ref={ref} className="text-2xl md:text-3xl font-black text-gray-900">{formatted}{suffix}</span>
            <span className="text-xs text-gray-500 font-medium mt-0.5">{label}</span>
        </div>
    );
}

export function ConversationalHero({ onStartUpload, onManual }: ConversationalHeroProps) {

    useEffect(() => {
        trackEvent('hero_impression', { source: 'hero_v5' });
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.12 } }
    };

    const item = {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
    };

    return (
        <div className="relative w-full overflow-hidden rounded-3xl">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-brand-purple-50/60 via-white to-white" />

            <div className="relative flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-10 md:py-16">

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="w-full flex flex-col items-center gap-6 md:gap-8"
                >
                    {/* Social Proof Stats */}
                    <motion.div variants={item} className="flex items-center gap-6 md:gap-10">
                        <StatNumber value={50000} label="בקהילה" />
                        <div className="w-px h-8 bg-gray-200" />
                        <StatNumber value={500} label="תוכניות לימוד" />
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="flex flex-col items-center">
                            <span className="text-2xl md:text-3xl font-black text-gray-900">7+</span>
                            <span className="text-xs text-gray-500 font-medium mt-0.5">שנות ניסיון</span>
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <motion.div variants={item} className="text-center space-y-3 md:space-y-4">
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.15]">
                            אל תתלבט{' '}<span className="text-brand-purple-600">לבד.</span>
                        </h1>
                        <p className="text-base md:text-lg font-semibold text-brand-purple-700 max-w-md mx-auto">
                            גלה בדיוק לאן אתה מתקבל ומה צריך כדי לשפר — הכל במקום אחד
                        </p>
                        <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-lg mx-auto">
                            מחשבים את ממוצע הבגרות שלך לפי הנוסחאות של <strong>כל אוניברסיטה</strong>,
                            מראים לך בדיוק לאיפה יש לך סיכוי להתקבל, ומחברים אותך לקהילה של אלפי תלמידים.
                        </p>
                    </motion.div>

                    {/* CTAs — Two clean buttons */}
                    <motion.div variants={item} className="w-full max-w-sm flex flex-col gap-3">
                        <button
                            onClick={() => {
                                trackEvent('interaction_start', { method: 'ai', source: 'hero_primary' });
                                onStartUpload();
                            }}
                            className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-gradient-to-l from-brand-purple-600 to-brand-purple-700 hover:from-brand-purple-700 hover:to-brand-purple-800 text-white font-bold rounded-xl shadow-lg shadow-brand-purple-200 transition-all duration-200 active:scale-[0.98] text-base"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>סריקה חכמה ב-AI</span>
                            <span className="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full">מומלץ</span>
                        </button>

                        <button
                            onClick={() => {
                                trackEvent('interaction_start', { method: 'manual', source: 'hero_secondary' });
                                onManual();
                            }}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-white border border-gray-200 hover:border-brand-purple-300 hover:bg-brand-purple-50/30 text-gray-700 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] text-sm"
                        >
                            <span>✏️</span>
                            <span>הקלדה ידנית — 30 שניות</span>
                        </button>
                    </motion.div>

                    {/* Trust + Ministry Link */}
                    <motion.div variants={item} className="text-center space-y-2">
                        <p className="text-xs text-gray-400 font-medium">
                            100% בחינם · בלי ספאם · בלי התחייבות
                        </p>
                        <a
                            href="https://students.education.gov.il/matriculation-exams/grades"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackEvent('interaction_start', { method: 'ministry_link' })}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors py-1.5 px-3 rounded-full hover:bg-gray-50"
                        >
                            <span>חסרים לך ציונים?</span>
                            <span className="underline decoration-dashed decoration-gray-300 underline-offset-4">פורטל משרד החינוך</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </motion.div>

                </motion.div>
            </div>
        </div>
    );
}
