import { useState, useEffect, useCallback } from 'react';

const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_API_TOKEN || '';

async function fetchMetrics<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const query = new URLSearchParams(params).toString();
    const url = `/api/metrics/${endpoint}${query ? `?${query}` : ''}`;
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    if (!res.ok) throw new Error(`Metrics API error: ${res.status}`);
    return res.json() as Promise<T>;
}

// --- Types ---

export interface OverviewMetrics {
    total_users: number;
    total_bot_users: number;
    total_soft_leads: number;
    new_users: number;
    new_users_delta: number;
    active_users: number;
    bot_messages: number;
    bot_messages_delta: number;
    hot_leads: number;
    hot_leads_delta: number;
    avg_lead_score: number;
    period: string;
}

export interface FunnelStage {
    name: string;
    count: number;
    label: string;
}

export interface FunnelMetrics {
    web: FunnelStage[];
    bot: FunnelStage[];
}

export interface TimeSeriesPoint {
    date: string;
    value: number;
}

export interface TimeSeriesMetrics {
    metric: string;
    days: number;
    data: TimeSeriesPoint[];
}

export interface Segment {
    label: string;
    count: number;
}

export interface SegmentMetrics {
    dimension: string;
    segments: Segment[];
}

export interface SocialProofMetrics {
    total_users: number;
    calculations_this_week: number;
    community_members: number;
}

// --- Hooks ---

export function useOverviewMetrics(period: string = '30d') {
    const [data, setData] = useState<OverviewMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(() => {
        setLoading(true);
        fetchMetrics<OverviewMetrics>('overview', { period })
            .then(setData)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [period]);

    useEffect(() => { refresh(); }, [refresh]);

    return { data, loading, error, refresh };
}

export function useFunnelMetrics() {
    const [data, setData] = useState<FunnelMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics<FunnelMetrics>('funnel')
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return { data, loading };
}

export function useTimeSeriesMetrics(metric: string = 'new_users', days: number = 30) {
    const [data, setData] = useState<TimeSeriesMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics<TimeSeriesMetrics>('timeseries', { metric, days: String(days) })
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [metric, days]);

    return { data, loading };
}

export function useSegmentMetrics(dimension: string = 'lead_stage') {
    const [data, setData] = useState<SegmentMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics<SegmentMetrics>('segments', { dimension })
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [dimension]);

    return { data, loading };
}

export function useSocialProof() {
    const [data, setData] = useState<SocialProofMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/metrics/social-proof')
            .then(r => r.json() as Promise<SocialProofMetrics>)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return { data, loading };
}
