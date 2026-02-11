import type { VercelRequest, VercelResponse } from '@vercel/node';
import { autoLinkSoftLead } from './lib/profile-linking.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { soft_lead_id } = req.body;
    if (!soft_lead_id) {
        return res.status(400).json({ error: 'Missing soft_lead_id' });
    }

    try {
        const canonicalId = await autoLinkSoftLead(soft_lead_id);
        return res.status(200).json({
            linked: !!canonicalId,
            canonical_id: canonicalId,
        });
    } catch (error: any) {
        console.error('Error linking profile:', error);
        return res.status(500).json({ error: error.message });
    }
}
