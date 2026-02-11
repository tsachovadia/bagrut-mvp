import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = req.query.token as string;
    if (!token) {
        return res.status(400).json({ error: 'Missing token' });
    }

    // Token format: "partner_type:secret" or just validate against known tokens
    const validTokens: Record<string, { partner_type: string; partner_name: string }> = {
        demo: { partner_type: 'university_registration', partner_name: 'Demo Partner' },
        psycho_demo: { partner_type: 'psychometric_prep', partner_name: 'Demo - Psychometric Prep' },
        bagrut_demo: { partner_type: 'bagrut_improvement', partner_name: 'Demo - Bagrut Improvement' },
    };

    // Also check env variable for real partner tokens
    const envTokens = process.env.CLIENT_PORTAL_TOKENS;
    if (envTokens) {
        try {
            const parsed = JSON.parse(envTokens) as Record<string, { partner_type: string; partner_name: string }>;
            Object.assign(validTokens, parsed);
        } catch {
            // Ignore parse errors
        }
    }

    const match = validTokens[token];
    if (!match) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    return res.status(200).json({
        valid: true,
        partner_type: match.partner_type,
        partner_name: match.partner_name,
    });
}
