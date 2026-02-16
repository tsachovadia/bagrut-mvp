import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Calendar, Search, ExternalLink, Bell, CheckCircle, ChevronDown, GraduationCap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { trackEvent } from '../utils/gtm';
import { supabase } from '../lib/supabase';

type EventType = 'open_day' | 'psychometric' | 'bagrut' | 'registration';
type InstitutionType = 'university' | 'college' | 'exam' | 'deadline';

interface DateEvent {
    id: string;
    title: string;
    date: string;
    endDate?: string;
    type: EventType;
    institutionType?: InstitutionType;
    institution?: string;
    location?: string;
    link?: string;
    description?: string;
    field?: string;
    note?: string;
    time?: string;
}

// ===== VERIFIED 2026 DATA — Sources: official university/college websites, NITE, Ministry of Education =====
const EVENTS: DateEvent[] = [
    // ==================== OPEN DAYS — UNIVERSITIES ====================
    {
        id: 'tau-feb',
        title: 'אוניברסיטת תל אביב',
        date: '2026-02-05',
        type: 'open_day',
        institutionType: 'university',
        institution: 'אוניברסיטת תל אביב',
        location: 'קמפוס רמת אביב',
        link: 'https://go.tau.ac.il/he/open-day-schedule',
        description: 'תואר ראשון ושני. סיורים, מפגשים עם ראשי חוגים, הרצאות טעימה.',
        time: '11:00–18:00',
    },
    {
        id: 'ariel-feb',
        title: 'אוניברסיטת אריאל',
        date: '2026-02-06',
        type: 'open_day',
        institutionType: 'university',
        institution: 'אוניברסיטת אריאל',
        location: 'קמפוס אריאל',
        link: 'https://www.ariel.ac.il/',
        description: 'הנדסה, מדעים, פרא-רפואה — אוניברסיטה צעירה ודינמית.',
    },
    {
        id: 'biu-feb',
        title: 'אוניברסיטת בר-אילן',
        date: '2026-02-13',
        type: 'open_day',
        institutionType: 'university',
        institution: 'אוניברסיטת בר-אילן',
        location: 'קמפוס רמת גן',
        link: 'https://www.biu.ac.il/article/openday',
        description: 'תואר ראשון, שני ודוקטורט. משפטים, מדעי המוח, ניהול, תקשורת.',
    },
    {
        id: 'haifa-feb',
        title: 'אוניברסיטת חיפה',
        date: '2026-02-19',
        type: 'open_day',
        institutionType: 'university',
        institution: 'אוניברסיטת חיפה',
        location: 'הר הכרמל, חיפה',
        link: 'https://www.haifa.ac.il/',
        description: 'מדעי הרוח, חברה, ניהול, חינוך, אמנויות.',
    },
    {
        id: 'bgu-feb',
        title: 'אוניברסיטת בן גוריון',
        date: '2026-02-26',
        type: 'open_day',
        institutionType: 'university',
        institution: 'אוניברסיטת בן גוריון',
        location: 'קמפוס מרקוס, באר שבע',
        link: 'https://www.bgu.ac.il/welcome/ba/open-day/',
        description: 'הנדסה, רפואה, מדעי ההתנהגות, מדעי הטבע.',
    },
    {
        id: 'huji-givat-ram',
        title: 'האוניברסיטה העברית (גבעת רם)',
        date: '2026-03-13',
        type: 'open_day',
        institutionType: 'university',
        institution: 'האוניברסיטה העברית',
        location: 'גבעת רם, ירושלים',
        link: 'https://new.huji.ac.il/%D7%99%D7%95%D7%9D-%D7%A4%D7%AA%D7%95%D7%97',
        description: 'מדעים מדויקים, מדעי המחשב, הנדסה.',
    },
    {
        id: 'reichman-mar',
        title: 'אוניברסיטת רייכמן (הבינתחומי)',
        date: '2026-03-20',
        type: 'open_day',
        institutionType: 'university',
        institution: 'אוניברסיטת רייכמן',
        location: 'הרצליה',
        link: 'https://www.runi.ac.il/',
        description: 'משפטים, מנהל עסקים, מדעי המחשב, פסיכולוגיה.',
        field: 'business',
    },
    {
        id: 'biu-mar',
        title: 'בר-אילן (מועד ב׳)',
        date: '2026-03-25',
        type: 'open_day',
        institutionType: 'university',
        institution: 'אוניברסיטת בר-אילן',
        location: 'קמפוס רמת גן',
        link: 'https://www.biu.ac.il/article/openday',
        description: 'מועד נוסף — תואר ראשון, שני ודוקטורט.',
    },
    {
        id: 'huji-rehovot',
        title: 'האוניברסיטה העברית (רחובות)',
        date: '2026-03-27',
        type: 'open_day',
        institutionType: 'university',
        institution: 'האוניברסיטה העברית',
        location: 'קמפוס רחובות',
        link: 'https://new.huji.ac.il/%D7%99%D7%95%D7%9D-%D7%A4%D7%AA%D7%95%D7%97',
        description: 'ביוטכנולוגיה, חקלאות, תזונה, מדעי הסביבה.',
    },
    {
        id: 'biu-jun',
        title: 'בר-אילן (קיץ)',
        date: '2026-06-05',
        type: 'open_day',
        institutionType: 'university',
        institution: 'אוניברסיטת בר-אילן',
        location: 'קמפוס רמת גן',
        link: 'https://www.biu.ac.il/article/openday',
        description: 'הזדמנות אחרונה לפני סגירת ההרשמה.',
    },
    {
        id: 'biu-sep',
        title: 'בר-אילן (ספטמבר)',
        date: '2026-09-09',
        type: 'open_day',
        institutionType: 'university',
        institution: 'אוניברסיטת בר-אילן',
        location: 'קמפוס רמת גן',
        link: 'https://www.biu.ac.il/article/openday',
        description: 'לקראת שנת הלימודים — תואר ראשון, שני ודוקטורט.',
    },

    // ==================== OPEN DAYS — COLLEGES ====================
    {
        id: 'sce-jan',
        title: 'סמי שמעון להנדסה (SCE)',
        date: '2026-01-09',
        type: 'open_day',
        institutionType: 'college',
        institution: 'המכללה להנדסה סמי שמעון',
        location: 'באר שבע + אשדוד',
        link: 'https://www.sce.ac.il/',
        description: 'הנדסת תוכנה, חשמל, מכונות, כימיה.',
        field: 'tech',
        time: '09:00–12:00',
    },
    {
        id: 'azrieli-jan',
        title: 'מכללת עזריאלי להנדסה',
        date: '2026-01-16',
        type: 'open_day',
        institutionType: 'college',
        institution: 'מכללת עזריאלי',
        location: 'ירושלים',
        link: 'https://www.jce.ac.il/',
        description: 'הנדסת חשמל, תוכנה, תעשייה וניהול.',
        field: 'tech',
    },
    {
        id: 'afeka-jan',
        title: 'מכללת אפקה להנדסה',
        date: '2026-01-23',
        type: 'open_day',
        institutionType: 'college',
        institution: 'מכללת אפקה',
        location: 'תל אביב',
        link: 'https://www.afeka.ac.il/',
        description: 'הנדסת חשמל, תוכנה, מכונות, בניין.',
        field: 'tech',
        time: '16:00–20:00',
    },
    {
        id: 'colman-feb',
        title: 'המכללה למינהל (קולמן)',
        date: '2026-02-06',
        type: 'open_day',
        institutionType: 'college',
        institution: 'המסלול האקדמי — המכללה למינהל',
        location: 'ראשון לציון',
        link: 'https://www.colman.ac.il/',
        description: 'מנהל עסקים, משפטים, תקשורת, מערכות מידע.',
        field: 'business',
    },
    {
        id: 'ruppin-feb',
        title: 'המרכז האקדמי רופין',
        date: '2026-02-13',
        type: 'open_day',
        institutionType: 'college',
        institution: 'המרכז האקדמי רופין',
        location: 'עמק חפר',
        link: 'https://www.ruppin.ac.il/',
        description: 'ביוטכנולוגיה, ניהול, כלכלה, עבודה סוציאלית.',
    },
    {
        id: 'sapir-mar',
        title: 'המכללה האקדמית ספיר',
        date: '2026-03-17',
        type: 'open_day',
        institutionType: 'college',
        institution: 'המכללה האקדמית ספיר',
        location: 'שדרות',
        link: 'https://www.sapir.ac.il/inscription_acceptance/opendays',
        description: 'תקשורת, קולנוע, מדעי ההתנהגות, ניהול.',
        time: '14:00–18:00',
    },
    {
        id: 'shenkar-mar',
        title: 'שנקר — הנדסה, עיצוב, אמנות',
        date: '2026-03-24',
        type: 'open_day',
        institutionType: 'college',
        institution: 'שנקר — הנדסה, עיצוב, אמנות',
        location: 'רמת גן',
        link: 'https://www.shenkar.ac.il/',
        description: 'עיצוב תעשייתי, אופנה, הנדסה כימית, מדעי המחשב.',
        time: '17:00',
        field: 'design',
    },

    // ==================== PSYCHOMETRIC EXAMS ====================
    {
        id: 'psycho-spring',
        title: 'פסיכומטרי — מועד אביב',
        date: '2026-03-29',
        endDate: '2026-03-30',
        type: 'psychometric',
        link: 'https://www.nite.org.il/',
        description: 'עברית, ערבית, אנגלית, רוסית, צרפתית. ת"א, ירושלים, חיפה, באר שבע, אילת.',
        note: 'הרשמה נסגרה 21.1',
    },
    {
        id: 'psycho-summer',
        title: 'פסיכומטרי — מועד קיץ',
        date: '2026-07-01',
        type: 'psychometric',
        link: 'https://www.nite.org.il/',
        description: 'עברית, ערבית, אנגלית, רוסית. ת"א, ירושלים, חיפה, באר שבע, תל חי.',
        note: 'הרשמה עד 12.5',
    },
    {
        id: 'psycho-fall',
        title: 'פסיכומטרי — מועד סתיו',
        date: '2026-09-02',
        endDate: '2026-09-03',
        type: 'psychometric',
        link: 'https://www.nite.org.il/',
        description: 'עברית, ערבית, אנגלית, רוסית, צרפתית, ספרדית. כל אזורי הבחינה.',
        note: 'המועד האחרון לנרשמים מאוחרים',
    },
    {
        id: 'psycho-winter',
        title: 'פסיכומטרי — מועד חורף',
        date: '2026-12-01',
        type: 'psychometric',
        link: 'https://www.nite.org.il/',
        description: 'מתאים למי שרוצה לשפר ציון לקראת תשפ"ח.',
        note: 'תאריך מדויק יפורסם',
    },

    // ==================== BAGRUT EXAMS ====================
    {
        id: 'bagrut-summer-start',
        title: 'תחילת בגרויות קיץ תשפ"ו',
        date: '2026-05-12',
        type: 'bagrut',
        link: 'https://meyda.education.gov.il/files/Exams/LuachSumExams2026SOFI.pdf',
        description: 'מתמטיקה 5 יח"ל ב-12-13.5. לוח מלא באתר משרד החינוך.',
    },
    {
        id: 'bagrut-summer-end',
        title: 'סיום בגרויות קיץ תשפ"ו',
        date: '2026-07-03',
        type: 'bagrut',
        link: 'https://meyda.education.gov.il/files/Exams/LuachSumExams2026SOFI.pdf',
        description: 'הבחינות נמשכות כחודשיים — מתחילת מאי עד תחילת יולי.',
    },

    // ==================== REGISTRATION DEADLINES ====================
    {
        id: 'reg-technion',
        title: 'פתיחת הרשמה — הטכניון',
        date: '2026-02-01',
        type: 'registration',
        institutionType: 'deadline',
        institution: 'הטכניון',
        link: 'https://admissions.technion.ac.il/',
        description: 'סמסטר חורף תשפ"ז. הנדסה, מדעי המחשב, ארכיטקטורה, רפואה.',
        field: 'tech',
    },
    {
        id: 'reg-tau-open',
        title: 'פתיחת הרשמה — תל אביב',
        date: '2026-02-01',
        type: 'registration',
        institutionType: 'deadline',
        institution: 'אוניברסיטת תל אביב',
        link: 'https://go.tau.ac.il/he/reg-dates',
        description: 'שנה"ל תשפ"ז. מומלץ להירשם מוקדם — חוגים מתמלאים.',
    },
    {
        id: 'reg-huji-open',
        title: 'פתיחת הרשמה — העברית',
        date: '2026-02-01',
        type: 'registration',
        institutionType: 'deadline',
        institution: 'האוניברסיטה העברית',
        link: 'https://info.huji.ac.il/registration-process/calendar',
        description: 'שנה"ל תשפ"ז. רפואה ורפואת שיניים: מועד אחרון 30.4.',
    },
    {
        id: 'reg-biu',
        title: 'פתיחת הרשמה — בר-אילן',
        date: '2026-02-01',
        type: 'registration',
        institutionType: 'deadline',
        institution: 'אוניברסיטת בר-אילן',
        link: 'https://www.biu.ac.il/en/registration-and-admission/information/registration',
        description: 'שנה"ל תשפ"ז. בדקו מועדים ספציפיים לכל חוג.',
    },
    {
        id: 'reg-huji-medicine',
        title: 'סגירת הרשמה — רפואה (העברית)',
        date: '2026-04-30',
        type: 'registration',
        institutionType: 'deadline',
        institution: 'האוניברסיטה העברית',
        link: 'https://info.huji.ac.il/registration-process/calendar',
        description: 'רפואה, רפואת שיניים, צמרת. שאר החוגים עד 31.8.',
        field: 'med',
    },
    {
        id: 'reg-haifa',
        title: 'סגירת הרשמה — חיפה',
        date: '2026-05-15',
        type: 'registration',
        institutionType: 'deadline',
        institution: 'אוניברסיטת חיפה',
        link: 'https://admissions.haifa.ac.il/registration-deadlines-and-entrance-exams/',
        description: 'מועד אחרון לרוב התוכניות.',
    },
    {
        id: 'reg-tau-close',
        title: 'סגירת הרשמה — תל אביב',
        date: '2026-05-31',
        type: 'registration',
        institutionType: 'deadline',
        institution: 'אוניברסיטת תל אביב',
        link: 'https://go.tau.ac.il/he/reg-dates',
        description: 'מועד אחרון לרוב התוכניות. חוגים מסוימים נסגרים מוקדם יותר.',
    },
    {
        id: 'reg-huji-close',
        title: 'סגירת הרשמה — העברית',
        date: '2026-08-31',
        type: 'registration',
        institutionType: 'deadline',
        institution: 'האוניברסיטה העברית',
        link: 'https://info.huji.ac.il/registration-process/calendar',
        description: 'מועד אחרון לרוב החוגים (למעט רפואה).',
    },
];

