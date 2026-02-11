import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { computeAndStoreGaps } from './lib/gap-analysis.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { user_id } = req.body;
    if (!user_id) {
        return res.status(400).json({ error: 'Missing user_id' });
    }

    try {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('bagrut_grades, bagrut_avg_raw, psycho_score_total, psycho_score_quant, psycho_score_eng, tracked_programs')
            .eq('id', user_id)
            .single();

        if (profileError || !profile) {
            return res.status(404).json({ error: 'User not found' });
        }

        const bagrutGrades = Array.isArray(profile.bagrut_grades) ? profile.bagrut_grades : [];
        const psychometric = {
            general: profile.psycho_score_total || 0,
            quantitative: profile.psycho_score_quant || 0,
            verbal: 0,
            english: profile.psycho_score_eng || 0,
        };
        const trackedPrograms = profile.tracked_programs || [];
        const bagrutAverage = profile.bagrut_avg_raw || 0;
        // Rough sekhem estimate for gap analysis
        const estimatedSekhem = bagrutAverage * 0.5 + (psychometric.general || 0) * 0.075;

        const results = await computeAndStoreGaps(
            user_id,
            bagrutAverage,
            bagrutGrades as any[],
            psychometric,
            estimatedSekhem,
            trackedPrograms
        );

        return res.status(200).json({ gaps: results });
    } catch (error: any) {
        console.error('Error computing gaps:', error);
        return res.status(500).json({ error: error.message });
    }
}
