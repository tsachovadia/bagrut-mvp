import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (err: any) {
        console.error('Partner billing API error:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
}

/**
 * GET — List billing records for a partner
 * Query param: partner_id (required)
 */
async function handleGet(req: VercelRequest, res: VercelResponse) {
    const partner_id = req.query.partner_id as string;

    if (!partner_id) {
        return res.status(400).json({ error: 'partner_id query param is required' });
    }

    const { data, error } = await supabase
        .from('partner_billing')
        .select('*')
        .eq('partner_id', partner_id)
        .order('period_start', { ascending: false });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ billing: data });
}

/**
 * POST — Generate an invoice for a billing period
 * Body: { partner_id, period_start, period_end }
 */
async function handlePost(req: VercelRequest, res: VercelResponse) {
    const { partner_id, period_start, period_end } = req.body;

    if (!partner_id || !period_start || !period_end) {
        return res.status(400).json({ error: 'partner_id, period_start, and period_end are required' });
    }

    // Fetch partner to get price_per_lead and routing tags
    const { data: partner, error: partnerErr } = await supabase
        .from('partners')
        .select('price_per_lead, assigned_routing_tags')
        .eq('id', partner_id)
        .single();

    if (partnerErr || !partner) {
        return res.status(404).json({ error: 'Partner not found' });
    }

    // Count leads in period that match partner routing tags
    let leads_count = 0;
    if (partner.assigned_routing_tags && partner.assigned_routing_tags.length > 0) {
        const { count } = await supabase
            .from('user_profiles')
            .select('id', { count: 'exact', head: true })
            .overlaps('lead_routing_tags', partner.assigned_routing_tags)
            .gte('created_at', period_start)
            .lte('created_at', period_end);

        leads_count = count || 0;
    }

    const amount = leads_count * (Number(partner.price_per_lead) || 0);

    const { data, error } = await supabase
        .from('partner_billing')
        .insert({
            partner_id,
            period_start,
            period_end,
            leads_count,
            amount,
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ billing: data });
}

/**
 * PATCH — Update a billing record (e.g., mark as paid)
 * Body: { id, status?, paid_at?, notes? }
 */
async function handlePatch(req: VercelRequest, res: VercelResponse) {
    const { id, ...fields } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'id is required' });
    }

    // Only allow specific fields to be updated
    const allowedFields: Record<string, any> = {};
    if (fields.status !== undefined) allowedFields.status = fields.status;
    if (fields.paid_at !== undefined) allowedFields.paid_at = fields.paid_at;
    if (fields.notes !== undefined) allowedFields.notes = fields.notes;

    const { data, error } = await supabase
        .from('partner_billing')
        .update(allowedFields)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ billing: data });
}
