import { Helmet } from 'react-helmet-async';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Calendar, ExternalLink, Clock } from 'lucide-react';

const BAGRUT_DATES_2026 = [
    { subject: 'מתמטיקה 5 יח"ל', dates: '12–13 במאי', note: 'שאלון ראשון ושני' },
    { subject: 'מתמטיקה 4 יח"ל', dates: '12 במאי', note: '' },
    { subject: 'מתמטיקה 3 יח"ל', dates: '12 במאי', note: '' },
    { subject: 'אנגלית 5 יח"ל', dates: '19 במאי', note: 'Module F + G' },
    { subject: 'אנגלית 4 יח"ל', dates: '19 במאי', note: '' },
    { subject: 'אנגלית 3 יח"ל', dates: '19 במאי', note: '' },
    { subject: 'עברית (הבעה ולשון)', dates: '26 במאי', note: '' },
    { subject: 'תנ"ך', dates: '28 במאי', note: '' },
    { subject: 'היסטוריה', dates: '2 ביוני', note: '' },
    { subject: 'ספרות', dates: '4 ביוני', note: '' },
    { subject: 'אזרחות', dates: '8 ביוני', note: '' },
    { subject: 'פיזיקה', dates: '10 ביוני', note: '2 שאלונים' },
    { subject: 'כימיה', dates: '15 ביוני', note: '' },
    { subject: 'ביולוגיה', dates: '17 ביוני', note: '' },
    { subject: 'מדעי המחשב', dates: '22 ביוני', note: '' },
    { subject: 'ערבית', dates: '24 ביוני', note: '' },
    { subject: 'צרפתית', dates: '29 ביוני', note: '' },
];

export function BagrutDatesPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
            <Helmet>
                <title>מועדי בגרויות קיץ 2026 — לוח שנה מלא | מתלבטים בלימודים</title>
                <meta name="description" content="לוח מועדי בגרויות קיץ 2026 מעודכן — מתמטיקה, אנגלית, פיזיקה, היסטוריה, ספרות ועוד. כל המועדים לפי מקצוע, טיפים לתכנון וקישור ללוח הרשמי." />
                <meta name="keywords" content="מועדי בגרויות 2026, לוח בגרויות קיץ, בגרות מתמטיקה 2026, בגרות אנגלית 2026, בגרות פיזיקה 2026, בגרות היסטוריה 2026, תאריכי בגרויות" />
                <meta property="og:title" content="מועדי בגרויות קיץ 2026 — לוח מלא | מתלבטים" />
                <meta property="og:description" content="כל מועדי הבגרויות לקיץ 2026 במקום אחד — מתמטיקה, אנגלית, פיזיקה, היסטוריה ועוד." />
                <link rel="canonical" href="https://mitlabtim.co.il/bagrut-dates" />
            </Helmet>
            <Header />

            <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-8">
                {/* Hero */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                        <Calendar className="w-4 h-4" />
                        מעודכן לשנת 2026
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">מועדי בגרויות קיץ 2026</h1>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        לוח מועדי בחינות הבגרות החיצוניות לקיץ תשפ"ו. התאריכים מבוססים על פרסום משרד החינוך.
                    </p>
                </div>

                {/* Alert */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm text-amber-800 font-medium">בחינות הקיץ תשפ"ו: 12.5 – 3.7.2026</p>
                        <p className="text-xs text-amber-600 mt-1">תאריכים עלולים להשתנות. בדקו תמיד את הלוח הרשמי המעודכן.</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-right text-sm font-bold text-gray-700 px-4 py-3">מקצוע</th>
                                <th className="text-right text-sm font-bold text-gray-700 px-4 py-3">תאריך</th>
                                <th className="text-right text-sm font-bold text-gray-700 px-4 py-3 hidden sm:table-cell">הערה</th>
                            </tr>
                        </thead>
                        <tbody>
                            {BAGRUT_DATES_2026.map((row, i) => (
                                <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.subject}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{row.dates}</td>
                                    <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell">{row.note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Source link */}
                <div className="mt-6 text-center">
                    <a
                        href="https://meyda.education.gov.il/files/Exams/LuachSumExams2026SOFI.pdf"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        <ExternalLink className="w-4 h-4" />
                        לוח הבגרויות הרשמי — משרד החינוך (PDF)
                    </a>
                </div>

                {/* Tips */}
                <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5">
                    <h2 className="font-bold text-gray-900 mb-3">טיפים לתקופת הבגרויות</h2>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span>התחילו לחזור לפחות 3 שבועות לפני כל בחינה</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span>תרגלו בחינות שנים קודמות — הן זמינות באתר משרד החינוך</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span>שימו לב למקצועות עם בונוס גבוה (מתמטיקה 5 יח"ל = +35 נקודות!)</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span>רוצים לדעת איך הציונים ישפיעו על סיכויי הקבלה? <a href="/calculator" className="text-blue-600 font-medium hover:underline">נסו את המחשבון שלנו</a></li>
                    </ul>
                </div>
            </main>

            <Footer />
        </div>
    );
}
