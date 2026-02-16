import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Calculator, ArrowLeft, Info } from 'lucide-react';

// ===== Subject Configurations =====

interface SubjectConfig {
    slug: string;
    name: string;
    externalWeight: number; // Weight of external exam (0-1)
    internalWeight: number; // Weight of internal grade (0-1)
    formulaExplanation: string;
    tips: string[];
    bonusInfo?: string;
}

const SUBJECTS: Record<string, SubjectConfig> = {
    math: {
        slug: 'math',
        name: 'מתמטיקה',
        externalWeight: 0.7,
        internalWeight: 0.3,
        formulaExplanation: 'ציון חיצוני × 70% + ציון פנימי (מגן) × 30%',
        tips: [
            'מתמטיקה 5 יח"ל מוסיפה +35 נקודות בונוס לממוצע הבגרות',
            'מתמטיקה 4 יח"ל מוסיפה +15 נקודות בונוס',
            'הטכניון מעניק בונוס מיוחד למתמטיקה 5 יח"ל (+30 נקודות)',
            'עברו על כל הנוסחאות — הן מופיעות בדף הנוסחאות שמצורף לבחינה',
        ],
        bonusInfo: '5 יח"ל: +35 נק\' | 4 יח"ל: +15 נק\'',
    },
    english: {
        slug: 'english',
        name: 'אנגלית',
        externalWeight: 0.7,
        internalWeight: 0.3,
        formulaExplanation: 'ציון חיצוני × 70% + ציון פנימי (מגן) × 30%',
        tips: [
            'אנגלית 5 יח"ל מוסיפה +25 נקודות בונוס לממוצע הבגרות',
            'ההבדל בין 4 ל-5 יח"ל שווה +12.5 נקודות בונוס',
            'תרגלו הבנת הנקרא — זה החלק הכי משמעותי בבחינה',
            'אוצר מילים אקדמי הוא המפתח לציון גבוה',
        ],
        bonusInfo: '5 יח"ל: +25 נק\' | 4 יח"ל: +12.5 נק\'',
    },
    physics: {
        slug: 'physics',
        name: 'פיזיקה',
        externalWeight: 0.7,
        internalWeight: 0.3,
        formulaExplanation: 'ציון חיצוני × 70% + ציון פנימי (מגן) × 30%',
        tips: [
            'פיזיקה 5 יח"ל מוסיפה +25 נקודות בונוס',
            'הבחינה כוללת 2 שאלונים — תכננו את הזמן בהתאם',
            'הטכניון מעניק בונוס מיוחד למדעים מדויקים',
            'שימו לב ליחידות מידה — טעויות נפוצות!',
        ],
        bonusInfo: '5 יח"ל: +25 נק\'',
    },
    bible: {
        slug: 'bible',
        name: 'תנ"ך',
        externalWeight: 0.7,
        internalWeight: 0.3,
        formulaExplanation: 'ציון חיצוני × 70% + ציון פנימי (מגן) × 30%',
        tips: [
            'תנ"ך הוא מקצוע חובה — 2 יח"ל',
            'הכירו את הטקסטים הנדרשים לעומק',
            'שימו דגש על פרשנות ועל שאלות השוואה',
            'כתבו תשובות מסודרות עם ציטוטים מהטקסט',
        ],
    },
    history: {
        slug: 'history',
        name: 'היסטוריה',
        externalWeight: 0.7,
        internalWeight: 0.3,
        formulaExplanation: 'ציון חיצוני × 70% + ציון פנימי (מגן) × 30%',
        tips: [
            'היסטוריה היא מקצוע חובה — 2 יח"ל',
            'ארגנו את החומר לפי תקופות ונושאים',
            'תרגלו כתיבת חיבורים — זה חלק מרכזי בבחינה',
            'שימו לב לקשרים בין אירועים היסטוריים',
        ],
    },
    literature: {
        slug: 'literature',
        name: 'ספרות',
        externalWeight: 0.7,
        internalWeight: 0.3,
        formulaExplanation: 'ציון חיצוני × 70% + ציון פנימי (מגן) × 30%',
        tips: [
            'ספרות היא מקצוע חובה — 2 יח"ל',
            'הכירו את כל היצירות הנדרשות — שירה ופרוזה',
            'תרגלו ניתוח טקסטים ספרותיים עם מונחים מקצועיים',
            'כתבו תשובות מפורטות עם דוגמאות מהטקסטים',
        ],
    },
    chemistry: {
        slug: 'chemistry',
        name: 'כימיה',
        externalWeight: 0.7,
        internalWeight: 0.3,
        formulaExplanation: 'ציון חיצוני × 70% + ציון פנימי (מגן) × 30%',
        tips: [
            'כימיה 5 יח"ל מוסיפה +20 נקודות בונוס (כללי) או +25 (טכניון/בן גוריון)',
            'שננו את הטבלה המחזורית — היא מצורפת לבחינה אבל צריך להבין אותה',
            'תרגלו חישובים סטכיומטריים — הם חוזרים בכל בחינה',
            'הבינו את ההבדלים בין סוגי תגובות כימיות',
        ],
        bonusInfo: '5 יח"ל: +20–25 נק\'',
    },
    biology: {
        slug: 'biology',
        name: 'ביולוגיה',
        externalWeight: 0.7,
        internalWeight: 0.3,
        formulaExplanation: 'ציון חיצוני × 70% + ציון פנימי (מגן) × 30%',
        tips: [
            'ביולוגיה 5 יח"ל מוסיפה +20 נקודות בונוס (כללי) או +25 (טכניון/בן גוריון)',
            'שימו דגש על גנטיקה ואקולוגיה — מופיעים בהרחבה בבחינות',
            'תרגלו ניסויים ושאלות פתוחות',
            'שרטטו תרשימים ברורים — זה מוסיף נקודות',
        ],
        bonusInfo: '5 יח"ל: +20–25 נק\'',
    },
};

