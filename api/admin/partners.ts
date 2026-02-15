import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function authorize(req: VercelRequest): boolean {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const validToken =
        process.env.ADMIN_API_TOKEN ||
        process.env.VITE_ADMIN_API_TOKEN ||
        process.env.ADMIN_API_SECRET ||
        process.env.SUPABASE_SERVICE_ROLE_KEY;
    return !!token && token === validToken;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (!authorize(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        switch (req.method) {
            case 'GET':
                return handleGet(req, res);
            case 'POST':
                return handlePost(req, res);
            case 'PATCH':
                return handlePatch(req, res);
            case 'DELETE':
                return handleDelete(req, res);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (err: any) {
        console.error('Partners API error:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
}

/**
 * GET — List partners with billing aggregates
 */
async function handleGet(_req: VercelRequest, res: VercelResponse) {
    // Fetch all partners
    const { data: partners, error: partnersErr } = await supabase
        .from('partners')
        .select('*')
        .order('status', { ascending: true })
        .order('name', { ascending: true });

    if (partnersErr) {
        return res.status(500).json({ error: partnersErr.message });
    }

    // For each partner, compute billing totals and leads count
    const enriched = await Promise.all(
        (partners || []).map(async (partner) => {
            // Total billed amount from partner_billing
            const { data: billingRows } = await supabase
                .from('partner_billing')
                .select('amount')
                .eq('partner_id', partner.id);

            const total_billed = (billingRows || []).reduce(
                (sum: number, row: any) => sum + (Number(row.amount) || 0),
                0
            );

            // Leads this month: count from user_profiles where lead_routing_tags overlaps partner tags
            let leads_this_month = 0;
            if (partner.assigned_routing_tags && partner.assigned_routing_tags.length > 0) {
                const monthStart = new Date();
                monthStart.setDate(1);
                monthStart.setHours(0, 0, 0, 0);

                const { count } = await supabase
                    .from('user_profiles')
                    .select('id', { count: 'exact', head: true })
                    .overlaps('lead_routing_tags', partner.assigned_routing_tags)
                    .gte('created_at', monthStart.toISOString());

                leads_this_month = count || 0;
            }

            return { ...partner, total_billed, leads_this_month };
        })
    );

    return res.status(200).json({ partners: enriched });
}

/**
 * POST — Create a new partner
 */
async function handlePost(req: VercelRequest, res: VercelResponse) {
    const {
        name,
        contact_name,
        email,
        phone,
        website,
        category,
        tier,
        monthly_budget,
        price_per_lead,
        portal_type,
        assigned_routing_tags,
        billing_email,
        contract_start,
        contract_end,
        notes,
        status,
    } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'name is required' });
    }

    const portal_token = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

    const { data, error } = await supabase
        .from('partners')
        .insert({
            name,
            contact_name: contact_name || null,
            email: email || null,
            phone: phone || null,
            website: website || null,
            category: category || null,
            tier: tier || 'basic',
            monthly_budget: monthly_budget ?? null,
            price_per_lead: price_per_lead ?? null,
            portal_type: portal_type || null,
            portal_token,
            assigned_routing_tags: assigned_routing_tags || [],
            billing_email: billing_email || null,
            contract_start: contract_start || null,
            contract_end: contract_end || null,
            notes: notes || null,
            status: status || 'potential',
        })
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ partner: data });
}

/**
 * PATCH — Update a partner
 */
async function handlePatch(req: VercelRequest, res: VercelResponse) {
    const { id, ...fields } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'id is required' });
    }

    const { data, error } = await supabase
        .from('partners')
        .update(fields)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ partner: data });
}

/**
 * DELETE — Remove a partner
 */
async function handleDelete(req: VercelRequest, res: VercelResponse) {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'id is required' });
    }

    const { error } = await supabase.from('partners').delete().eq('id', id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
}
