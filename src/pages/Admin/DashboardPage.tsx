import React, { useState } from 'react';
import { Users, Flame, MessageSquare, Activity, RefreshCw, Loader2 } from 'lucide-react';
import { AdminShell } from '@/components/Admin/AdminShell';
import { KPICard } from '@/components/Admin/Metrics/KPICard';
import { FunnelChart } from '@/components/Admin/Metrics/FunnelChart';
import { SegmentDonut } from '@/components/Admin/Metrics/SegmentDonut';
import { JourneyStageFlow } from '@/components/Admin/Dashboard/JourneyStageFlow';
import {
    useOverviewMetrics,
    useFunnelMetrics,
    useSegmentMetrics,
} from '@/hooks/useMetrics';

type Period = '7d' | '30d' | '90d';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
    { value: '7d', label: '7 ימים' },
    { value: '30d', label: '30 יום' },
    { value: '90d', label: '90 יום' },
];

export const DashboardPage: React.FC = () => {
    const [period, setPeriod] = useState<Period>('30d');

    const overview = useOverviewMetrics(period);
    const funnel = useFunnelMetrics();
    const journeySegments = useSegmentMetrics('journey_stage');
    const leadStageSegments = useSegmentMetrics('lead_stage');
    const sourceSegments = useSegmentMetrics('source');
    const temperatureSegments = useSegmentMetrics('temperature');

    const isLoading = overview.loading || funnel.loading;

    const totalUsers = (overview.data?.total_users ?? 0) + (overview.data?.total_bot_users ?? 0);

    return (
        <AdminShell title="בית">
            {/* Period selector + Refresh */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                    {PERIOD_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setPeriod(opt.value)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === opt.value
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={overview.refresh}
                    disabled={overview.loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 shadow-sm"
                >
                    {overview.loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    רענון
                </button>
            </div>

            {/* Loading overlay */}
            {isLoading && !overview.data && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            )}

            {/* Row 1: KPI Cards */}
            {overview.data && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KPICard
                        label="סה״כ משתמשים"
                        value={totalUsers}
                        icon={Users}
                        color="blue"
                    />
                    <KPICard
                        label="לידים חמים"
                        value={overview.data.hot_leads}
                        delta={overview.data.hot_leads_delta}
                        icon={Flame}
                        color="orange"
                    />
                    <KPICard
                        label="הודעות בוט"
                        value={overview.data.bot_messages}
                        delta={overview.data.bot_messages_delta}
                        icon={MessageSquare}
                        color="purple"
                    />
                    <KPICard
                        label="משתמשים פעילים"
                        value={overview.data.active_users}
                        icon={Activity}
                        color="green"
                    />
                </div>
            )}

            {/* Row 2: Funnels */}
            {funnel.data && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    <FunnelChart
                        stages={funnel.data.web}
                        title="משפך ווב"
                        color="purple"
                    />
                    <FunnelChart
                        stages={funnel.data.bot}
                        title="משפך בוט"
                        color="green"
                    />
                </div>
            )}

            {/* Row 3: Journey Stage Flow + Segment Donuts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Journey Stage Flow — 60% */}
                <div className="lg:col-span-3">
                    {journeySegments.data ? (
                        <JourneyStageFlow segments={journeySegments.data.segments} />
                    ) : journeySegments.loading ? (
                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex items-center justify-center h-48">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                        </div>
                    ) : null}
                </div>

                {/* Stacked Segment Donuts — 40% */}
                <div className="lg:col-span-2 space-y-4">
                    {leadStageSegments.data && (
                        <SegmentDonut
                            segments={leadStageSegments.data.segments}
                            title="שלב ליד"
                        />
                    )}
                    {sourceSegments.data && (
                        <SegmentDonut
                            segments={sourceSegments.data.segments}
                            title="מקור"
                        />
                    )}
                    {temperatureSegments.data && (
                        <SegmentDonut
                            segments={temperatureSegments.data.segments}
                            title="טמפרטורה"
                        />
                    )}
                </div>
            </div>
        </AdminShell>
    );
};
