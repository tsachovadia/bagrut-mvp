import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search, ArrowRight, X, Loader2,
    Globe, Bot, Link2, MessageSquare, Phone, Mail, Send as TelegramIcon,
    GraduationCap, Brain, Calculator, Clock, Users, Facebook, Zap,
    ExternalLink, TrendingUp, MousePointerClick, Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

// --- Types ---

type Tab = 'soft_leads' | 'people' | 'fb_leads';

interface UnifiedPerson {
    canonical_id: string;
    display_name: string;
    email: string | null;
    phone: string | null;
    telegram_chat_id: string | null;
    telegram_username: string | null;
    bagrut_grades: any;
    bagrut_avg_raw: number | null;
    psycho_total: number | null;
    psycho_quant: number | null;
    psycho_eng: number | null;
    sector: string | null;
    lead_score: number | null;
    journey_stage: string | null;
    temperature: string | null;
    web_last_active: string | null;
    bot_last_active: string | null;
    bot_messages: number | null;
    tracked_programs: string[] | null;
    web_profile_id: string | null;
    bot_user_id: string | null;
    is_linked: boolean;
    first_seen: string | null;
}

interface SoftLead {
    id: string;
    full_name: string | null;
    name: string | null;
    phone: string | null;
    email: string | null;
    interest: string | null;
    source: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    utm_term: string | null;
    metadata: Record<string, any> | null;
    user_profile_id: string | null;
    created_at: string;
    updated_at: string | null;
}

interface FbLead {
    id: string;
    full_name: string | null;
    fb_name: string | null;
    email: string | null;
    phone: string | null;
    age: string | null;
    dilemma: string | null;
    interests: string[] | null;
    source_group: string | null;
    status: string | null;
    created_at: string;
}

interface BotMessage {
    id: string;
    direction: string;
    content: string | null;
    message_type: string | null;
    created_at: string;
}

// --- Helpers ---

