import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Globe,
  Bot,
  Link2,
  Loader2,
  ChevronDown,
  MessageSquare,
  Phone,
  Calendar,
  User,
  HelpCircle,
  MoreHorizontal,
} from 'lucide-react';
import { AdminShell } from '@/components/Admin/AdminShell';
import { useUnifiedPeople } from '@/hooks/useUnifiedPeople';
import { UserProfilePanel } from '@/components/Admin/People/UserProfilePanel';
import { supabase } from '@/lib/supabase';

// ── Types ──────────────────────────────────────────────────

type Tab = 'all' | 'hot' | 'soft_leads' | 'feedback';
type TemperatureFilter = 'hot' | 'warm' | 'cold' | null;
type JourneyFilter = 'anonymous' | 'explorer' | 'comparator' | 'decider' | null;
type SourceFilter = 'web' | 'bot' | 'both' | null;

interface SoftLead {
  id: string;
  full_name: string | null;
  phone: string | null;
  interest: string | null;
  source: string | null;
  created_at: string;
}

interface BugReport {
  id: string;
  content: string;
  created_at: string;
  user_id: string | null;
}

// ── Helpers ────────────────────────────────────────────────

const JOURNEY_MAP: Record<string, string> = {
  anonymous: 'אנונימי',
  explorer: 'חוקר',
  comparator: 'משווה',
  decider: 'מחליט',
};

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
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Sort options ───────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'lead_score', label: 'ניקוד לידים' },
  { value: 'first_seen', label: 'תאריך הצטרפות' },
  { value: 'bot_messages', label: 'הודעות בוט' },
  { value: 'display_name', label: 'שם' },
];

// ── Component ──────────────────────────────────────────────

