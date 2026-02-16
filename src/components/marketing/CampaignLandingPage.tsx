import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { trackConversion, getAttributionData } from '../../utils/ads-tracking';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

export interface CampaignConfig {
    slug: string;
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaUrl: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    heroEmoji?: string;
    features: Array<{ icon: string; title: string; desc: string }>;
}

function AnimatedStat({ value, label }: { value: number; label: string }) {
    const { ref, displayValue } = useAnimatedCounter(value, 1.5);
    const formatted = displayValue >= 1000
        ? `${(displayValue / 1000).toFixed(displayValue >= 10000 ? 0 : 1)}K`
        : displayValue.toLocaleString('he-IL');
    return (
        <div className="flex flex-col items-center">
            <span ref={ref} className="text-2xl font-black text-white">{formatted}+</span>
            <span className="text-xs text-white/70 font-medium mt-0.5">{label}</span>
        </div>
    );
}

export function CampaignLandingPage({ config }: { config: CampaignConfig }) {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone || !agreed) return;
        setIsSubmitting(true);

        try {
            const attribution = getAttributionData();

            await supabase.from('soft_leads').insert([{
                full_name: name,
                phone,
                interest: config.slug,
                source: `campaign_${config.slug}`,
                landing_page: attribution.landing_page,
                referrer: attribution.referrer,
                ...attribution,
            }]);

            localStorage.setItem('lead_captured', 'true');

            trackConversion('lead_submitted', {
                source: `campaign_${config.slug}`,
                content_name: config.headline,
                content_category: 'campaign_landing',
            });

            setSubmitted(true);
            setTimeout(() => navigate(config.ctaUrl), 1500);
        } catch (err) {
            console.error('Campaign lead error:', err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white" dir="rtl">
            <Helmet>
                <title>{config.metaTitle}</title>
                <meta name="description" content={config.metaDescription} />
                <meta name="keywords" content={config.keywords} />
                <meta property="og:title" content={config.metaTitle} />
                <meta property="og:description" content={config.metaDescription} />
                <link rel="canonical" href={`https://mitlabtim.co.il/l/${config.slug}`} />
            </Helmet>

            {/* Minimal Header */}
            <header className="bg-white border-b border-gray-100 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo_new.png" alt="מתלבטים" className="h-8 w-auto" />
                        <span className="font-bold text-gray-900 text-sm">מתלבטים בלימודים</span>
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-gradient-to-b from-brand-purple-600 to-indigo-700 text-white">
                <div className="max-w-2xl mx-auto px-4 py-12 md:py-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {config.heroEmoji && (
                            <span className="text-5xl mb-4 block">{config.heroEmoji}</span>
                        )}
                        <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight">
                            {config.headline}
                        </h1>
                        <p className="text-lg text-white/80 max-w-md mx-auto mb-8">
                            {config.subheadline}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-center gap-6 md:gap-10 mb-8">
                            <AnimatedStat value={50000} label="בקהילה" />
                            <div className="w-px h-8 bg-white/20" />
                            <AnimatedStat value={500} label="תוכניות לימוד" />
                            <div className="w-px h-8 bg-white/20" />
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-black text-white">7+</span>
                                <span className="text-xs text-white/70 font-medium mt-0.5">שנות ניסיון</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-2xl mx-auto px-4 -mt-6">
                <div className="grid grid-cols-3 gap-3">
                    {config.features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm"
                        >
                            <span className="text-2xl block mb-2">{f.icon}</span>
                            <div className="text-sm font-bold text-gray-900">{f.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{f.desc}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Lead Form */}
            <section className="max-w-md mx-auto px-4 py-10 w-full">
                {!submitted ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                            <h2 className="text-lg font-bold text-gray-900 text-center mb-1">
                                השאירו פרטים ונתחיל
                            </h2>
                            <p className="text-xs text-gray-500 text-center mb-5">
                                נחזור אליכם עם מידע מותאם אישית
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple-500 focus:bg-white focus:border-brand-purple-500 transition-all outline-none text-gray-900"
                                    placeholder="שם מלא"
                                />
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple-500 focus:bg-white focus:border-brand-purple-500 transition-all outline-none text-gray-900"
                                    placeholder="טלפון נייד"
                                    dir="ltr"
                                    style={{ textAlign: 'right' }}
                                />

                                <div className="flex items-start gap-2 py-1">
                                    <input
                                        id={`terms-${config.slug}`}
                                        type="checkbox"
                                        required
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="w-4 h-4 mt-0.5 text-brand-purple-600 border-gray-300 rounded focus:ring-brand-purple-500"
                                    />
                                    <label htmlFor={`terms-${config.slug}`} className="text-xs text-gray-500 leading-tight cursor-pointer">
                                        אני מאשר/ת את <a href="/terms" target="_blank" className="text-brand-purple-600 underline">תנאי השימוש</a>
                                        {' '}ומאשר/ת קבלת מידע בטלפון ובמסרון.
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !name || !phone || !agreed}
                                    className="w-full py-3.5 bg-gradient-to-l from-brand-purple-600 to-brand-purple-700 hover:from-brand-purple-700 hover:to-brand-purple-800 text-white font-bold rounded-xl shadow-lg shadow-brand-purple-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                >
                                    {isSubmitting ? 'שולח...' : config.ctaText}
                                </button>
                            </form>

                            <button
                                onClick={() => navigate(config.ctaUrl)}
                                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors mt-3"
                            >
                                דלג/י — עבור ישירות לכלי
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-50 rounded-2xl border border-green-200 p-8 text-center"
                    >
                        <span className="text-4xl mb-3 block">✅</span>
                        <h3 className="text-lg font-bold text-green-800 mb-1">תודה!</h3>
                        <p className="text-sm text-green-600">מעבירים אותך לכלי...</p>
                    </motion.div>
                )}
            </section>

            {/* Minimal Footer */}
            <footer className="mt-auto bg-gray-50 border-t border-gray-100 py-4 px-4 text-center">
                <p className="text-xs text-gray-400">
                    © 2026 מתלבטים בלימודים · <Link to="/terms" className="underline">תנאי שימוש</Link>
                </p>
            </footer>
        </div>
    );
}
