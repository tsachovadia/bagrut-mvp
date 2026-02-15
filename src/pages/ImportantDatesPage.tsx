import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Calendar, Search, MapPin, ExternalLink, Bell, CheckCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '../utils/gtm';
import { supabase } from '../lib/supabase';

type EventType = 'open_day' | 'psychometric' | 'bagrut' | 'registration';

interface DateEvent {
    id: string;
    title: string;
    date: string;
    endDate?: string;
    type: EventType;
    institution?: string;
    location?: string;
    link?: string;
    description?: string;
    field?: string; // For filtering by academic field
    note?: string;
}

// Real open days data — updated Feb 2026
const EVENTS: DateEvent[] = [
    // Open Days — Feb-March 2026
    {
        id: 'tau-feb',
        title: 'יום פתוח — אוניברסיטת תל אביב',
        date: '2026-02-05',
        type: 'open_day',
        institution: 'אוניברסיטת תל אביב',
        location: 'קמפוס רמת אביב',
        link: 'https://go.tau.ac.il/openday',
        description: 'סיורים, מפגשים עם ראשי חוגים, הרצאות טעימה',
        note: 'הקמפוס הגדול בארץ',
    },
    {
        id: 'ariel-feb',
        title: 'יום פתוח — אוניברסיטת אריאל',
        date: '2026-02-06',
        type: 'open_day',
        institution: 'אוניברסיטת אריאל',
        location: 'קמפוס אריאל',
        link: 'https://www.ariel.ac.il/openday',
        description: 'מעבדות חדשניות, הנדסה ומדעים',
        note: 'מעבדות חדישות, אווירה אחרת',
    },
    {
        id: 'technion-feb',
        title: 'יום פתוח — הטכניון',
        date: '2026-02-12',
        type: 'open_day',
        institution: 'הטכניון',
        location: 'חיפה',
        link: 'https://admissions.technion.ac.il/open-day/',
        description: 'הנדסה, מדעי המחשב, ארכיטקטורה',
        note: 'חובה למכוונים להנדסה',
        field: 'tech',
    },
    {
        id: 'biu-feb',
        title: 'יום פתוח — אוניברסיטת בר-אילן',
        date: '2026-02-13',
        type: 'open_day',
        institution: 'בר-אילן',
        location: 'קמפוס רמת גן',
        link: 'https://www.biu.ac.il/openday',
        description: 'משפטים, מדעי המוח, ניהול, תקשורת',
        note: 'משפטים ומדעי המוח ברמה גבוהה',
    },
    {
        id: 'bgu-feb',
        title: 'יום פתוח — אוניברסיטת בן גוריון',
        date: '2026-02-26',
        type: 'open_day',
        institution: 'אוניברסיטת בן גוריון',
        location: 'קמפוס באר שבע',
        link: 'https://in.bgu.ac.il/Pages/openday.aspx',
        description: 'הנדסה, רפואה, מדעי ההתנהגות',
        note: 'האווירה החברתית הטובה ביותר',
    },
    {
        id: 'technion-mar',
        title: 'יום פתוח — הטכניון (מועד ב׳)',
        date: '2026-03-05',
        type: 'open_day',
        institution: 'הטכניון',
        location: 'חיפה',
        link: 'https://admissions.technion.ac.il/open-day/',
        description: 'מועד נוסף למי שפספס פברואר',
        field: 'tech',
    },
    {
        id: 'huji-givat-ram',
        title: 'יום פתוח — האוניברסיטה העברית (גבעת רם)',
        date: '2026-03-13',
        type: 'open_day',
        institution: 'האוניברסיטה העברית',
        location: 'קמפוס גבעת רם, ירושלים',
        link: 'https://new.huji.ac.il/page/openday',
        description: 'מדעים מדויקים, מדעי המחשב, הנדסה',
        note: 'הקמפוס היפה בארץ',
    },
    {
        id: 'huji-rehovot',
        title: 'יום פתוח — האוניברסיטה העברית (רחובות)',
        date: '2026-03-27',
        type: 'open_day',
        institution: 'האוניברסיטה העברית',
        location: 'קמפוס רחובות',
        link: 'https://new.huji.ac.il/page/openday',
        description: 'ביוטכנולוגיה, חקלאות, תזונה',
    },
    {
        id: 'reichman-apr',
        title: 'יום פתוח — רייכמן (הבינתחומי)',
        date: '2026-04-20',
        type: 'open_day',
        institution: 'רייכמן',
        location: 'הרצליה',
        link: 'https://www.runi.ac.il/open-day',
        description: 'משפטים, מנהל עסקים, מדעי המחשב',
        note: 'נטוורקינג ברמה בינלאומית',
        field: 'business',
    },
    {
        id: 'biu-jun',
        title: 'יום פתוח — בר-אילן (מועד ב׳)',
        date: '2026-06-05',
        type: 'open_day',
        institution: 'בר-אילן',
        location: 'קמפוס רמת גן',
        link: 'https://www.biu.ac.il/openday',
        description: 'הזדמנות אחרונה לקיץ',
        note: 'הזדמנות אחרונה למי שמתלבט',
    },
    // Psychometric
    {
        id: 'psycho-apr',
        title: 'בחינה פסיכומטרית — מועד אביב',
        date: '2026-04-02',
        type: 'psychometric',
        link: 'https://www.nite.org.il/',
        description: 'הרשמה מסתיימת ב-15.2.2026',
    },
    {
        id: 'psycho-jul',
        title: 'בחינה פסיכומטרית — מועד קיץ',
        date: '2026-07-05',
        type: 'psychometric',
        link: 'https://www.nite.org.il/',
        description: 'הרשמה עד מאי 2026',
    },
    // Registration deadlines
    {
        id: 'reg-tau',
        title: 'סגירת הרשמה — אוניברסיטת תל אביב',
        date: '2026-03-31',
        type: 'registration',
        institution: 'אוניברסיטת תל אביב',
        link: 'https://go.tau.ac.il/',
        description: 'מועד אחרון להגשת מועמדות לרוב התוכניות',
    },
    {
        id: 'reg-technion',
        title: 'סגירת הרשמה — הטכניון',
        date: '2026-03-15',
        type: 'registration',
        institution: 'הטכניון',
        link: 'https://admissions.technion.ac.il/',
        description: 'מועד אחרון להגשת מועמדות',
        field: 'tech',
    },
    {
        id: 'reg-huji',
        title: 'סגירת הרשמה — האוניברסיטה העברית',
        date: '2026-04-15',
        type: 'registration',
        institution: 'האוניברסיטה העברית',
        link: 'https://new.huji.ac.il/',
        description: 'מועד אחרון להגשת מועמדות',
    },
];

