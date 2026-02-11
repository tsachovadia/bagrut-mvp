import React, { useState } from 'react';
import { AdminShell } from '../../components/Admin/AdminShell';
import { KPICard } from '../../components/Admin/Metrics/KPICard';
import { FunnelChart } from '../../components/Admin/Metrics/FunnelChart';
import { TimeSeriesChart } from '../../components/Admin/Metrics/TimeSeriesChart';
import { SegmentDonut } from '../../components/Admin/Metrics/SegmentDonut';
import {
    useOverviewMetrics,
    useFunnelMetrics,
    useTimeSeriesMetrics,
    useSegmentMetrics,
} from '../../hooks/useMetrics';
import { Users, Flame, MessageSquare, Activity, RefreshCw, Loader2 } from 'lucide-react';

export const MetricsDashboard: React.FC = () => {
    const [period, setPeriod] = useState('30d');
    const { data: overview, loading: overviewLoading, refresh } = useOverviewMetrics(period);
    const { data: funnel, loading: funnelLoading } = useFunnelMetrics();
    const { data: timeseries, loading: tsLoading } = useTimeSeriesMetrics('new_users', period === '7d' ? 7 : 30);
    const { data: segments, loading: segLoading } = useSegmentMetrics('lead_stage');
    const { data: sourceSegments } = useSegmentMetrics('source');

    const isLoading = overviewLoading || funnelLoading;

    return (
        <AdminShell title="מטריקות">
            <div className="space-y-4">
                {/* Header Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {['7d', '30d', '90d'].map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${period === p
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {p === '7d' ? '7 ימים' : p === '30d' ? '30 ימים' : '90 ימים'}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={refresh}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        רענן
                    </button>
                </div>

                {/* KPI Cards */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                ) : overview ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <KPICard
                                label="סה״כ משתמשים"
                                value={overview.total_users + overview.total_bot_users}
                                delta={overview.new_users_delta}
                                icon={Users}
                                color="blue"
                            />
                            <KPICard
                                label="לידים חמים"
                                value={overview.hot_leads}
                                delta={overview.hot_leads_delta}
                                icon={Flame}
                                color="orange"
                            />
                            <KPICard
                                label="הודעות בוט"
                                value={overview.bot_messages}
                                delta={overview.bot_messages_delta}
                                icon={MessageSquare}
                                color="purple"
                            />
                            <KPICard
                                label="משתמשים פעילים"
                                value={overview.active_users}
                                icon={Activity}
                                color="green"
                            />
                        </div>

                        {/* Secondary KPIs */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white rounded-lg border border-gray-200 p-3">
                                <span className="text-[10px] text-gray-400">ממוצע Lead Score</span>
                                <p className="text-lg font-bold text-gray-900">{overview.avg_lead_score}</p>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-3">
                                <span className="text-[10px] text-gray-400">משתמשי בוט</span>
                                <p className="text-lg font-bold text-gray-900">{overview.total_bot_users.toLocaleString('he-IL')}</p>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-3">
                                <span className="text-[10px] text-gray-400">Soft Leads</span>
                                <p className="text-lg font-bold text-gray-900">{overview.total_soft_leads.toLocaleString('he-IL')}</p>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-3">
                                <span className="text-[10px] text-gray-400">משתמשים חדשים</span>
                                <p className="text-lg font-bold text-gray-900">{overview.new_users.toLocaleString('he-IL')}</p>
                            </div>
                        </div>
                    </>
                ) : null}

                {/* Funnel Charts */}
                {funnel && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FunnelChart stages={funnel.web} title="Funnel - אתר" color="blue" />
                        <FunnelChart stages={funnel.bot} title="Funnel - בוט טלגרם" color="purple" />
                    </div>
                )}

                {/* Time Series + Segments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {timeseries && !tsLoading && (
                        <TimeSeriesChart data={timeseries.data} title="משתמשים חדשים ליום" color="blue" />
                    )}
                    {segments && !segLoading && (
                        <SegmentDonut segments={segments.segments} title="שלבי Lead" />
                    )}
                </div>

                {/* Source breakdown */}
                {sourceSegments && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <SegmentDonut segments={sourceSegments.segments} title="מקורות תנועה" />
                    </div>
                )}
            </div>
        </AdminShell>
    );
};
