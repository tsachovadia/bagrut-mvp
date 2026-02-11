import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Cache: store result for 1 hour
let cachedResult: any = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Public endpoint - no auth required
    // Return cached if fresh
    if (cachedResult && Date.now() - cacheTime < CACHE_TTL) {
        res.setHeader('Cache-Control', 'public, s-maxage=3600');
        return res.status(200).json(cachedResult);
    }

    try {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const [
            totalWebRes,
            totalBotRes,
            recentCalcsRes,
            communityRes,
        ] = await Promise.all([
            supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
            supabase.from('bot_users').select('id', { count: 'exact', head: true }),
            supabase.from('user_profiles').select('id', { count: 'exact', head: true }).gte('app_last_active', weekAgo),
            supabase.from('bot_users').select('id', { count: 'exact', head: true }).not('rooms_joined', 'eq', '{}'),
        ]);

        cachedResult = {
            total_users: (totalWebRes.count || 0) + (totalBotRes.count || 0),
            calculations_this_week: recentCalcsRes.count || 0,
            community_members: communityRes.count || 0,
        };
        cacheTime = Date.now();

        res.setHeader('Cache-Control', 'public, s-maxage=3600');
        return res.status(200).json(cachedResult);
    } catch (error: any) {
        console.error('Social proof error:', error);
        return res.status(500).json({ error: error.message });
    }
}