const TYPE_CONFIG: Record<EventType, { label: string; color: string; activeColor: string }> = {
    open_day: { label: 'ימים פתוחים', color: 'bg-brand-purple-50 text-brand-purple-700 border-brand-purple-200', activeColor: 'bg-brand-purple-600 text-white' },
    psychometric: { label: 'פסיכומטרי', color: 'bg-orange-50 text-orange-700 border-orange-200', activeColor: 'bg-orange-500 text-white' },
    bagrut: { label: 'בגרויות', color: 'bg-blue-50 text-blue-700 border-blue-200', activeColor: 'bg-blue-600 text-white' },
    registration: { label: 'מועדי הרשמה', color: 'bg-red-50 text-red-700 border-red-200', activeColor: 'bg-red-500 text-white' },
};

function formatHebrewDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
    return `${day} ${months[date.getMonth()]}`;
}

function getDaysUntil(dateStr: string): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getCountdownText(days: number): string {
    if (days < 0) return 'עבר';
    if (days === 0) return 'היום!';
    if (days === 1) return 'מחר!';
    if (days <= 7) return `בעוד ${days} ימים`;
    if (days <= 30) return `בעוד ${Math.ceil(days / 7)} שבועות`;
    return `בעוד ${Math.ceil(days / 30)} חודשים`;
}