function relativeTime(dateStr: string | null): string {
    if (!dateStr) return '-';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'עכשיו';
    if (mins < 60) return `לפני ${mins} דק׳`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `לפני ${hours} שע׳`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `לפני ${days} ימים`;
    return `לפני ${Math.floor(days / 30)} חודשים`;
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('he-IL', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function sourceIcon(person: UnifiedPerson) {
    if (person.web_profile_id && person.bot_user_id)
        return <span title="מקושר"><Link2 className="w-4 h-4 text-purple-500" /></span>;
    if (person.web_profile_id)
        return <span title="אתר"><Globe className="w-4 h-4 text-blue-500" /></span>;
    return <span title="בוט"><Bot className="w-4 h-4 text-green-500" /></span>;
}

function scoreBadge(score: number | null) {
    const s = score ?? 0;
    const color = s >= 60 ? 'bg-orange-100 text-orange-700' : s >= 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500';
    return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{s}</span>;
}

function utmBadge(source: string | null, medium: string | null) {
    if (!source && !medium) return <span className="text-gray-300 text-[10px]">ישיר</span>;
    const label = [source, medium].filter(Boolean).join(' / ');
    const colorMap: Record<string, string> = {
        google: 'bg-blue-50 text-blue-700 border-blue-200',
        facebook: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        whatsapp: 'bg-green-50 text-green-700 border-green-200',
        share: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        telegram: 'bg-sky-50 text-sky-700 border-sky-200',
    };
    const color = colorMap[source?.toLowerCase() || ''] || 'bg-purple-50 text-purple-700 border-purple-200';
    return (
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${color}`}>
            {label}
        </span>
    );
}

// --- Main Component ---

export function Backstage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('soft_leads');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // People state
    const [people, setPeople] = useState<UnifiedPerson[]>([]);
    const [peopleLoading, setPeopleLoading] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState<UnifiedPerson | null>(null);
    const [botMessages, setBotMessages] = useState<BotMessage[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(false);

    // Soft leads state
    const [softLeads, setSoftLeads] = useState<SoftLead[]>([]);
    const [softLeadsLoading, setSoftLeadsLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<SoftLead | null>(null);

    // Facebook leads state
    const [fbLeads, setFbLeads] = useState<FbLead[]>([]);
    const [fbLeadsLoading, setFbLeadsLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    // Fetch soft leads (default tab)
    const fetchSoftLeads = useCallback(async () => {
        setSoftLeadsLoading(true);
        let query = supabase
            .from('soft_leads')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);

        if (debouncedSearch.length >= 2) {
            const q = `%${debouncedSearch}%`;
            query = query.or(`full_name.ilike.${q},name.ilike.${q},phone.ilike.${q},email.ilike.${q}`);
        }

        const { data } = await query;
        setSoftLeads((data as SoftLead[]) || []);
        setSoftLeadsLoading(false);
    }, [debouncedSearch]);

    useEffect(() => {
        if (activeTab === 'soft_leads') fetchSoftLeads();
    }, [activeTab, fetchSoftLeads]);

    // Fetch people
    const fetchPeople = useCallback(async () => {
        setPeopleLoading(true);
        let query = supabase
            .from('unified_profiles')
            .select('*')
            .order('lead_score', { ascending: false, nullsFirst: false })
            .limit(100);

        if (debouncedSearch.length >= 2) {
            const q = `%${debouncedSearch}%`;
            query = query.or(`display_name.ilike.${q},email.ilike.${q},phone.ilike.${q},telegram_username.ilike.${q}`);
        }

        const { data } = await query;
        setPeople((data as UnifiedPerson[]) || []);
        setPeopleLoading(false);
    }, [debouncedSearch]);

    useEffect(() => {
        if (activeTab === 'people') fetchPeople();
    }, [activeTab, fetchPeople]);

    // Fetch facebook leads
    useEffect(() => {
        if (activeTab !== 'fb_leads') return;
        setFbLeadsLoading(true);
        Promise.all([
            supabase.from('leads').select('id, full_name, email, age, dilemma, status, created_at').order('created_at', { ascending: false }).limit(200),
            supabase.from('facebook_leads').select('id, fb_name, email, phone, interests, source_group, created_at').order('created_at', { ascending: false }).limit(200),
        ]).then(([leadsRes, fbRes]) => {
            const fromLeads: FbLead[] = (leadsRes.data || []).map((l: any) => ({
                id: l.id, full_name: l.full_name, fb_name: null, email: l.email, phone: null,
                age: l.age, dilemma: l.dilemma, interests: null, source_group: 'leads table',
                status: l.status, created_at: l.created_at,
            }));
            const fromFb: FbLead[] = (fbRes.data || []).map((f: any) => ({
                id: f.id, full_name: null, fb_name: f.fb_name, email: f.email, phone: f.phone,
                age: null, dilemma: null, interests: f.interests, source_group: f.source_group,
                status: null, created_at: f.created_at,
            }));
            setFbLeads([...fromLeads, ...fromFb].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ));
            setFbLeadsLoading(false);
        });
    }, [activeTab]);

    // Fetch bot messages when person selected
    useEffect(() => {
        if (!selectedPerson?.bot_user_id) { setBotMessages([]); return; }
        setMessagesLoading(true);
        supabase
            .from('bot_messages_log')
            .select('id, direction, content, message_type, created_at')
            .eq('bot_user_id', selectedPerson.bot_user_id)
            .order('created_at', { ascending: false })
            .limit(30)
            .then(({ data }) => {
                setBotMessages((data as BotMessage[]) || []);
                setMessagesLoading(false);
            });
    }, [selectedPerson?.bot_user_id]);

    const lastActive = useCallback((p: UnifiedPerson) => {
        const web = p.web_last_active ? new Date(p.web_last_active).getTime() : 0;
        const bot = p.bot_last_active ? new Date(p.bot_last_active).getTime() : 0;
        if (web > bot) return p.web_last_active;
        if (bot > 0) return p.bot_last_active;
        return null;
    }, []);

    // KPI computations
    const kpis = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const weekAgo = todayStart - 7 * 24 * 60 * 60 * 1000;

        const leadsToday = softLeads.filter(l => new Date(l.created_at).getTime() >= todayStart).length;
        const leadsThisWeek = softLeads.filter(l => new Date(l.created_at).getTime() >= weekAgo).length;

        // UTM source breakdown
        const utmBreakdown: Record<string, number> = {};
        softLeads.forEach(l => {
            const key = l.utm_source || 'ישיר';
            utmBreakdown[key] = (utmBreakdown[key] || 0) + 1;
        });

        return { leadsToday, leadsThisWeek, utmBreakdown };
    }, [softLeads]);

    const tabs: { id: Tab; label: string; count: number }[] = [
        { id: 'soft_leads', label: 'לידים', count: softLeads.length },
        { id: 'people', label: 'משתמשים', count: people.length },
        { id: 'fb_leads', label: 'פייסבוק', count: fbLeads.length },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900" dir="rtl">
            {/* Header */}
            <header className="h-14 bg-white/80 backdrop-blur border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-800">Backstage</h1>
                </div>

                <div className="relative">
                    <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="חיפוש שם, טלפון, אימייל..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-4 pr-9 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-48 sm:w-64"
                    />
                </div>
            </header>

            {/* KPI Cards */}
            <div className="px-4 sm:px-6 max-w-6xl mx-auto pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <KpiCard label="לידים היום" value={kpis.leadsToday} icon={<Zap className="w-4 h-4" />} color="yellow" />
                    <KpiCard label="לידים השבוע" value={kpis.leadsThisWeek} icon={<TrendingUp className="w-4 h-4" />} color="green" />
                    <KpiCard label="סה״כ לידים" value={softLeads.length} icon={<MousePointerClick className="w-4 h-4" />} color="blue" />
                    <KpiCard label="משתמשים רשומים" value={people.length} icon={<Users className="w-4 h-4" />} color="purple" />
                </div>

                {/* UTM Breakdown (only if there are leads) */}
                {Object.keys(kpis.utmBreakdown).length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mb-4 text-xs">
                        <span className="text-gray-400 font-medium">מקורות:</span>
                        {Object.entries(kpis.utmBreakdown)
                            .sort(([, a], [, b]) => b - a)
                            .map(([source, count]) => (
                                <span key={source} className="px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-600">
                                    {source} <span className="font-bold text-gray-800">{count}</span>
                                </span>
                            ))
                        }
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="px-4 sm:px-6 max-w-6xl mx-auto">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200 w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                                activeTab === tab.id
                                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                        >
                            {tab.label} {tab.count > 0 && <span className="text-gray-400 mr-1">({tab.count})</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 pt-3 max-w-6xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* ========== Soft Leads Tab ========== */}
                    {activeTab === 'soft_leads' && (
                        softLeadsLoading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
                            </div>
                        ) : softLeads.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 text-sm">אין לידים עדיין</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-right">
                                    <thead className="bg-gray-50 text-gray-500 text-xs font-medium border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3">שם</th>
                                            <th className="px-3 py-3">טלפון</th>
                                            <th className="px-3 py-3 hidden sm:table-cell">אימייל</th>
                                            <th className="px-3 py-3 hidden sm:table-cell">מקור UTM</th>
                                            <th className="px-3 py-3 hidden md:table-cell">עניין</th>
                                            <th className="px-3 py-3">מתי</th>
                                            <th className="px-3 py-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {softLeads.map((lead) => (
                                            <tr
                                                key={lead.id}
                                                onClick={() => setSelectedLead(lead)}
                                                className="hover:bg-yellow-50/50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                                                        <div className="min-w-0">
                                                            <span className="font-medium text-gray-900 block truncate">
                                                                {lead.full_name || lead.name || '-'}
                                                            </span>
                                                            {lead.source && (
                                                                <span className="text-[10px] text-gray-400">{lead.source}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 font-mono text-gray-600 text-xs">{lead.phone || '-'}</td>
                                                <td className="px-3 py-3 hidden sm:table-cell text-gray-500 text-xs truncate max-w-[180px]">
                                                    {lead.email || '-'}
                                                </td>
                                                <td className="px-3 py-3 hidden sm:table-cell">
                                                    {utmBadge(lead.utm_source, lead.utm_medium)}
                                                </td>
                                                <td className="px-3 py-3 hidden md:table-cell text-gray-500 text-xs truncate max-w-[150px]">
                                                    {lead.interest || '-'}
                                                </td>
                                                <td className="px-3 py-3 text-gray-400 text-[10px] font-mono whitespace-nowrap">
                                                    {relativeTime(lead.created_at)}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <Eye className="w-3.5 h-3.5 text-gray-300" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}

                    {/* ========== People Tab ========== */}
                    {activeTab === 'people' && (
                        peopleLoading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                            </div>
                        ) : people.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 text-sm">לא נמצאו משתמשים</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-right">
                                    <thead className="bg-gray-50 text-gray-500 text-xs font-medium border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3">שם</th>
                                            <th className="px-3 py-3">מקור</th>
                                            <th className="px-3 py-3">ניקוד</th>
                                            <th className="px-3 py-3 hidden sm:table-cell">בגרות</th>
                                            <th className="px-3 py-3 hidden sm:table-cell">פסיכומטרי</th>
                                            <th className="px-3 py-3 hidden md:table-cell">מעקב</th>
                                            <th className="px-3 py-3">פעילות אחרונה</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {people.map((p) => (
                                            <tr
                                                key={p.canonical_id}
                                                onClick={() => setSelectedPerson(p)}
                                                className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0 border border-gray-200">
                                                            {p.display_name?.[0] || '?'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-gray-900 truncate">{p.display_name}</div>
                                                            {p.email && !p.email.includes('-') && (
                                                                <div className="text-[10px] text-gray-400 truncate">{p.email}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">{sourceIcon(p)}</td>
                                                <td className="px-3 py-3">{scoreBadge(p.lead_score)}</td>
                                                <td className="px-3 py-3 hidden sm:table-cell text-xs text-gray-600 font-mono">
                                                    {p.bagrut_avg_raw ? Number(p.bagrut_avg_raw).toFixed(1) : '-'}
                                                </td>
                                                <td className="px-3 py-3 hidden sm:table-cell text-xs text-gray-600 font-mono">
                                                    {p.psycho_total || '-'}
                                                </td>
                                                <td className="px-3 py-3 hidden md:table-cell">
                                                    {p.tracked_programs && p.tracked_programs.length > 0 ? (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-medium">
                                                            {p.tracked_programs.length} תוכניות
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300 text-xs">-</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 text-gray-400 text-xs font-mono whitespace-nowrap">
                                                    {relativeTime(lastActive(p))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}

                    {/* ========== Facebook Leads Tab ========== */}
                    {activeTab === 'fb_leads' && (
                        fbLeadsLoading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                            </div>
                        ) : fbLeads.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 text-sm">אין לידים מפייסבוק</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-right">
                                    <thead className="bg-gray-50 text-gray-500 text-xs font-medium border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3">שם</th>
                                            <th className="px-3 py-3 hidden sm:table-cell">אימייל</th>
                                            <th className="px-3 py-3 hidden sm:table-cell">דילמה / תחומי עניין</th>
                                            <th className="px-3 py-3 hidden md:table-cell">סטטוס</th>
                                            <th className="px-3 py-3">נוצר</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {fbLeads.map((lead) => (
                                            <tr key={lead.id} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Facebook className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                        <div className="min-w-0">
                                                            <span className="font-medium text-gray-900 truncate block">
                                                                {lead.full_name || lead.fb_name || '-'}
                                                            </span>
                                                            {lead.phone && <span className="text-[10px] text-gray-400 font-mono">{lead.phone}</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 hidden sm:table-cell text-gray-500 text-xs truncate max-w-[200px]">{lead.email || '-'}</td>
                                                <td className="px-3 py-3 hidden sm:table-cell text-gray-500 text-xs truncate max-w-[250px]">
                                                    {lead.dilemma || lead.interests?.join(', ') || '-'}
                                                </td>
                                                <td className="px-3 py-3 hidden md:table-cell">
                                                    {lead.status && (
                                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                                            lead.status === 'replied' ? 'bg-green-50 text-green-600 border-green-200' :
                                                            lead.status === 'sent' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                            'bg-gray-100 text-gray-600 border-gray-200'
                                                        }`}>
                                                            {lead.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 text-gray-400 text-[10px] font-mono">{relativeTime(lead.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* ========== Soft Lead Detail Drawer ========== */}
            {selectedLead && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
                        onClick={() => setSelectedLead(null)}
                    />
                    <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-40 shadow-2xl overflow-y-auto" dir="rtl">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-sm">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">
                                        {selectedLead.full_name || selectedLead.name || 'ליד ללא שם'}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-mono">
                                        {formatDate(selectedLead.created_at)}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Contact */}
                            <Section title="פרטי קשר" icon={Phone}>
                                <InfoRow label="טלפון" value={selectedLead.phone} icon={<Phone className="w-3.5 h-3.5" />} />
                                <InfoRow label="אימייל" value={selectedLead.email} icon={<Mail className="w-3.5 h-3.5" />} />
                                <InfoRow label="שם מלא" value={selectedLead.full_name} />
                                <InfoRow label="שם" value={selectedLead.name} />
                            </Section>

                            {/* Source & UTM */}
                            <Section title="מקור הגעה" icon={ExternalLink}>
                                <InfoRow label="מקור" value={selectedLead.source} />
                                <InfoRow label="UTM Source" value={selectedLead.utm_source} />
                                <InfoRow label="UTM Medium" value={selectedLead.utm_medium} />
                                <InfoRow label="UTM Campaign" value={selectedLead.utm_campaign} />
                                <InfoRow label="UTM Content" value={selectedLead.utm_content} />
                                <InfoRow label="UTM Term" value={selectedLead.utm_term} />
                            </Section>

                            {/* Interest */}
                            {selectedLead.interest && (
                                <Section title="תחום עניין" icon={GraduationCap}>
                                    <p className="text-sm text-gray-700">{selectedLead.interest}</p>
                                </Section>
                            )}

                            {/* Metadata */}
                            {selectedLead.metadata && Object.keys(selectedLead.metadata).length > 0 && (
                                <Section title="מטא-דאטה" icon={Eye}>
                                    {Object.entries(selectedLead.metadata).map(([key, val]) => (
                                        <InfoRow key={key} label={key} value={typeof val === 'string' ? val : JSON.stringify(val)} />
                                    ))}
                                </Section>
                            )}

                            {/* Timeline */}
                            <Section title="ציר זמן" icon={Clock}>
                                <InfoRow label="נוצר" value={formatDate(selectedLead.created_at)} />
                                <InfoRow label="עודכן" value={formatDate(selectedLead.updated_at)} />
                                {selectedLead.user_profile_id && (
                                    <InfoRow label="משויך לפרופיל" value="כן" icon={<Link2 className="w-3.5 h-3.5 text-purple-500" />} />
                                )}
                            </Section>
                        </div>
                    </div>
                </>
            )}

            {/* ========== Person Detail Drawer ========== */}
            {selectedPerson && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
                        onClick={() => setSelectedPerson(null)}
                    />
                    <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-40 shadow-2xl overflow-y-auto" dir="rtl">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                    {selectedPerson.display_name?.[0] || '?'}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">{selectedPerson.display_name}</div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {selectedPerson.web_profile_id && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">Web</span>
                                        )}
                                        {selectedPerson.bot_user_id && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-600 border border-green-200">Bot</span>
                                        )}
                                        {selectedPerson.is_linked && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-200">Linked</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPerson(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-5 space-y-5">
                            <Section title="פרטי קשר" icon={Phone}>
                                <InfoRow label="אימייל" value={selectedPerson.email} icon={<Mail className="w-3.5 h-3.5" />} />
                                <InfoRow label="טלפון" value={selectedPerson.phone} icon={<Phone className="w-3.5 h-3.5" />} />
                                <InfoRow label="טלגרם" value={selectedPerson.telegram_username ? `@${selectedPerson.telegram_username}` : null} icon={<TelegramIcon className="w-3.5 h-3.5" />} />
                                {selectedPerson.sector && (
                                    <InfoRow label="מגזר" value={selectedPerson.sector} icon={<Users className="w-3.5 h-3.5" />} />
                                )}
                            </Section>

                            <Section title="אקדמי" icon={GraduationCap}>
                                <InfoRow label="ממוצע בגרות" value={selectedPerson.bagrut_avg_raw ? String(Number(selectedPerson.bagrut_avg_raw).toFixed(1)) : null} icon={<Calculator className="w-3.5 h-3.5" />} />
                                <InfoRow label="פסיכומטרי" value={selectedPerson.psycho_total ? String(selectedPerson.psycho_total) : null} icon={<Brain className="w-3.5 h-3.5" />} />
                                {selectedPerson.psycho_quant && <InfoRow label="כמותי" value={String(selectedPerson.psycho_quant)} />}
                                {selectedPerson.psycho_eng && <InfoRow label="אנגלית" value={String(selectedPerson.psycho_eng)} />}
                                <InfoRow label="תוכניות במעקב" value={selectedPerson.tracked_programs?.length ? String(selectedPerson.tracked_programs.length) : null} />
                            </Section>

                            <Section title="מעורבות" icon={MessageSquare}>
                                <InfoRow label="ניקוד ליד" value={String(selectedPerson.lead_score ?? 0)} />
                                <InfoRow label="שלב" value={selectedPerson.journey_stage} />
                                <InfoRow label="טמפרטורה" value={selectedPerson.temperature} />
                                <InfoRow label="הודעות בוט" value={selectedPerson.bot_messages ? String(selectedPerson.bot_messages) : null} />
                            </Section>

                            <Section title="פעילות באתר" icon={MousePointerClick}>
                                <InfoRow label="נראה לראשונה" value={formatDate(selectedPerson.first_seen)} />
                                <InfoRow label="אתר — אחרון" value={formatDate(selectedPerson.web_last_active)} />
                                <InfoRow label="בוט — אחרון" value={formatDate(selectedPerson.bot_last_active)} />
                            </Section>

                            {selectedPerson.bot_user_id && (
                                <Section title="הודעות בוט" icon={MessageSquare}>
                                    {messagesLoading ? (
                                        <div className="flex justify-center py-4">
                                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                        </div>
                                    ) : botMessages.length === 0 ? (
                                        <div className="text-xs text-gray-400 py-2">אין הודעות</div>
                                    ) : (
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {botMessages.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    className={`text-xs p-2 rounded-lg ${
                                                        msg.direction === 'incoming'
                                                            ? 'bg-gray-100 text-gray-700'
                                                            : 'bg-blue-50 text-blue-800'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-medium text-[10px] text-gray-400">
                                                            {msg.direction === 'incoming' ? 'משתמש' : 'בוט'}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-mono">
                                                            {relativeTime(msg.created_at)}
                                                        </span>
                                                    </div>
                                                    <div className="break-words whitespace-pre-wrap">
                                                        {msg.content?.slice(0, 300) || `[${msg.message_type || 'empty'}]`}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Section>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// --- Sub-components ---

function KpiCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
    const colorMap: Record<string, string> = {
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
    };
    const iconBg: Record<string, string> = {
        yellow: 'bg-yellow-100 text-yellow-600',
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
    };
    return (
        <div className={`rounded-xl border p-3 ${colorMap[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium opacity-80">{label}</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg[color]}`}>
                    {icon}
                </div>
            </div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">{title}</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                {children}
            </div>
        </div>
    );
}

function InfoRow({ label, value, icon }: { label: string; value: string | null | undefined; icon?: React.ReactNode }) {
    if (!value || value === '-') return null;
    return (
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500">
                {icon}
                <span className="text-xs">{label}</span>
            </div>
            <span className="text-gray-900 font-medium text-xs max-w-[220px] truncate text-left" dir="ltr">{value}</span>
        </div>
    );
}
