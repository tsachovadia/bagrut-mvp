import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

type MetricType = 'new_users' | 'bot_messages' | 'soft_leads' | 'bot_users';

const TABLE_MAP: Record<MetricType, string> = {
    new_users: 'user_profiles',
    bot_messages: 'bot_messages_log',
    soft_leads: 'soft_leads',
    bot_users: 'bot_users',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.ADMIN_API_TOKEN}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const metric = (req.query.metric as MetricType) || 'new_users';
    const days = parseInt(req.query.days as string) || 30;

    const table = TABLE_MAP[metric];
    if (!table) {
        return res.status(400).json({ error: `Invalid metric: ${metric}` });
    }

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    try {
        const { data, error } = await supabase
            .from(table)
            .select('created_at')
            .gte('created_at', startDate)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Group by date
        const grouped: Record<string, number> = {};

        // Initialize all dates in range
        for (let i = 0; i < days; i++) {
            const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
            const key = date.toISOString().split('T')[0];
            grouped[key] = 0;
        }

        // Count entries per date
        for (const row of data || []) {
            const date = new Date(row.created_at).toISOString().split('T')[0];
            if (grouped[date] !== undefined) {
                grouped[date]++;
            }
        }

        const series = Object.entries(grouped).map(([date, value]) => ({ date, value }));

        return res.status(200).json({ metric, days, data: series });
    } catch (error: any) {
        console.error('Timeseries error:', error);
        return res.status(500).json({ error: error.message });
    }
}