export const PeoplePage: React.FC = () => {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tempFilter, setTempFilter] = useState<TemperatureFilter>(null);
  const [journeyFilter, setJourneyFilter] = useState<JourneyFilter>(null);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>(null);
  const [sortBy, setSortBy] = useState('lead_score');
  const [sortDir] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Soft leads & feedback state
  const [softLeads, setSoftLeads] = useState<SoftLead[]>([]);
  const [softLeadsLoading, setSoftLeadsLoading] = useState(false);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [bugReportsLoading, setBugReportsLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Check URL param for pre-selected user
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) setSelectedUserId(id);
  }, []);

  // Unified people hook
  const hookParams = useMemo(() => ({
    search: debouncedSearch || undefined,
    temperature: activeTab === 'hot' ? 'hot' : (tempFilter ?? undefined),
    journeyStage: journeyFilter ?? undefined,
    source: sourceFilter ?? ('all' as const),
    sortBy,
    sortDir,
    limit: 50,
  }), [debouncedSearch, tempFilter, journeyFilter, sourceFilter, sortBy, sortDir, activeTab]);

  const { people, loading, error, total } = useUnifiedPeople(hookParams);

  // Fetch soft leads when tab changes
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

  // Fetch bug reports when tab changes
  useEffect(() => {
    if (activeTab !== 'feedback') return;
    setBugReportsLoading(true);
    supabase
      .from('bug_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBugReports((data as BugReport[]) || []);
        setBugReportsLoading(false);
      });
  }, [activeTab]);

  // ── Pill toggle helpers ──────────────────────────────────

  const toggleTemp = (val: TemperatureFilter) =>
    setTempFilter(prev => (prev === val ? null : val));

  const toggleJourney = (val: JourneyFilter) =>
    setJourneyFilter(prev => (prev === val ? null : val));

  const toggleSource = (val: SourceFilter) =>
    setSourceFilter(prev => (prev === val ? null : val));

  // ── Render: source icon ──────────────────────────────────

  const SourceIcon: React.FC<{ webId: string | null; botId: string | null }> = ({ webId, botId }) => {
    if (webId && botId) return <Link2 className="w-3.5 h-3.5 text-purple-400" />;
    if (webId) return <Globe className="w-3.5 h-3.5 text-blue-400" />;
    return <Bot className="w-3.5 h-3.5 text-green-400" />;
  };

  // ── Render: unified profiles table ───────────────────────

  const renderUnifiedTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      );
    }

    if (error) {
      return <div className="text-red-500 text-center py-8 text-sm">{error}</div>;
    }

    if (people.length === 0) {
      return (
        <div className="text-center py-16 text-gray-400 text-sm">
          לא נמצאו תוצאות
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-right">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">שם</th>
              <th className="px-3 py-3 font-semibold">מקור</th>
              <th className="px-3 py-3 font-semibold">ניקוד</th>
              <th className="px-3 py-3 font-semibold">טמפ׳</th>
              <th className="px-3 py-3 font-semibold">שלב</th>
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
              const scoreColor = score >= 60
                ? 'text-orange-600'
                : score >= 30
                  ? 'text-yellow-600'
                  : 'text-gray-400';

              const tempBadge: Record<string, string> = {
                hot: 'bg-red-50 text-red-700 border-red-200',
                warm: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                cold: 'bg-blue-50 text-blue-700 border-blue-200',
              };
              const tempLabel: Record<string, string> = {
                hot: 'חם',
                warm: 'חמים',
                cold: 'קר',
              };

              const initial = person.display_name?.[0] || '?';

              return (
                <tr
                  key={person.canonical_id}
                  onClick={() => setSelectedUserId(person.canonical_id)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold flex-shrink-0 border border-gray-200">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {person.display_name || 'ללא שם'}
                        </div>
                        {person.email && (
                          <div className="text-[10px] text-gray-500 truncate">{person.email}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Source */}
                  <td className="px-3 py-3">
                    <SourceIcon webId={person.web_profile_id} botId={person.bot_user_id} />
                  </td>

                  {/* Lead score */}
                  <td className="px-3 py-3">
                    <span className={`font-bold text-sm ${scoreColor}`}>{score}</span>
                  </td>

                  {/* Temperature */}
                  <td className="px-3 py-3">
                    {person.temperature ? (
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${tempBadge[person.temperature] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {tempLabel[person.temperature] || person.temperature}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>

                  {/* Journey stage */}
                  <td className="px-3 py-3">
                    {person.journey_stage ? (
                      <span className="inline-flex px-2 py-0.5 rounded bg-white text-gray-600 text-[10px] font-medium border border-gray-200 shadow-sm">
                        {JOURNEY_MAP[person.journey_stage] || person.journey_stage}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>

                  {/* Last activity */}
                  <td className="px-3 py-3 text-gray-400 text-[10px] font-mono">
                    {relativeTime(lastActive)}
                  </td>

                  {/* Bot messages */}
                  <td className="px-3 py-3">
                    {(person.bot_messages ?? 0) > 0 ? (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">{person.bot_messages}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // ── Render: soft leads table ─────────────────────────────

  const renderSoftLeadsTable = () => {
    if (softLeadsLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
        </div>
      );
    }

    if (softLeads.length === 0) {
      return <div className="text-center py-12 text-gray-400 text-sm">אין לידים מהירים</div>;
    }

    return (
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-800">לידים מהירים</h3>
          <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100 border border-yellow-200 px-2 py-0.5 rounded-full">
            {softLeads.length}
          </span>
        </div>
        <table className="w-full text-xs text-right">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">שם</th>
              <th className="px-4 py-3 font-semibold">טלפון</th>
              <th className="px-4 py-3 font-semibold">התעניינות</th>
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
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Phone className="w-3 h-3" />
                    <span className="font-mono">{lead.phone || '-'}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <HelpCircle className="w-3 h-3 text-gray-400" />
                    <span>{lead.interest || '-'}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] border border-gray-200">
                    {lead.source || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-[10px]">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {formatDate(lead.created_at)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ── Render: feedback table ───────────────────────────────

  const renderFeedbackTable = () => {
    if (bugReportsLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
      );
    }

    if (bugReports.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400 text-sm">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          אין דיווחי משוב
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full text-xs text-right">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">תוכן</th>
              <th className="px-4 py-3 font-semibold w-40">מאת</th>
              <th className="px-4 py-3 font-semibold w-40">תאריך</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bugReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-800 whitespace-pre-wrap leading-relaxed">{report.content}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-[10px]">
                  {report.user_id ? (
                    <div className="flex items-center gap-1.5" title={report.user_id}>
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="truncate max-w-[100px]">{report.user_id.slice(0, 8)}...</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">אנונימי</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-[10px]">
                  {formatDate(report.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ── Main render ──────────────────────────────────────────

  const showFilters = activeTab === 'all' || activeTab === 'hot';

  return (
    <AdminShell title="אנשים">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit border border-gray-200">
          {([
            { id: 'all' as Tab, label: 'הכל' },
            { id: 'hot' as Tab, label: 'לידים חמים' },
            { id: 'soft_leads' as Tab, label: 'לידים מהירים' },
            { id: 'feedback' as Tab, label: 'משוב' },
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

        {/* Filters row (only for unified profiles tabs) */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
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

            {/* Temperature pills */}
            <div className="flex items-center gap-1">
              {([
                { val: 'hot' as TemperatureFilter, label: 'חם', active: 'bg-red-50 text-red-600 border-red-200' },
                { val: 'warm' as TemperatureFilter, label: 'חמים', active: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
                { val: 'cold' as TemperatureFilter, label: 'קר', active: 'bg-blue-50 text-blue-600 border-blue-200' },
              ]).map((pill) => (
                <button
                  key={pill.val}
                  onClick={() => toggleTemp(pill.val)}
                  className={`px-3 py-1 text-[10px] font-medium rounded-full border transition-all ${tempFilter === pill.val
                    ? pill.active
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Journey pills */}
            <div className="flex items-center gap-1">
              {([
                { val: 'anonymous' as JourneyFilter, label: 'אנונימי' },
                { val: 'explorer' as JourneyFilter, label: 'חוקר' },
                { val: 'comparator' as JourneyFilter, label: 'משווה' },
                { val: 'decider' as JourneyFilter, label: 'מחליט' },
              ]).map((pill) => (
                <button
                  key={pill.val}
                  onClick={() => toggleJourney(pill.val)}
                  className={`px-3 py-1 text-[10px] font-medium rounded-full border transition-all ${journeyFilter === pill.val
                    ? 'bg-purple-50 text-purple-600 border-purple-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Source pills */}
            <div className="flex items-center gap-1">
              {([
                { val: 'web' as SourceFilter, label: 'אתר', icon: Globe },
                { val: 'bot' as SourceFilter, label: 'בוט', icon: Bot },
                { val: 'both' as SourceFilter, label: 'שניהם', icon: Link2 },
              ]).map((pill) => (
                <button
                  key={pill.val}
                  onClick={() => toggleSource(pill.val)}
                  className={`px-3 py-1 text-[10px] font-medium rounded-full border transition-all flex items-center gap-1.5 ${sourceFilter === pill.val
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <pill.icon className="w-3 h-3" />
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Sort dropdown */}
            <div className="relative mr-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg text-xs text-gray-700 pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-sm hover:bg-gray-50 transition-colors"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Total count */}
            <div className="text-[10px] font-medium text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
              {total} אנשים
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {activeTab === 'all' && renderUnifiedTable()}
          {activeTab === 'hot' && renderUnifiedTable()}
          {activeTab === 'soft_leads' && renderSoftLeadsTable()}
          {activeTab === 'feedback' && renderFeedbackTable()}
        </div>
      </div>

      {/* Slide-over panel */}
      <UserProfilePanel
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </AdminShell>
  );
};
