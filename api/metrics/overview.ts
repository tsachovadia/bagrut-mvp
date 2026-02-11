import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Simple admin auth via bearer token
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.ADMIN_API_TOKEN}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const period = (req.query.period as string) || '30d';
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30;
    const periodStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const prevPeriodStart = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000).toISOString();

    try {
        // Run all queries in parallel
        const [
            totalUsersRes,
            totalBotUsersRes,
            totalSoftLeadsRes,
            newUsersRes,
            prevNewUsersRes,
            activeUsersRes,
            botMessagesRes,
            prevBotMessagesRes,
            hotLeadsRes,
            prevHotLeadsRes,
            avgLeadScoreRes,
        ] = await Promise.all([
            supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
            supabase.from('bot_users').select('id', { count: 'exact', head: true }),
            supabase.from('soft_leads').select('id', { count: 'exact', head: true }),
            supabase.from('user_profiles').select('id', { count: 'exact', head: true }).gte('created_at', periodStart),
            supabase.from('user_profiles').select('id', { count: 'exact', head: true }).gte('created_at', prevPeriodStart).lt('created_at', periodStart),
            supabase.from('user_profiles').select('id', { count: 'exact', head: true }).gte('app_last_active', periodStart),
            supabase.from('bot_messages_log').select('id', { count: 'exact', head: true }).gte('created_at', periodStart),
            supabase.from('bot_messages_log').select('id', { count: 'exact', head: true }).gte('created_at', prevPeriodStart).lt('created_at', periodStart),
            supabase.from('bot_users').select('id', { count: 'exact', head: true }).gte('lead_score', 60),
            supabase.from('bot_users').select('id', { count: 'exact', head: true }).gte('lead_score', 60).lt('created_at', periodStart),
            supabase.from('bot_users').select('lead_score'),
        ]);

        const totalUsers = totalUsersRes.count || 0;
        const totalBotUsers = totalBotUsersRes.count || 0;
        const totalSoftLeads = totalSoftLeadsRes.count || 0;
        const newUsers = newUsersRes.count || 0;
        const prevNewUsers = prevNewUsersRes.count || 0;
        const activeUsers = activeUsersRes.count || 0;
        const botMessages = botMessagesRes.count || 0;
        const prevBotMessages = prevBotMessagesRes.count || 0;
        const hotLeads = hotLeadsRes.count || 0;
        const prevHotLeads = prevHotLeadsRes.count || 0;

        // Calculate average lead score
        const leadScores = avgLeadScoreRes.data || [];
        const avgLeadScore = leadScores.length > 0
            ? leadScores.reduce((sum: number, u: any) => sum + (u.lead_score || 0), 0) / leadScores.length
            : 0;

        // Calculate deltas (percentage change)
        const calcDelta = (current: number, previous: number) =>
            previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0;

        return res.status(200).json({
            total_users: totalUsers,
            total_bot_users: totalBotUsers,
            total_soft_leads: totalSoftLeads,
            new_users: newUsers,
            new_users_delta: calcDelta(newUsers, prevNewUsers),
            active_users: activeUsers,
            bot_messages: botMessages,
            bot_messages_delta: calcDelta(botMessages, prevBotMessages),
            hot_leads: hotLeads,
            hot_leads_delta: calcDelta(hotLeads, prevHotLeads),
            avg_lead_score: Math.round(avgLeadScore * 10) / 10,
            period,
        });
    } catch (error: any) {
        console.error('Metrics overview error:', error);
        return res.status(500).json({ error: error.message });
    }
}
