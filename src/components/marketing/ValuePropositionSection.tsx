import { motion } from 'framer-motion';
import { Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '../../utils/gtm';

const channels = [
    { name: 'הייטק והנדסה', emoji: '💻', desc: 'מדעי המחשב, הנדסה, סייבר' },
    { name: 'רפואה ובריאות', emoji: '🩺', desc: 'רפואה, סיעוד, רוקחות' },
    { name: 'משפטים וממשל', emoji: '⚖️', desc: 'משפטים, מדעי המדינה' },
    { name: 'נפש וחברה', emoji: '🧠', desc: 'פסיכולוגיה, עבודה סוציאלית' },
    { name: 'ניהול ועסקים', emoji: '📊', desc: 'מנהל עסקים, כלכלה, יזמות' },
    { name: 'עיצוב ואדריכלות', emoji: '🎨', desc: 'אדריכלות, תקשורת חזותית' },
];

const features = [
    {
        title: 'מחשבון בגרויות',
        desc: 'ממוצע מדויק לפי הנוסחאות הרשמיות של כל אוניברסיטה',
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80',
        action: 'calculator',
    },
    {
        title: 'סימולטור שיפורים',
        desc: 'רואים בדיוק כמה ציון אחד ישפר את הסיכויים',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80',
        action: 'dashboard',
    },
    {
        title: 'חיפוש תארים חכם',
        desc: 'מתוך 500+ תוכניות — לאן יש סיכוי להתקבל?',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80',
        action: 'programs',
    },
    {
        title: 'תוכן ומדריכים',
        desc: 'פסיכומטרי, ערעורים, מלגות, ימים פתוחים',
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80',
        action: 'blog',
    },
];

const universities = [
    'הטכניון', 'אוניברסיטת תל אביב', 'האוניברסיטה העברית', 'אוניברסיטת בן גוריון',
    'בר-אילן', 'אוניברסיטת חיפה', 'אוניברסיטת אריאל', 'רייכמן', 'המכללה למנהל',
    'ספיר', 'שנקר', 'בצלאל', 'MTA', 'עזריאלי',
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function ValuePropositionSection() {
    const navigate = useNavigate();

    const handleAction = (action: string) => {
        trackEvent('feature_click', { feature: action, source: 'homepage_grid' });
        if (action === 'programs') navigate('/programs');
        else if (action === 'blog') navigate('/blog');
        else if (action === 'dashboard') navigate('/dashboard');
    };

    return (
        <div className="w-full">
            {/* Features Grid */}
            <div className="py-14 md:py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-10"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            כל הכלים במקום אחד
                        </h2>
                        <p className="text-gray-500 text-sm md:text-base">מחשבון, סימולטור, חיפוש תארים ועוד</p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                        {features.map((f) => (
                            <motion.button
                                key={f.title}
                                variants={itemVariants}
                                onClick={() => handleAction(f.action)}
                                className="group bg-white rounded-2xl border border-gray-100 hover:border-brand-purple-200 overflow-hidden transition-all duration-300 hover:shadow-lg text-right"
                            >
                                <div className="h-32 md:h-36 overflow-hidden">
                                    <img
                                        src={f.image}
                                        alt={f.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1">{f.title}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{f.desc}</p>
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-purple-600 group-hover:text-brand-purple-700 transition-colors">
                                        נסו עכשיו
                                        <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
                                    </span>
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* University Logos Banner */}
            <div className="py-8 bg-gray-50/80 border-y border-gray-100 overflow-hidden">
                <p className="text-center text-xs text-gray-400 font-medium mb-4 tracking-wide">נתוני קבלה מעודכנים מהמוסדות המובילים</p>
                <div className="relative">
                    <div className="flex animate-marquee whitespace-nowrap">
                        {[...universities, ...universities].map((name, i) => (
                            <span
                                key={i}
                                className="mx-6 text-sm font-semibold text-gray-400 hover:text-brand-purple-500 transition-colors shrink-0"
                            >
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Telegram Community Section — Compact 3-Column */}
            <div id="community" className="py-14 md:py-16 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 bg-[#e3f2fd] text-[#0088cc] text-xs font-bold px-3 py-1 rounded-full mb-3">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                            <span>50,000+ בקהילה</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            הצטרפו לשיחה
                        </h2>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">
                            ערוצים ממוקדים לפי תחום — שואלים, עוזרים, ומתקדמים ביחד
                        </p>
                    </div>

                    {/* 3-Column Channel Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-40px' }}
                        className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8"
                    >
                        {channels.map((ch) => (
                            <motion.a
                                key={ch.name}
                                variants={itemVariants}
                                href="https://t.me/MitlabtimBot"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackEvent('channel_click', { channel: ch.name, source: 'homepage' })}
                                className="group flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-[#2AABEE]/30 hover:bg-[#f5f9ff] transition-all cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2AABEE] to-[#229ED9] flex items-center justify-center shrink-0 text-base shadow-sm">
                                    {ch.emoji}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xs md:text-sm font-bold text-gray-900 truncate">{ch.name}</h3>
                                    <p className="text-[10px] md:text-xs text-gray-400 truncate">{ch.desc}</p>
                                </div>
                            </motion.a>
                        ))}
                    </motion.div>

                    {/* CTAs */}
                    <div className="text-center space-y-3">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <a
                                href="https://t.me/MitlabtimBot"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackEvent('social_exit', { platform: 'telegram', source: 'homepage_cta' })}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]"
                            >
                                <Send className="w-4 h-4" />
                                <span>הצטרפות לבוט בטלגרם</span>
                            </a>
                            <a
                                href="https://www.facebook.com/groups/mlimudim"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackEvent('social_exit', { platform: 'facebook', source: 'homepage_cta' })}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-bold py-3 px-6 rounded-xl transition-all"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                <span>קבוצת פייסבוק</span>
                            </a>
                        </div>
                        <p className="text-xs text-gray-400">100% בחינם, בלי ספאם, תמיד אפשר לעזוב</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
