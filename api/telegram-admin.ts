import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';


const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

async function sendTelegramMessage(chatId: string, text: string) {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    return res.json();
}

/**
 * Admin API for Telegram bot management
 * Actions: broadcast, get_stats, get_users
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Auth: check for admin token or service role
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { action } = req.body;

    switch (action) {
        case 'broadcast':
            return handleBroadcast(req, res);
        case 'get_stats':
            return handleGetStats(req, res);
        case 'get_users':
            return handleGetUsers(req, res);
        default:
            return res.status(400).json({ error: 'Unknown action' });
    }
}

async function handleBroadcast(req: VercelRequest, res: VercelResponse) {
    const { message, segment } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Build query based on segment filters
    let query = supabase.from('bot_users').select('telegram_chat_id, first_name, id').eq('is_blocked', false);

    if (segment?.lead_stage) query = query.eq('lead_stage', segment.lead_stage);
    if (segment?.sector) query = query.eq('sector', segment.sector);
    if (segment?.drip_stage) query = query.eq('drip_stage', segment.drip_stage);
    if (segment?.has_grades) query = query.not('grades', 'eq', '[]');

    const { data: users, error } = await query;

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    let sent = 0;
    let failed = 0;

    for (const user of users || []) {
        try {
            // Personalize message
            const personalizedMsg = message.replace(/\{first_name\}/g, user.first_name || '');
            await sendTelegramMessage(user.telegram_chat_id, personalizedMsg);

            // Log broadcast
            await supabase.from('bot_messages_log').insert({
                bot_user_id: user.id,
                direction: 'outgoing',
                message_type: 'broadcast',
                content: personalizedMsg.substring(0, 200),
                campaign_id: `broadcast_${Date.now()}`,
            });

            sent++;
        } catch {
            failed++;
        }

        // Rate limiting
        if (sent % 25 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1100));
        }
    }

    return res.status(200).json({ ok: true, sent, failed, total: (users || []).length });
}

async function handleGetStats(_req: VercelRequest, res: VercelResponse) {
    // Total users
    const { count: totalUsers } = await supabase
        .from('bot_users')
        .select('id', { count: 'exact', head: true });

    // Active last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: activeUsers } = await supabase
        .from('bot_users')
        .select('id', { count: 'exact', head: true })
        .gte('last_active_at', weekAgo);

    // By lead stage
    const { data: stageBreakdown } = await supabase
        .from('bot_users')
        .select('lead_stage')
        .eq('is_blocked', false);

    const stages: Record<string, number> = {};
    for (const u of stageBreakdown || []) {
        stages[u.lead_stage] = (stages[u.lead_stage] || 0) + 1;
    }

    // Messages today
    const today = new Date().toISOString().split('T')[0];
    const { count: messagesToday } = await supabase
        .from('bot_messages_log')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today);

    // High intent leads
    const { count: highIntent } = await supabase
        .from('bot_users')
        .select('id', { count: 'exact', head: true })
        .eq('lead_stage', 'high_intent')
        .eq('is_blocked', false);

    return res.status(200).json({
        totalUsers: totalUsers || 0,
        activeUsers7d: activeUsers || 0,
        highIntentLeads: highIntent || 0,
        messagesToday: messagesToday || 0,
        stageBreakdown: stages,
    });
}

async function handleGetUsers(req: VercelRequest, res: VercelResponse) {
    const { limit = 50, offset = 0, lead_stage, sector } = req.body;

    let query = supabase
        .from('bot_users')
        .select('*')
        .order('last_active_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (lead_stage) query = query.eq('lead_stage', lead_stage);
    if (sector) query = query.eq('sector', sector);

    const { data, error, count } = await query;

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ users: data, total: count });
}