export function ImportantDatesPage() {
    const [filter, setFilter] = useState<'all' | EventType>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showReminder, setShowReminder] = useState<string | null>(null);
    const [reminderPhone, setReminderPhone] = useState('');
    const [reminderSent, setReminderSent] = useState<Set<string>>(new Set());
    const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const filteredEvents = EVENTS.filter(event => {
        // Hide past events
        if (new Date(event.date) < now) return false;
        const matchesFilter = filter === 'all' || event.type === filter;
        const matchesSearch = !searchTerm || event.title.includes(searchTerm) || event.description?.includes(searchTerm) || event.institution?.includes(searchTerm);
        return matchesFilter && matchesSearch;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group events by month
    const groupedByMonth: Record<string, DateEvent[]> = {};
    filteredEvents.forEach(event => {
        const date = new Date(event.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!groupedByMonth[key]) groupedByMonth[key] = [];
        groupedByMonth[key].push(event);
    });

    const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

    const handleReminder = async (eventId: string) => {
        if (!reminderPhone) return;

        trackEvent('reminder_request', { event_id: eventId, source: 'open_days_page' });

        const event = EVENTS.find(e => e.id === eventId);
        await supabase.from('soft_leads').insert([{
            phone: reminderPhone,
            interest: `reminder_${eventId}`,
            source: 'open_days_reminder',
        }]);

        setReminderSent(prev => new Set(prev).add(eventId));
        setShowReminder(null);
        setReminderPhone('');
    };

    const handleEventClick = (event: DateEvent) => {
        trackEvent('open_day_click', {
            event_id: event.id,
            institution: event.institution || event.title,
            type: event.type,
            source: 'open_days_page',
        });
    };

    // Stats
    const openDayCount = EVENTS.filter(e => e.type === 'open_day' && new Date(e.date) >= now).length;
    const nextEvent = filteredEvents[0];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
            <Helmet>
                <title>ימים פתוחים 2026 — כל התאריכים במקום אחד | מתלבטים בלימודים</title>
                <meta name="description" content="לוח ימים פתוחים 2026 מעודכן — אוניברסיטת תל אביב, הטכניון, העברית, בר-אילן, בן גוריון, רייכמן ועוד. מועדי פסיכומטרי והרשמה." />
                <meta property="og:title" content="ימים פתוחים 2026 — כל התאריכים במקום אחד" />
                <meta property="og:description" content="לוח ימים פתוחים מעודכן לכל האוניברסיטאות והמכללות בישראל. סינון לפי סוג, תזכורות, וקישורים ישירים." />
                <meta property="og:image" content="https://mitlabtim.co.il/api/og?page=open-days" />
                <link rel="canonical" href="https://mitlabtim.co.il/open-days" />
            </Helmet>
            <Header />

            <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 bg-brand-purple-100 text-brand-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                            <Calendar className="w-3.5 h-3.5" />
                            עודכן פברואר 2026
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        ימים פתוחים ומועדים חשובים 2026
                    </h1>
                    <p className="text-gray-500 text-base max-w-2xl">
                        {openDayCount} ימים פתוחים קרובים, מועדי פסיכומטרי ותאריכי הרשמה אחרונים — הכל במקום אחד.
                        {nextEvent && (
                            <span className="block mt-1 font-medium text-brand-purple-600">
                                הבא: {nextEvent.title} — {formatHebrewDate(nextEvent.date)} ({getCountdownText(getDaysUntil(nextEvent.date))})
                            </span>
                        )}
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-3 items-center">
                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            הכל ({filteredEvents.length})
                        </button>
                        {(Object.keys(TYPE_CONFIG) as EventType[]).map(type => {
                            const count = EVENTS.filter(e => e.type === type && new Date(e.date) >= now).length;
                            if (count === 0) return null;
                            return (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === type ? TYPE_CONFIG[type].activeColor : TYPE_CONFIG[type].color}`}
                                >
                                    {TYPE_CONFIG[type].label} ({count})
                                </button>
                            );
                        })}
                    </div>
                    <div className="relative w-full sm:w-56 sm:mr-auto">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="חיפוש..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-9 pl-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:border-transparent text-sm"
                        />
                    </div>
                </div>

                {/* Events grouped by month */}
                <div className="space-y-6">
                    {Object.entries(groupedByMonth).map(([monthKey, events]) => {
                        const [year, month] = monthKey.split('-').map(Number);
                        const monthLabel = `${monthNames[month - 1]} ${year}`;
                        const isExpanded = expandedMonth === null || expandedMonth === monthKey;

                        return (
                            <div key={monthKey}>
                                <button
                                    onClick={() => setExpandedMonth(expandedMonth === monthKey ? null : monthKey)}
                                    className="flex items-center gap-2 mb-3 group"
                                >
                                    <h2 className="text-lg font-bold text-gray-900">{monthLabel}</h2>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{events.length}</span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence initial={false}>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="space-y-3">
                                                {events.map((event) => {
                                                    const daysUntil = getDaysUntil(event.date);
                                                    const isUrgent = daysUntil <= 7 && daysUntil >= 0;
                                                    const hasSentReminder = reminderSent.has(event.id);

                                                    return (
                                                        <div
                                                            key={event.id}
                                                            className={`bg-white rounded-xl border p-4 transition-all hover:shadow-sm ${isUrgent ? 'border-brand-purple-200 bg-brand-purple-50/30' : 'border-gray-100'}`}
                                                        >
                                                            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                                                                {/* Date badge */}
                                                                <div className="flex sm:flex-col items-center gap-2 sm:gap-0 sm:w-16 sm:text-center shrink-0">
                                                                    <div className={`text-2xl font-bold ${isUrgent ? 'text-brand-purple-600' : 'text-gray-900'}`}>
                                                                        {new Date(event.date).getDate()}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400">
                                                                        {monthNames[new Date(event.date).getMonth()].slice(0, 3)}
                                                                    </div>
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isUrgent ? 'bg-brand-purple-100 text-brand-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                        {getCountdownText(daysUntil)}
                                                                    </span>
                                                                </div>

                                                                {/* Content */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start gap-2 mb-1">
                                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${TYPE_CONFIG[event.type].color}`}>
                                                                            {TYPE_CONFIG[event.type].label}
                                                                        </span>
                                                                        {event.note && (
                                                                            <span className="text-[10px] text-gray-400 mt-0.5">{event.note}</span>
                                                                        )}
                                                                    </div>
                                                                    <h3 className="font-bold text-gray-900 text-sm mb-1">{event.title}</h3>
                                                                    {event.description && (
                                                                        <p className="text-xs text-gray-500 mb-2">{event.description}</p>
                                                                    )}
                                                                    {event.location && (
                                                                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                                                            <MapPin className="w-3 h-3" />
                                                                            {event.location}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Actions */}
                                                                <div className="flex sm:flex-col items-center gap-2 shrink-0">
                                                                    {event.link && (
                                                                        <a
                                                                            href={event.link}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            onClick={() => handleEventClick(event)}
                                                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-purple-600 hover:text-brand-purple-800 bg-brand-purple-50 hover:bg-brand-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                                                                        >
                                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                                            לאתר המוסד
                                                                        </a>
                                                                    )}
                                                                    {!hasSentReminder ? (
                                                                        <button
                                                                            onClick={() => setShowReminder(showReminder === event.id ? null : event.id)}
                                                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-brand-purple-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-brand-purple-200 transition-colors"
                                                                        >
                                                                            <Bell className="w-3.5 h-3.5" />
                                                                            הזכירו לי
                                                                        </button>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 px-3 py-1.5">
                                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                                            תזכורת נשמרה
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Reminder form */}
                                                            <AnimatePresence>
                                                                {showReminder === event.id && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                                                                            <input
                                                                                type="tel"
                                                                                placeholder="טלפון נייד"
                                                                                value={reminderPhone}
                                                                                onChange={(e) => setReminderPhone(e.target.value)}
                                                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:border-transparent"
                                                                                dir="ltr"
                                                                            />
                                                                            <button
                                                                                onClick={() => handleReminder(event.id)}
                                                                                disabled={!reminderPhone}
                                                                                className="bg-brand-purple-600 hover:bg-brand-purple-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors shrink-0"
                                                                            >
                                                                                שלחו תזכורת
                                                                            </button>
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}

                    {filteredEvents.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">לא נמצאו אירועים</p>
                            <p className="text-sm mt-1">נסו לשנות את הסינון או את החיפוש</p>
                        </div>
                    )}
                </div>

                {/* Bottom CTA */}
                <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-6 text-center">
                    <h3 className="font-bold text-gray-900 mb-2">לא בטוחים לאן ללכת?</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        הכניסו את הציונים שלכם ותראו לאיפה יש סיכוי להתקבל — אז תדעו באיזה ימים פתוחים חשוב לבקר.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <a
                            href="/"
                            onClick={() => trackEvent('cta_click', { action: 'calculator', source: 'open_days_page' })}
                            className="inline-flex items-center gap-2 bg-brand-purple-600 hover:bg-brand-purple-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors"
                        >
                            למחשבון הבגרויות
                        </a>
                        <a
                            href="https://t.me/MitlabtimBot"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackEvent('social_exit', { platform: 'telegram', source: 'open_days_page' })}
                            className="inline-flex items-center gap-2 border border-gray-200 hover:border-brand-purple-300 text-gray-700 font-medium py-2.5 px-6 rounded-xl text-sm transition-colors"
                        >
                            שאלו בקהילה
                        </a>
                    </div>
                </div>

                {/* Source disclaimer */}
                <p className="text-[11px] text-gray-400 text-center mt-6">
                    מקור: אתרי הקבלה הרשמיים של המוסדות. תאריכים עשויים להשתנות — בדקו תמיד באתר המוסד לפני הנסיעה.
                    <br />עודכן לאחרונה: פברואר 2026
                </p>
            </main>

            <Footer />
        </div>
    );
}
