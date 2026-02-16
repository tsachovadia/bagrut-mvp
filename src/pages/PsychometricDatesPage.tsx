import { Helmet } from 'react-helmet-async';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Calendar, ExternalLink, CreditCard, Clock, AlertCircle } from 'lucide-react';

const PSYCHOMETRIC_DATES_2026 = [
    {
        name: 'מועד אביב',
        date: '29–30 במרץ 2026',
        registrationDeadline: '21 בינואר 2026',
        languages: 'עברית, ערבית, אנגלית, רוסית, צרפתית',
        locations: 'תל אביב, ירושלים, חיפה, באר שבע, אילת',
        status: 'closed' as const,
    },
    {
        name: 'מועד קיץ',
        date: '1 ביולי 2026',
        registrationDeadline: '12 במאי 2026',
        languages: 'עברית, ערבית, אנגלית, רוסית',
        locations: 'תל אביב, ירושלים, חיפה, באר שבע, תל חי',
        status: 'open' as const,
    },
    {
        name: 'מועד סתיו',
        date: '2–3 בספטמבר 2026',
        registrationDeadline: 'יפורסם',
        languages: 'עברית, ערבית, אנגלית, רוסית, צרפתית, ספרדית',
        locations: 'כל אזורי הבחינה',
        status: 'upcoming' as const,
    },
    {
        name: 'מועד חורף',
        date: 'דצמבר 2026 (תאריך מדויק יפורסם)',
        registrationDeadline: 'יפורסם',
        languages: 'עברית, ערבית, אנגלית, רוסית',
        locations: 'תל אביב, ירושלים, חיפה, באר שבע',
        status: 'upcoming' as const,
    },
];

const STATUS_LABEL = {
    closed: { text: 'ההרשמה נסגרה', className: 'bg-red-100 text-red-700' },
    open: { text: 'ההרשמה פתוחה', className: 'bg-green-100 text-green-700' },
    upcoming: { text: 'בקרוב', className: 'bg-gray-100 text-gray-600' },
};

export function PsychometricDatesPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
            <Helmet>
                <title>מועדי פסיכומטרי 2026 — תאריכים, מחירים והרשמה | מתלבטים בלימודים</title>
                <meta name="description" content="כל מועדי הפסיכומטרי 2026 — אביב, קיץ, סתיו וחורף. מחיר הרשמה 560₪, מועד אחרון להרשמה, שפות בחינה, אזורי בחינה ומידע על התאמות." />
                <meta name="keywords" content="מועדי פסיכומטרי 2026, הרשמה לפסיכומטרי, מחיר פסיכומטרי, פסיכומטרי מועד קיץ, פסיכומטרי מועד סתיו, מאלו, NITE, בחינת כניסה לאוניברסיטה" />
                <meta property="og:title" content="מועדי פסיכומטרי 2026 — כל המועדים, מחירים והרשמה" />
                <meta property="og:description" content="4 מועדי פסיכומטרי ב-2026. מחיר הרשמה, תאריכים, שפות ואזורי בחינה." />
                <link rel="canonical" href="https://mitlabtim.co.il/psychometric-dates" />
            </Helmet>
            <Header />

            <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-8">
                {/* Hero */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                        <Calendar className="w-4 h-4" />
                        מעודכן לשנת 2026
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">מועדי פסיכומטרי 2026</h1>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        כל מועדי הבחינה הפסיכומטרית לשנת 2026 — תאריכים, הרשמה ומחירים.
                    </p>
                </div>

                {/* Cost Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 text-sm">עלות ההרשמה</h2>
                        <p className="text-gray-600 text-sm mt-1"><span className="font-bold text-lg text-gray-900">560₪</span> הרשמה רגילה</p>
                        <p className="text-gray-500 text-xs mt-0.5">180₪ תוספת הרשמה מאוחרת (במועדים שמאפשרים)</p>
                    </div>
                </div>

                {/* Dates Cards */}
                <div className="space-y-4 mb-8">
                    {PSYCHOMETRIC_DATES_2026.map((exam, i) => {
                        const status = STATUS_LABEL[exam.status];
                        return (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-gray-900">{exam.name}</h3>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.className}`}>{status.text}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <div className="text-gray-400 text-xs font-medium mb-0.5">תאריך בחינה</div>
                                        <div className="text-gray-900 font-medium">{exam.date}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-xs font-medium mb-0.5">מועד אחרון להרשמה</div>
                                        <div className="text-gray-900 font-medium">{exam.registrationDeadline}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-xs font-medium mb-0.5">שפות</div>
                                        <div className="text-gray-600">{exam.languages}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-xs font-medium mb-0.5">מרכזי בחינה</div>
                                        <div className="text-gray-600">{exam.locations}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Accommodations */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                            <h2 className="font-bold text-gray-900 text-sm mb-1">התאמות לנבחנים עם צרכים מיוחדים</h2>
                            <p className="text-sm text-gray-600">
                                נבחנים עם לקויות למידה, ADHD, או מוגבלויות רפואיות יכולים לקבל התאמות: תוספת זמן, חדר נפרד, שימוש במחשב ועוד.
                            </p>
                            <a href="https://www.nite.org.il/special-test-accommodations/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-2">
                                <ExternalLink className="w-3.5 h-3.5" />
                                מידע על התאמות באתר מאל"ו
                            </a>
                        </div>
                    </div>
                </div>

                {/* Exam Structure */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                    <h2 className="font-bold text-gray-900 mb-3">מבנה הבחינה הפסיכומטרית</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-gray-900">חשיבה כמותית</div>
                            <div className="text-xs text-gray-500 mt-1">מתמטיקה, סטטיסטיקה, הסקה</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-gray-900">חשיבה מילולית</div>
                            <div className="text-xs text-gray-500 mt-1">הבנת הנקרא, אנלוגיות, היגיון</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-gray-900">אנגלית</div>
                            <div className="text-xs text-gray-500 mt-1">הבנת הנקרא, אוצר מילים, השלמה</div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center">ציון סופי: 200–800. משך הבחינה: כ-2.5 שעות</p>
                </div>

                {/* Links */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                        href="https://niteop.nite.org.il/#/registration/2"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors text-sm"
                    >
                        הרשמה לפסיכומטרי — אתר מאל"ו
                        <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                        href="/calculator"
                        className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
                    >
                        <Clock className="w-4 h-4" />
                        בדקו איך הפסיכומטרי ישפיע על הסיכויים שלכם
                    </a>
                </div>
            </main>

            <Footer />
        </div>
    );
}