const TYPE_DOT: Record<EventType, string> = {
    open_day: 'bg-brand-purple-500',
    psychometric: 'bg-orange-500',
    bagrut: 'bg-blue-500',
    registration: 'bg-red-500',
};

const TYPE_LABEL: Record<EventType, string> = {
    open_day: 'ימים פתוחים',
    psychometric: 'פסיכומטרי',
    bagrut: 'בגרויות',
    registration: 'הרשמה',
};

const TYPE_PILL: Record<EventType, string> = {
    open_day: 'bg-brand-purple-50 text-brand-purple-700',
    psychometric: 'bg-orange-50 text-orange-700',
    bagrut: 'bg-blue-50 text-blue-700',
    registration: 'bg-red-50 text-red-700',
};

const TYPE_PILL_ACTIVE: Record<EventType, string> = {
    open_day: 'bg-brand-purple-600 text-white',
    psychometric: 'bg-orange-500 text-white',
    bagrut: 'bg-blue-600 text-white',
    registration: 'bg-red-500 text-white',
};

const MONTH_NAMES = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
const DAY_NAMES = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

function fmtDate(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getDate()}.${d.getMonth() + 1}`;
}

function fmtDay(dateStr: string) {
    return DAY_NAMES[new Date(dateStr).getDay()];
}

function getDaysUntil(dateStr: string): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function countdown(days: number): string {
    if (days < 0) return 'עבר';
    if (days === 0) return 'היום';
    if (days === 1) return 'מחר';
    if (days <= 7) return `${days} ימים`;
    if (days <= 30) return `${Math.ceil(days / 7)} שב׳`;
    return `${Math.ceil(days / 30)} חו׳`;
}

// JSON-LD structured data for SEO
function getStructuredData(events: DateEvent[]) {
    const items = events
        .filter(e => e.type === 'open_day' && getDaysUntil(e.date) >= 0)
        .map(event => ({
            '@type': 'Event',
            name: `יום פתוח — ${event.title}`,
            startDate: event.date,
            ...(event.endDate && { endDate: event.endDate }),
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            eventStatus: 'https://schema.org/EventScheduled',
            location: { '@type': 'Place', name: event.location || '', address: { '@type': 'PostalAddress', addressCountry: 'IL' } },
            organizer: { '@type': 'Organization', name: event.institution || '', ...(event.link && { url: event.link }) },
            ...(event.description && { description: event.description }),
        }));
    return {
        '@context': 'https://schema.org', '@type': 'ItemList',
        name: 'ימים פתוחים 2026 — אוניברסיטאות ומכללות בישראל',
        description: 'רשימת כל הימים הפתוחים באוניברסיטאות ובמכללות בישראל לשנת 2026, כולל מועדי פסיכומטרי והרשמה.',
        numberOfItems: items.length,
        itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, item })),
    };
}

const FAQ_ITEMS = [
    { q: 'מתי הימים הפתוחים באוניברסיטאות בישראל ב-2026?', a: 'רוב הימים הפתוחים מתקיימים בין פברואר למרץ 2026. תל אביב — 5.2, בר-אילן — 13.2, בן גוריון — 26.2, העברית (גבעת רם) — 13.3. חלק מהמוסדות מקיימים מועדים נוספים בקיץ ובספטמבר.' },
    { q: 'מתי מועדי הפסיכומטרי ב-2026?', a: 'ארבעה מועדים: אביב (29-30.3), קיץ (1.7), סתיו (2-3.9) וחורף (דצמבר). ההרשמה נסגרת כחודשיים לפני כל מועד. כל הפרטים באתר NITE.' },
    { q: 'מהו המועד האחרון להרשמה לאוניברסיטה ב-2026?', a: 'תל אביב — 31.5, חיפה — 15.5, העברית — 31.8 (רפואה: 30.4). ההרשמה נפתחת ב-1.2.2026 ברוב האוניברסיטאות.' },
    { q: 'מתי בחינות הבגרות מועד קיץ 2026?', a: 'ממאי עד יולי 2026. מתמטיקה 5 יח"ל — 12-13.5.2026. הלוח המלא באתר משרד החינוך.' },
    { q: 'איך מחשבים ממוצע בגרות לקבלה לאוניברסיטה?', a: 'ממוצע הבגרות כולל בונוסים על 5 יח"ל. מתמטיקה 5 יח"ל = +35 נקודות. אפשר לחשב בחינם במחשבון שלנו.' },
    { q: 'האם יש ימים פתוחים במכללות ב-2026?', a: 'כן. סמי שמעון — 9.1, עזריאלי — 16.1, אפקה — 23.1, המכללה למינהל — 6.2, רופין — 13.2, ספיר — 17.3, שנקר — 24.3.' },
];

function getFaqStructuredData() {
    return {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: FAQ_ITEMS.map(item => ({
            '@type': 'Question', name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
    };
}

export function ImportantDatesPage() {
    const [filter, setFilter] = useState<'all' | EventType>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showPast, setShowPast] = useState(false);
    const [showReminder, setShowReminder] = useState<string | null>(null);
    const [reminderPhone, setReminderPhone] = useState('');
    const [reminderSent, setReminderSent] = useState<Set<string>>(new Set());

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const filteredEvents = useMemo(() => {
        return EVENTS.filter(event => {
            if (!showPast && new Date(event.date) < now) return false;
            const matchesFilter = filter === 'all' || event.type === filter;
            const matchesSearch = !searchTerm ||
                event.title.includes(searchTerm) ||
                event.description?.includes(searchTerm) ||
                event.institution?.includes(searchTerm) ||
                event.location?.includes(searchTerm);
            return matchesFilter && matchesSearch;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [filter, searchTerm, showPast]);

    const groupedByMonth = useMemo(() => {
        const groups: Record<string, DateEvent[]> = {};
        filteredEvents.forEach(event => {
            const date = new Date(event.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(event);
        });
        return groups;
    }, [filteredEvents]);

    const handleReminder = async (eventId: string) => {
        if (!reminderPhone) return;
        trackEvent('reminder_request', { event_id: eventId, source: 'open_days_page' });
        await supabase.from('soft_leads').insert([{ phone: reminderPhone, interest: `reminder_${eventId}`, source: 'open_days_reminder' }]);
        setReminderSent(prev => new Set(prev).add(eventId));
        setShowReminder(null);
        setReminderPhone('');
    };

    const handleEventClick = (event: DateEvent) => {
        trackEvent('open_day_click', { event_id: event.id, institution: event.institution || event.title, type: event.type, source: 'open_days_page' });
    };

    const pastCount = EVENTS.filter(e => new Date(e.date) < now).length;

    return (
        <div className="min-h-screen flex flex-col bg-white" dir="rtl">
            <Helmet>
                <title>ימים פתוחים 2026 — כל האוניברסיטאות והמכללות | תאריכים מעודכנים</title>
                <meta name="description" content="לוח ימים פתוחים 2026 מעודכן — תל אביב, טכניון, עברית, בר-אילן, בן גוריון, רייכמן, שנקר, ספיר ועוד. מועדי פסיכומטרי, בגרויות והרשמה לאוניברסיטה. חינם." />
                <meta name="keywords" content="ימים פתוחים 2026, יום פתוח אוניברסיטה, יום פתוח מכללה, מועדי פסיכומטרי 2026, הרשמה לאוניברסיטה 2026, בגרויות קיץ 2026, תל אביב, טכניון, עברית, בר אילן, בן גוריון, רייכמן, שנקר, ספיר, אפקה, סמי שמעון" />
                <meta property="og:title" content="ימים פתוחים 2026 — כל התאריכים במקום אחד | מתלבטים" />
                <meta property="og:description" content="לוח ימים פתוחים מעודכן לכל האוניברסיטאות והמכללות בישראל 2026. מועדי פסיכומטרי, בגרויות, הרשמה וקישורים ישירים." />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://mitlabtim.co.il/logo_new.png" />
                <meta property="og:url" content="https://mitlabtim.co.il/open-days" />
                <meta property="og:locale" content="he_IL" />
                <link rel="canonical" href="https://mitlabtim.co.il/open-days" />
                <script type="application/ld+json">{JSON.stringify(getStructuredData(EVENTS))}</script>
                <script type="application/ld+json">{JSON.stringify(getFaqStructuredData())}</script>
            </Helmet>
            <Header />

            <main className="flex-grow max-w-3xl mx-auto w-full px-4 pt-6 pb-12">
                {/* Header */}
                <div className="mb-5">
                    <p className="text-xs text-gray-400 mb-1">עודכן פברואר 2026</p>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ימים פתוחים 2026</h1>
                    <p className="text-sm text-gray-500 mt-1">אוניברסיטאות, מכללות, מועדי פסיכומטרי, בגרויות והרשמה.</p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        הכל
                    </button>
                    {(Object.keys(TYPE_LABEL) as EventType[]).map(type => {
                        const count = EVENTS.filter(e => e.type === type && (showPast || new Date(e.date) >= now)).length;
                        if (count === 0) return null;
                        return (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === type ? TYPE_PILL_ACTIVE[type] : TYPE_PILL[type]}`}
                            >
                                {TYPE_LABEL[type]}
                            </button>
                        );
                    })}
                    <div className="relative mr-auto">
                        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 w-3.5 h-3.5" />
                        <input
                            type="text"
                            placeholder="חיפוש..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-36 pr-8 pl-2 py-1 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-purple-400 text-xs"
                        />
                    </div>
                </div>

                {pastCount > 0 && (
                    <button
                        onClick={() => setShowPast(!showPast)}
                        className="text-[11px] text-gray-400 hover:text-brand-purple-600 mb-3 transition-colors"
                    >
                        {showPast ? 'הסתר אירועים שעברו' : `+ ${pastCount} אירועים שעברו`}
                    </button>
                )}

                {/* Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {Object.entries(groupedByMonth).map(([monthKey, events], groupIdx) => {
                        const [year, month] = monthKey.split('-').map(Number);
                        const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

                        return (
                            <div key={monthKey}>
                                {/* Month header */}
                                <div className={`bg-gray-50 px-4 py-2 text-xs font-bold text-gray-500 ${groupIdx > 0 ? 'border-t border-gray-200' : ''}`}>
                                    {monthLabel}
                                    <span className="text-gray-300 font-normal mr-1.5">({events.length})</span>
                                </div>

                                {/* Event rows */}
                                {events.map((event, idx) => {
                                    const daysUntil = getDaysUntil(event.date);
                                    const isPast = daysUntil < 0;
                                    const isUrgent = daysUntil >= 0 && daysUntil <= 3;
                                    const hasSentReminder = reminderSent.has(event.id);

                                    return (
                                        <div key={event.id}>
                                            <div
                                                className={`grid grid-cols-[auto_1fr_auto] sm:grid-cols-[56px_8px_1fr_80px_90px_auto] items-center gap-x-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${idx > 0 ? 'border-t border-gray-100' : ''} ${isPast ? 'opacity-40' : ''} ${isUrgent ? 'bg-brand-purple-50/40' : ''}`}
                                            >
                                                {/* Date */}
                                                <div className="text-xs tabular-nums text-gray-500 font-medium whitespace-nowrap sm:block hidden">
                                                    {fmtDay(event.date)} {fmtDate(event.date)}
                                                </div>

                                                {/* Dot */}
                                                <div className="hidden sm:flex justify-center">
                                                    <div className={`w-2 h-2 rounded-full ${TYPE_DOT[event.type]}`} />
                                                </div>

                                                {/* Mobile: date + dot + title */}
                                                <div className="sm:hidden flex items-center gap-2">
                                                    <span className="text-[11px] tabular-nums text-gray-400 w-10 shrink-0">{fmtDate(event.date)}</span>
                                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${TYPE_DOT[event.type]}`} />
                                                    <span className="font-medium text-gray-900 text-sm truncate">{event.title}</span>
                                                </div>

                                                {/* Title + location (desktop) */}
                                                <div className="hidden sm:block min-w-0">
                                                    <span className="font-medium text-gray-900">{event.title}</span>
                                                    {event.location && <span className="text-gray-400 text-xs mr-2">{event.location}</span>}
                                                </div>

                                                {/* Countdown */}
                                                <div className={`text-[11px] font-medium text-left whitespace-nowrap hidden sm:block ${isUrgent ? 'text-brand-purple-600' : 'text-gray-400'}`}>
                                                    {countdown(daysUntil)}
                                                </div>

                                                {/* Time */}
                                                <div className="text-[11px] text-gray-400 text-left whitespace-nowrap hidden sm:block">
                                                    {event.time || ''}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    {event.link && (
                                                        <a
                                                            href={event.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={() => handleEventClick(event)}
                                                            className="text-brand-purple-600 hover:text-brand-purple-800 p-1 rounded transition-colors"
                                                            title="לאתר הרשמי"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                    {!isPast && !hasSentReminder ? (
                                                        <button
                                                            onClick={() => setShowReminder(showReminder === event.id ? null : event.id)}
                                                            className="text-gray-400 hover:text-brand-purple-600 p-1 rounded transition-colors"
                                                            title="הזכירו לי"
                                                        >
                                                            <Bell className="w-3.5 h-3.5" />
                                                        </button>
                                                    ) : hasSentReminder ? (
                                                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                                    ) : null}
                                                </div>
                                            </div>

                                            {/* Description row (mobile) */}
                                            {event.description && (
                                                <div className="sm:hidden px-4 pb-2 -mt-1">
                                                    <p className="text-[11px] text-gray-400 pr-[3.25rem]">{event.description}</p>
                                                </div>
                                            )}

                                            {/* Reminder form */}
                                            <AnimatePresence>
                                                {showReminder === event.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-4 pb-2 flex items-center gap-2">
                                                            <input
                                                                type="tel"
                                                                placeholder="טלפון נייד"
                                                                value={reminderPhone}
                                                                onChange={(e) => setReminderPhone(e.target.value)}
                                                                className="flex-1 max-w-48 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple-400"
                                                                dir="ltr"
                                                            />
                                                            <button
                                                                onClick={() => handleReminder(event.id)}
                                                                disabled={!reminderPhone}
                                                                className="bg-brand-purple-600 hover:bg-brand-purple-700 disabled:opacity-50 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-colors"
                                                            >
                                                                שלחו
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}

                    {filteredEvents.length === 0 && (
                        <div className="text-center py-12 text-gray-400 text-sm">
                            לא נמצאו אירועים
                        </div>
                    )}
                </div>

                {/* Tooltip row — description on hover (desktop) */}
                <p className="text-[10px] text-gray-300 mt-2 hidden sm:block">העבירו את העכבר מעל שורה לפרטים נוספים. לחצו על הקישור לאתר הרשמי של המוסד.</p>

                {/* FAQ Section — SEO */}
                <section className="mt-10">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">שאלות נפוצות</h2>
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                        {FAQ_ITEMS.map((item, index) => (
                            <details key={index} className="group">
                                <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors list-none flex items-center justify-between">
                                    <span>{item.q}</span>
                                    <ChevronDown className="w-4 h-4 text-gray-300 transition-transform group-open:rotate-180 shrink-0 mr-2" />
                                </summary>
                                <div className="px-4 pb-3 text-xs text-gray-500 leading-relaxed">
                                    {item.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Bottom CTA */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 mb-3">לא בטוחים לאן ללכת? הכניסו ציונים ותראו לאיפה יש סיכוי להתקבל.</p>
                    <div className="flex items-center justify-center gap-2">
                        <a
                            href="/calculator"
                            onClick={() => trackEvent('cta_click', { action: 'calculator', source: 'open_days_page' })}
                            className="inline-flex items-center gap-1.5 bg-brand-purple-600 hover:bg-brand-purple-700 text-white font-bold py-2 px-5 rounded-lg text-sm transition-colors"
                        >
                            <GraduationCap className="w-4 h-4" />
                            למחשבון
                        </a>
                        <a
                            href="/programs"
                            onClick={() => trackEvent('cta_click', { action: 'programs', source: 'open_days_page' })}
                            className="inline-flex items-center gap-1.5 border border-gray-200 hover:border-brand-purple-300 text-gray-600 font-medium py-2 px-5 rounded-lg text-sm transition-colors"
                        >
                            <Search className="w-3.5 h-3.5" />
                            תוכניות לימוד
                        </a>
                    </div>
                </div>

                {/* Source disclaimer */}
                <p className="text-[10px] text-gray-300 text-center mt-6">
                    מקורות: אתרי המוסדות הרשמיים, NITE, משרד החינוך. תאריכים עשויים להשתנות — בדקו באתר המוסד.
                </p>
            </main>

            <Footer />
        </div>
    );
}
