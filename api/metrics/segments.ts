import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

type Dimension = 'lead_stage' | 'source' | 'sector' | 'temperature' | 'journey_stage' | 'drip_stage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.ADMIN_API_TOKEN}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const dimension = (req.query.dimension as Dimension) || 'lead_stage';

    try {
        let segments: { label: string; count: number }[] = [];

        switch (dimension) {
            case 'lead_stage': {
                const { data } = await supabase.from('bot_users').select('lead_stage');
                segments = countBy(data || [], 'lead_stage');
                break;
            }
            case 'source': {
                const { data } = await supabase.from('bot_users').select('source');
                segments = countBy(data || [], 'source');
                break;
            }
            case 'sector': {
                const { data } = await supabase.from('bot_users').select('sector');
                segments = countBy(data || [], 'sector');
                break;
            }
            case 'temperature': {
                const { data } = await supabase.from('user_profiles').select('temperature');
                segments = countBy(data || [], 'temperature');
                break;
            }
            case 'journey_stage': {
                const { data } = await supabase.from('user_profiles').select('journey_stage');
                segments = countBy(data || [], 'journey_stage');
                break;
            }
            case 'drip_stage': {
                const { data } = await supabase.from('bot_users').select('drip_stage');
                segments = countBy(data || [], 'drip_stage');
                break;
            }
            default:
                return res.status(400).json({ error: `Invalid dimension: ${dimension}` });
        }

        // Hebrew labels for known segments
        const hebrewLabels: Record<string, string> = {
            new: 'חדש', engaged: 'מעורב', grade_entered: 'הזין ציונים',
            simulated: 'סימולציה', high_intent: 'כוונה גבוהה',
            organic: 'אורגני', web: 'אתר', referral: 'הפניה',
            mamlachti: 'ממלכתי', mamlachti_dati: 'ממ"ד', arab: 'ערבי', druze: 'דרוזי',
            cold: 'קר', warm: 'חמים', hot: 'חם',
            anonymous: 'אנונימי', exploring: 'חוקר', comparing: 'משווה', deciding: 'מחליט', applied: 'נרשם',
            welcome: 'ברוכים הבאים', nudge_grades: 'דחיפת ציונים', partial_grades: 'ציונים חלקיים',
            nudge_psycho: 'דחיפת פסיכו', first_results: 'תוצאות ראשונות',
            track_programs: 'מעקב תוכניות', community: 'קהילה', share: 'שיתוף',
            re_engage: 'חימום מחדש', completed: 'הושלם',
        };

        segments = segments.map(s => ({
            label: hebrewLabels[s.label] || s.label || 'לא ידוע',
            count: s.count,
        }));

        return res.status(200).json({ dimension, segments });
    } catch (error: any) {
        console.error('Segments error:', error);
        return res.status(500).json({ error: error.message });
    }
}

function countBy(data: any[], field: string): { label: string; count: number }[] {
    const counts: Record<string, number> = {};
    for (const row of data) {
        const val = row[field] || 'unknown';
        counts[val] = (counts[val] || 0) + 1;
    }
    return Object.entries(counts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);
}