const ALL_SUBJECTS = Object.values(SUBJECTS);

export function SubjectGradeCalculatorPage() {
    const { subject: subjectSlug } = useParams<{ subject: string }>();
    const config = subjectSlug ? SUBJECTS[subjectSlug] : null;

    const [externalGrade, setExternalGrade] = useState<string>('');
    const [internalGrade, setInternalGrade] = useState<string>('');

    if (!config) {
        // Index page — show all subjects
        return (
            <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
                <Helmet>
                    <title>חישוב ציון בגרות משוקלל במקצוע — מתלבטים בלימודים</title>
                    <meta name="description" content="חשבו את הציון הסופי המשוקלל בכל מקצוע בגרות — מתמטיקה, אנגלית, פיזיקה, כימיה, ביולוגיה, היסטוריה, ספרות ותנך. ציון חיצוני + מגן." />
                    <link rel="canonical" href="https://mitlabtim.co.il/calculate-grade" />
                </Helmet>
                <Header />
                <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">חישוב ציון בגרות משוקלל במקצוע</h1>
                        <p className="text-gray-500">בחרו מקצוע כדי לחשב את הציון הסופי המשוקלל</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {ALL_SUBJECTS.map(s => (
                            <Link
                                key={s.slug}
                                to={`/calculate-grade/${s.slug}`}
                                className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:border-blue-300 hover:shadow-sm transition-all"
                            >
                                <div className="font-bold text-gray-900">{s.name}</div>
                                {s.bonusInfo && <div className="text-xs text-blue-600 mt-1">{s.bonusInfo}</div>}
                            </Link>
                        ))}
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Calculator page for specific subject
    const ext = parseFloat(externalGrade) || 0;
    const int = parseFloat(internalGrade) || 0;
    const finalGrade = ext > 0 || int > 0
        ? Math.round((ext * config.externalWeight + int * config.internalWeight) * 10) / 10
        : 0;

    const pageTitle = `חישוב ציון בגרות ב${config.name} — מחשבון ציון משוקלל 2026`;
    const pageDescription = `מחשבון ציון בגרות משוקלל ב${config.name} — הזינו ציון חיצוני וציון מגן וקבלו את הציון הסופי. נוסחה: ${config.formulaExplanation}`;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="keywords" content={`ציון בגרות ${config.name}, חישוב ציון ${config.name}, ציון משוקלל ${config.name}, בגרות ${config.name} 2026, מחשבון ציון בגרות`} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <link rel="canonical" href={`https://mitlabtim.co.il/calculate-grade/${config.slug}`} />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": `מחשבון ציון בגרות ב${config.name}`,
                    "url": `https://mitlabtim.co.il/calculate-grade/${config.slug}`,
                    "applicationCategory": "EducationalApplication",
                    "operatingSystem": "Web",
                    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "ILS" },
                    "inLanguage": "he",
                })}</script>
            </Helmet>
            <Header />

            <main className="flex-grow max-w-2xl mx-auto w-full px-4 py-8">
                {/* Back link */}
                <Link to="/calculate-grade" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    כל המקצועות
                </Link>

                {/* Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                        <Calculator className="w-4 h-4" />
                        מחשבון ציון משוקלל
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">חישוב ציון בגרות ב{config.name}</h1>
                    <p className="text-gray-500 text-sm">{config.formulaExplanation}</p>
                </div>

                {/* Calculator */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">ציון חיצוני (בחינה)</label>
                            <input
                                type="number"
                                value={externalGrade}
                                onChange={(e) => setExternalGrade(e.target.value)}
                                placeholder="0–100"
                                min="0" max="100"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <div className="text-xs text-gray-400 mt-1">משקל: {config.externalWeight * 100}%</div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">ציון פנימי (מגן)</label>
                            <input
                                type="number"
                                value={internalGrade}
                                onChange={(e) => setInternalGrade(e.target.value)}
                                placeholder="0–100"
                                min="0" max="100"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <div className="text-xs text-gray-400 mt-1">משקל: {config.internalWeight * 100}%</div>
                        </div>
                    </div>

                    {/* Result */}
                    <div className={`rounded-xl p-5 text-center transition-all ${finalGrade > 0 ? 'bg-gradient-to-l from-blue-600 to-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <div className="text-sm font-medium mb-1">{finalGrade > 0 ? 'הציון הסופי המשוקלל' : 'הזינו ציונים לחישוב'}</div>
                        <div className="text-5xl font-bold">{finalGrade > 0 ? finalGrade : '—'}</div>
                        {finalGrade > 0 && ext > 0 && int > 0 && (
                            <div className="text-xs mt-2 opacity-80">
                                {ext} × {config.externalWeight} + {int} × {config.internalWeight} = {finalGrade}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bonus info */}
                {config.bonusInfo && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <Info className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                        <div>
                            <div className="font-bold text-gray-900 text-sm">בונוס לממוצע הבגרות</div>
                            <div className="text-sm text-gray-600 mt-0.5">{config.name}: {config.bonusInfo}</div>
                            <div className="text-xs text-gray-400 mt-1">הבונוס מתווסף לממוצע הבגרות המשוקלל לצורך חישוב סכם</div>
                        </div>
                    </div>
                )}

                {/* Tips */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                    <h2 className="font-bold text-gray-900 mb-3">טיפים ל{config.name}</h2>
                    <ul className="space-y-2 text-sm text-gray-700">
                        {config.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Link
                        to="/calculator"
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors text-sm"
                    >
                        <Calculator className="w-4 h-4" />
                        חשבו ממוצע בגרות מלא ובדקו סיכויי קבלה
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}
