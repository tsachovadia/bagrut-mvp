import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_API_TOKEN || '';

export interface Partner {
    id: string;
    name: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    category: string | null;
    tier: string | null;
    monthly_budget: number | null;
    price_per_lead: number | null;
    portal_type: string | null;
    portal_token: string | null;
    assigned_routing_tags: string[];
    billing_email: string | null;
    contract_start: string | null;
    contract_end: string | null;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    // Computed aggregates
    total_billed?: number;
    leads_this_month?: number;
    outreach_count?: number;
    billing_count?: number;
}

export interface PartnerCreateData {
    name: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    website?: string;
    category?: string;
    tier?: string;
    monthly_budget?: number;
    price_per_lead?: number;
    portal_type?: string;
    assigned_routing_tags?: string[];
    billing_email?: string;
    contract_start?: string;
    contract_end?: string;
    notes?: string;
    status?: string;
}

async function apiCall<T>(
    endpoint: string,
    method: string,
    body?: Record<string, any>
): Promise<T> {
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const res = await fetch(endpoint, options);
    if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error || `API error: ${res.status}`);
    }
    return res.json() as Promise<T>;
}

export function usePartners() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPartners = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch partners directly from Supabase for faster reads
            const { data: partnersData, error: partnersErr } = await supabase
                .from('partners')
                .select('*')
                .order('status', { ascending: true })
                .order('name', { ascending: true });

            if (partnersErr) throw new Error(partnersErr.message);

            // Enrich with outreach and billing counts
            const enriched: Partner[] = await Promise.all(
                (partnersData || []).map(async (p: any) => {
                    const { count: outreach_count } = await supabase
                        .from('partner_outreach_logs')
                        .select('id', { count: 'exact', head: true })
                        .eq('partner_id', p.id);

                    const { count: billing_count } = await supabase
                        .from('partner_billing')
                        .select('id', { count: 'exact', head: true })
                        .eq('partner_id', p.id);

                    // Sum billed amounts
                    const { data: billingRows } = await supabase
                        .from('partner_billing')
                        .select('amount')
                        .eq('partner_id', p.id);

                    const total_billed = (billingRows || []).reduce(
                        (sum: number, row: any) => sum + (Number(row.amount) || 0),
                        0
                    );

                    return {
                        ...p,
                        outreach_count: outreach_count || 0,
                        billing_count: billing_count || 0,
                        total_billed,
                        leads_this_month: 0, // Computed server-side if needed
                    } as Partner;
                })
            );

            setPartners(enriched);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPartners();
    }, [fetchPartners]);

    const createPartner = useCallback(
        async (data: PartnerCreateData) => {
            const result = await apiCall<{ partner: Partner }>(
                '/api/admin/partners',
                'POST',
                data
            );
            await fetchPartners();
            return result.partner;
        },
        [fetchPartners]
    );

    const updatePartner = useCallback(
        async (id: string, data: Partial<PartnerCreateData>) => {
            const result = await apiCall<{ partner: Partner }>(
                '/api/admin/partners',
                'PATCH',
                { id, ...data }
            );
            await fetchPartners();
            return result.partner;
        },
        [fetchPartners]
    );

    const deletePartner = useCallback(
        async (id: string) => {
            await apiCall<{ ok: boolean }>('/api/admin/partners', 'DELETE', { id });
            await fetchPartners();
        },
        [fetchPartners]
    );

    return {
        partners,
        loading,
        error,
        refresh: fetchPartners,
        createPartner,
        updatePartner,
        deletePartner,
    };
}
