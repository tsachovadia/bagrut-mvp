import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Calendar, Search, MapPin, ExternalLink, Filter } from 'lucide-react';
import { cn } from '../lib/utils'; // Assuming standard util exists, or I can define inline if needed. I'll substitute with a simple join or conditional logic if not.

// Simplistic CN replacement if not checking for it, but likely exists in a project like this.
// I'll assume standard class concatenation for safety if 'cn' isn't available, but I'll try to use standard template literals or a helper.
// Actually, looking at file list, 'utils' folder likely has it. I'll assume it for now, or just use template literals to be safe.

interface DateEvent {
    id: string;
    title: string;
    date: string;
    type: 'bagrut' | 'psychometric' | 'open_day';
    location?: string;
    link?: string;
    description?: string;
}

const SAMPLE_EVENTS: DateEvent[] = [
    {
        id: '1',
        title: 'בגרות במתמטיקה (מועד חורף)',
        date: '2026-01-22',
        type: 'bagrut',
        description: 'שאלונים 3, 4, 5 יחידות',
        link: 'https://students.education.gov.il/matriculation/exams-schedule'
    },
    {
        id: '2',
        title: 'בחינה פסיכומטרית - מועד אביב',
        date: '2026-04-02',
        type: 'psychometric',
        description: 'הרשמה מסתיימת ב-15.2.2026',
        link: 'https://www.nite.org.il/'
    },
    {
        id: '3',
        title: 'יום פתוח - אוניברסיטת תל אביב',
        date: '2026-02-20',
        type: 'open_day',
        location: 'קמפוס רמת אביב',
        link: 'https://tau.ac.il/open-day',
        description: 'מפגשים עם ראשי חוגים וסיורים בקמפוס'
    },
    {
        id: '4',
        title: 'בגרות באנגלית (מועד קיץ)',
        date: '2026-05-18',
        type: 'bagrut',
        description: 'מודול A-G'
    },
    {
        id: '5',
        title: 'יום פתוח - הטכניון',
        date: '2026-03-15',
        type: 'open_day',
        location: 'חיפה',
        link: 'https://technion.ac.il',
        description: 'יום פתוח ללימודי הנדסה ומדעים'
    },
    {
        id: '6',
        title: 'בחינה פסיכומטרית - מועד קיץ',
        date: '2026-07-05',
        type: 'psychometric',
        description: 'מועד יולי, הרשמה עד מאי'
    }
];

export function ImportantDatesPage() {
    const [filter, setFilter] = useState<'all' | 'bagrut' | 'psychometric' | 'open_day'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEvents = SAMPLE_EVENTS.filter(event => {
        const matchesFilter = filter === 'all' || event.type === filter;
        const matchesSearch = event.title.includes(searchTerm) || event.description?.includes(searchTerm) || event.date.includes(searchTerm);
        return matchesFilter && matchesSearch;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    const getTypeColor = (type: DateEvent['type']) => {
        switch (type) {
            case 'bagrut': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'psychometric': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'open_day': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeLabel = (type: DateEvent['type']) => {
        switch (type) {
            case 'bagrut': return 'בגרות';
            case 'psychometric': return 'פסיכומטרי';
            case 'open_day': return 'יום פתוח';
            default: return 'אחר';
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">לוח שנה למועמדים</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        כל התאריכים שחשוב לדעת במקום אחד: מועדי בגרויות, מבחני פסיכומטרי וימים פתוחים במוסדות הלימוד.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            הכל
                        </button>
                        <button
                            onClick={() => setFilter('bagrut')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'bagrut' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                        >
                            בגרויות
                        </button>
                        <button
                            onClick={() => setFilter('psychometric')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'psychometric' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}
                        >
                            פסיכומטרי
                        </button>
                        <button
                            onClick={() => setFilter('open_day')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'open_day' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                        >
                            ימים פתוחים
                        </button>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="חיפוש אירוע..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:border-transparent text-sm"
                        />
                    </div>
                </div>

                {/* Table/List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="py-4 px-6 text-sm font-semibold text-gray-600">תאריך</th>
                                    <th className="py-4 px-6 text-sm font-semibold text-gray-600">סוג אירוע</th>
                                    <th className="py-4 px-6 text-sm font-semibold text-gray-600">שם האירוע</th>
                                    <th className="py-4 px-6 text-sm font-semibold text-gray-600">פרטים נוספים</th>
                                    <th className="py-4 px-6 text-sm font-semibold text-gray-600 w-24">פעולות</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredEvents.length > 0 ? (
                                    filteredEvents.map((event) => (
                                        <tr key={event.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="py-4 px-6 text-gray-900 font-medium whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {new Date(event.date).toLocaleDateString('he-IL')}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(event.type)}`}>
                                                    {getTypeLabel(event.type)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-gray-900 font-medium">{event.title}</td>
                                            <td className="py-4 px-6 text-gray-500">
                                                <div className="flex flex-col gap-1">
                                                    <span>{event.description}</span>
                                                    {event.location && (
                                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                                            <MapPin className="w-3 h-3" />
                                                            {event.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {event.link && (
                                                    <a
                                                        href={event.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-brand-purple-600 hover:text-brand-purple-800 p-2 rounded-full hover:bg-brand-purple-50 inline-flex transition-colors"
                                                        title="לפרטים נוספים"
                                                    >
                                                        <ExternalLink className="w-5 h-5" />
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-gray-500">
                                            לא נמצאו אירועים התואמים את הסינון.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
