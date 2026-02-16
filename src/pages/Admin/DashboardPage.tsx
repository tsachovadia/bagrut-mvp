import React, { useState, useEffect, useMemo } from 'react';
import {
    Users, Flame, Activity, Loader2,
    Search, Globe, Bot, Link2, Phone, Calendar, User, MessageSquare,
} from 'lucide-react';
import { AdminShell } from '@/components/Admin/AdminShell';
import { KPICard } from '@/components/Admin/Metrics/KPICard';
import { useOverviewMetrics } from '@/hooks/useMetrics';
import { useUnifiedPeople } from '@/hooks/useUnifiedPeople';
import { supabase } from '@/lib/supabase';

type Tab = 'people' | 'soft_leads';

interface SoftLead {
    id: string;
    full_name: string | null;
    phone: string | null;
    email: string | null;
    interest: string | null;
    source: string | null;
    created_at: string;
}

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

function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('he-IL', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export const DashboardPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('people');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [softLeads, setSoftLeads] = useState<SoftLead[]>([]);
    const [softLeadsLoading, setSoftLeadsLoading] = useState(false);

    const overview = useOverviewMetrics('30d');

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(t);
    }, [searchTerm]);

    // Unified people
    const hookParams = useMemo(() => ({
        search: debouncedSearch || undefined,
        source: 'all' as const,
        sortBy: 'lead_score',
        sortDir: 'desc' as const,
        limit: 50,
    }), [debouncedSearch]);

    const { people, loading: peopleLoading, total } = useUnifiedPeople(hookParams);

    // Fetch soft leads
    useEffect(() => {
        if (activeTab !== 'soft_leads') return;
        setSoftLeadsLoading(true);
        supabase
            .from('soft_leads')
            .select('*')
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                setSoftLeads((data as SoftLead[]) || []);
                setSoftLeadsLoading(false);
            });
    }, [activeTab]);

    const totalUsers = (overview.data?.total_users ?? 0) + (overview.data?.total_bot_users ?? 0);

    return (
        <AdminShell title="ShadowNet">
            {/* KPI Cards */}
            {overview.data && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KPICard label="סה״כ משתמשים" value={totalUsers} icon={Users} color="blue" />
                    <KPICard label="לידים חמים" value={overview.data.hot_leads} delta={overview.data.hot_leads_delta} icon={Flame} color="orange" />
                    <KPICard label="לידים מהירים" value={softLeads.length || '...'} icon={Phone} color="orange" />
                    <KPICard label="משתמשים פעילים" value={overview.data.active_users} icon={Activity} color="green" />
                </div>
            )}
            {overview.loading && !overview.data && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            )}

            {/* Tabs + Search */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                    {([
                        { id: 'people' as Tab, label: `אנשים (${total})` },
                        { id: 'soft_leads' as Tab, label: 'לידים מהירים' },
                    ]).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'people' && (
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="חיפוש שם, אימייל, טלפון..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
                        />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {activeTab === 'people' && (
                    peopleLoading ? (
                        <div className="flex justify-center items-center py-16">
                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        </div>
                    ) : people.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 text-sm">לא נמצאו תוצאות</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-right">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">שם</th>
                                        <th className="px-3 py-3 font-semibold">מקור</th>
                                        <th className="px-3 py-3 font-semibold">ניקוד</th>
                                        <th className="px-3 py-3 font-semibold">פעילות</th>
                                        <th className="px-3 py-3 font-semibold">הודעות</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {people.map((person) => {
                                        const lastActive = person.bot_last_active && person.web_last_active
                                            ? (new Date(person.bot_last_active) > new Date(person.web_last_active) ? person.bot_last_active : person.web_last_active)
                                            : person.bot_last_active || person.web_last_active;
                                        const score = person.lead_score ?? 0;
                                        const scoreColor = score >= 60 ? 'text-orange-600' : score >= 30 ? 'text-yellow-600' : 'text-gray-400';
                                        const initial = person.display_name?.[0] || '?';

                                        return (
                                            <tr key={person.canonical_id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold flex-shrink-0 border border-gray-200">
                                                            {initial}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-gray-900 truncate">{person.display_name || 'ללא שם'}</div>
                                                            {person.email && <div className="text-[10px] text-gray-500 truncate">{person.email}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    {person.web_profile_id && person.bot_user_id ? <Link2 className="w-3.5 h-3.5 text-purple-400" /> :
                                                     person.web_profile_id ? <Globe className="w-3.5 h-3.5 text-blue-400" /> :
                                                     <Bot className="w-3.5 h-3.5 text-green-400" />}
                                                </td>
                                                <td className="px-3 py-3"><span className={`font-bold text-sm ${scoreColor}`}>{score}</span></td>
                                                <td className="px-3 py-3 text-gray-400 text-[10px] font-mono">{relativeTime(lastActive)}</td>
                                                <td className="px-3 py-3">
                                                    {(person.bot_messages ?? 0) > 0 ? (
                                                        <div className="flex items-center gap-1.5 text-gray-500">
                                                            <MessageSquare className="w-3.5 h-3.5" />
                                                            <span className="text-[11px] font-medium">{person.bot_messages}</span>
                                                        </div>
                                                    ) : <span className="text-gray-300">-</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {activeTab === 'soft_leads' && (
                    softLeadsLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
                        </div>
                    ) : softLeads.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">אין לידים מהירים</div>
                    ) : (
                        <table className="w-full text-xs text-right">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">שם</th>
                                    <th className="px-4 py-3 font-semibold">טלפון</th>
                                    <th className="px-4 py-3 font-semibold">אימייל</th>
                                    <th className="px-4 py-3 font-semibold">מקור</th>
                                    <th className="px-4 py-3 font-semibold">נוצר</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {softLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-yellow-600" />
                                                <span className="font-medium text-gray-900">{lead.full_name || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-gray-600">{lead.phone || '-'}</span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{lead.email || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] border border-gray-200">
                                                {lead.source || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-[10px]">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(lead.created_at)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>
        </AdminShell>
    );
};
