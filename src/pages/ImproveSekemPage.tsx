import { Helmet } from 'react-helmet-async';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { TrendingUp, BookOpen, Brain, Calculator, ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const SEKEM_FORMULAS = [
    {
        university: 'הטכניון',
        formula: 'סכם = 0.5 × ממוצע בגרות + 0.075 × פסיכומטרי − 18',
        example: 'ממוצע 105 + פסיכומטרי 700 → סכם = 0.5×105 + 0.075×700 − 18 = 87',
        note: 'נוסחה ליניארית מדויקת',
    },
    {
        university: 'אוניברסיטת תל אביב',
        formula: 'סכם ≈ (ממוצע בגרות × 4 + פסיכומטרי) / 2 + 30',
        example: 'ממוצע 105 + פסיכומטרי 700 → סכם ≈ (420+700)/2 + 30 = 590',
        note: 'קירוב — TAU משתמשת בטבלאות',
    },
    {
        university: 'אוניברסיטת בן גוריון',
        formula: 'סכם ≈ (ממוצע בגרות × 3.5 + פסיכומטרי) / 2 + 50',
        example: 'ממוצע 105 + פסיכומטרי 700 → סכם ≈ (367.5+700)/2 + 50 = 583.75',
        note: 'קירוב — BGU משתמשת בטבלאות',
    },
    {
        university: 'האוניברסיטה העברית',
        formula: 'דומה לתל אביב עם משקלות שונים לפי חוג',
        example: 'המשקל של הפסיכומטרי בדרך כלל 50%–70%',
        note: 'משתנה לפי חוג',
    },
];

const BONUS_TABLE = [
    { subject: 'מתמטיקה', units5: 35, units4: 15 },
    { subject: 'אנגלית', units5: 25, units4: 12.5 },
    { subject: 'פיזיקה', units5: 25, units4: '—' },
    { subject: 'כימיה / ביולוגיה', units5: 20, units4: '—' },
    { subject: 'מקצוע בחירה אחר', units5: 20, units4: 10 },
];

export function ImproveSekemPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
            <Helmet>
                <title>מה זה סכם ואיך לשפר אותו? — המדריך המלא 2026 | מתלבטים בלימודים</title>
                <meta name="description" content="מדריך מקיף על סכם (ציון קבלה לאוניברסיטה) — מה זה סכם, איך מחשבים אותו, נוסחאות לכל אוניברסיטה, וטיפים לשיפור דרך בגרויות או פסיכומטרי." />
                <meta name="keywords" content="מה זה סכם, שיפור סכם, סכם אוניברסיטאי, חישוב סכם, איך לשפר סכם, סכם טכניון, סכם תל אביב, סכם בן גוריון, סכם העברית, שיפור בגרויות, שיפור פסיכומטרי" />
                <meta property="og:title" content="מה זה סכם ואיך לשפר אותו? — המדריך המלא" />
                <meta property="og:description" content="נוסחאות סכם לכל אוניברסיטה, טבלת בונוסים, והשוואה בין שיפור בגרויות לפסיכומטרי." />
                <link rel="canonical" href="https://mitlabtim.co.il/improve-sekem" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": "מה זה סכם ואיך לשפר אותו? — המדריך המלא 2026",
                    "description": "מדריך מקיף על סכם — ציון הקבלה האוניברסיטאי. נוסחאות, טבלת בונוסים, והשוואה בין מסלולי שיפור.",
                    "author": { "@type": "Organization", "name": "מתלבטים בלימודים" },
                    "publisher": { "@type": "Organization", "name": "מתלבטים בלימודים", "url": "https://mitlabtim.co.il" },
                    "inLanguage": "he",
                })}</script>
            </Helmet>
            <Header />

            <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-8">
                {/* Hero */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                        <TrendingUp className="w-4 h-4" />
                        מדריך מקיף
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">מה זה סכם ואיך לשפר אותו?</h1>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        סכם (ציון קבלה) הוא המספר שמשלב את ממוצע הבגרות עם ציון הפסיכומטרי.
                        כל אוניברסיטה מחשבת אותו אחרת — והנה בדיוק איך.
                    </p>
                </div>

                {/* What is Sekem */}
                <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        מה זה סכם?
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        <strong>סכם</strong> (או "ציון משוקלל") הוא ציון הקבלה המשולב שמחשבות האוניברסיטאות כדי להשוות בין מועמדים.
                        הוא מורכב בדרך כלל משני מרכיבים:
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-blue-700">ממוצע בגרות</div>
                            <div className="text-xs text-blue-600 mt-1">כולל בונוסים ליח"ל מוגברות</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-purple-700">פסיכומטרי</div>
                            <div className="text-xs text-purple-600 mt-1">ציון 200–800</div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        ברוב האוניברסיטאות, הפסיכומטרי מקבל משקל של <strong>50%–70%</strong> מהסכם הסופי.
                        לכן שיפור הפסיכומטרי בדרך כלל משפיע יותר מאשר שיפור הבגרויות — אבל לא תמיד.
                    </p>
                </section>

                {/* Formulas */}
                <section className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-green-600" />
                        נוסחאות סכם לפי אוניברסיטה
                    </h2>
                    <div className="space-y-3">
                        {SEKEM_FORMULAS.map((f, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-gray-900">{f.university}</h3>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{f.note}</span>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 mb-2 font-mono text-sm text-gray-700 leading-relaxed" dir="ltr">
                                    {f.formula}
                                </div>
                                <div className="text-xs text-gray-500">
                                    <strong>דוגמה:</strong> {f.example}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Bonus Table */}
                <section className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                    <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
                        <h2 className="font-bold text-gray-900">טבלת בונוסים לממוצע הבגרות</h2>
                        <p className="text-xs text-gray-500">נקודות שמתווספות לממוצע הבגרות לפני חישוב הסכם</p>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-right text-sm font-bold text-gray-700 px-5 py-2">מקצוע</th>
                                <th className="text-right text-sm font-bold text-gray-700 px-5 py-2">5 יח"ל</th>
                                <th className="text-right text-sm font-bold text-gray-700 px-5 py-2">4 יח"ל</th>
                            </tr>
                        </thead>
                        <tbody>
                            {BONUS_TABLE.map((row, i) => (
                                <tr key={i} className="border-b border-gray-100">
                                    <td className="px-5 py-2.5 text-sm font-medium text-gray-900">{row.subject}</td>
                                    <td className="px-5 py-2.5 text-sm text-green-700 font-bold">+{row.units5}</td>
                                    <td className="px-5 py-2.5 text-sm text-gray-600">{typeof row.units4 === 'number' ? `+${row.units4}` : row.units4}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Comparison: Bagrut vs Psychometric */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        מה עדיף לשפר — בגרויות או פסיכומטרי?
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl border border-blue-200 p-5">
                            <h3 className="font-bold text-blue-700 mb-2">שיפור בגרויות</h3>
                            <ul className="text-sm text-gray-600 space-y-1.5">
                                <li>+ מעלים יח"ל = בונוס משמעותי</li>
                                <li>+ אפשר לשפר מקצוע ספציפי</li>
                                <li>+ אין צורך בהכנה מקיפה</li>
                                <li className="text-red-500">− לוקח זמן (מועד בחינות)</li>
                                <li className="text-red-500">− השפעה קטנה יותר על הסכם</li>
                            </ul>
                            <div className="mt-3 text-xs text-blue-600 font-medium">
                                מתאים אם: הציון בבגרות נמוך משמעותית מהפוטנציאל
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-purple-200 p-5">
                            <h3 className="font-bold text-purple-700 mb-2">שיפור פסיכומטרי</h3>
                            <ul className="text-sm text-gray-600 space-y-1.5">
                                <li>+ משפיע 50%–70% מהסכם</li>
                                <li>+ אפשר לשפר ב-4 מועדים בשנה</li>
                                <li>+ קורסי הכנה אפקטיביים</li>
                                <li className="text-red-500">− עלות: 560₪ + קורס הכנה</li>
                                <li className="text-red-500">− דורש הכנה אינטנסיבית</li>
                            </ul>
                            <div className="mt-3 text-xs text-purple-600 font-medium">
                                מתאים אם: הפסיכומטרי מתחת ל-650 ויש פוטנציאל לשיפור
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <div className="bg-gradient-to-l from-blue-600 to-indigo-600 rounded-2xl p-6 text-center text-white">
                    <h2 className="text-xl font-bold mb-2">רוצים לדעת כמה סכם תרוויחו משיפור?</h2>
                    <p className="text-blue-100 text-sm mb-4">הכניסו את הציונים הנוכחיים והמתוכננים — הסימולטור יראה לכם את ההבדל</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/calculator"
                            className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors text-sm"
                        >
                            <Calculator className="w-4 h-4" />
                            למחשבון הציונים
                        </Link>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center justify-center gap-2 bg-white/15 text-white border border-white/20 px-6 py-3 rounded-xl font-medium hover:bg-white/25 transition-colors text-sm"
                        >
                            <TrendingUp className="w-4 h-4" />
                            לסימולטור השיפור
                        </Link>
                    </div>
                </div>

                {/* External links */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center text-sm">
                    <a href="https://www.nite.org.il/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700">
                        <ExternalLink className="w-3.5 h-3.5" />
                        מאל"ו — המרכז הארצי לבחינות
                    </a>
                    <a href="/psychometric-dates" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        מועדי פסיכומטרי 2026
                    </a>
                </div>
            </main>

            <Footer />
        </div>
    );
}
