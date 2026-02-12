import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!
);

const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'MitlabtimBot';

/**
 * POST /api/generate-bot-link
 * Generates a short-lived token for linking a web account to a Telegram bot user.
 * Requires authenticated Supabase session (JWT in Authorization header).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify authenticated user from Supabase JWT
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing authorization header' });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Generate a random token
    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store in bot_link_tokens
    const { error: insertError } = await supabase
        .from('bot_link_tokens')
        .insert({
            token,
            web_user_id: user.id,
            expires_at: expiresAt.toISOString(),
            used: false,
        });

    if (insertError) {
        console.error('Error creating bot link token:', insertError);
        return res.status(500).json({ error: 'Failed to generate link' });
    }

    const url = `https://t.me/${BOT_USERNAME}?start=link_${token}`;

    return res.status(200).json({ url, expiresIn: 900 });
}
