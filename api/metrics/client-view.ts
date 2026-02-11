import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

type PartnerType = 'psychometric_prep' | 'bagrut_improvement' | 'university_registration' | 'pre_academic_mechina' | 'scholarship' | 'general_counseling';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Auth via demo token
    const token = req.query.token as string;
    const validTokens = (process.env.CLIENT_DEMO_TOKENS || 'demo').split(',');
    if (!validTokens.includes(token)) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    const partnerType = (req.query.type as PartnerType) || 'university_registration';

    try {
        // Fetch profiles with routing tags matching this partner type
        const { data: profiles } = await supabase
            .from('user_profiles')
            .select('bagrut_avg_raw, psycho_score_total, psycho_score_quant, lead_score, temperature, location_city, major_subjects, institution_pref, gap_analysis, lead_routing_tags, age_range, gender, journey_stage, tracked_programs')
            .contains('lead_routing_tags', [partnerType]);

        const matched = profiles || [];
        const total = matched.length;

        // Lead breakdown by temperature
        const hot = matched.filter(p => p.temperature === 'hot').length;
        const warm = matched.filter(p => p.temperature === 'warm').length;
        const cold = matched.filter(p => p.temperature === 'cold').length;

        // Academic averages
        const withBagrut = matched.filter(p => p.bagrut_avg_raw && p.bagrut_avg_raw > 0);
        const avgBagrut = withBagrut.length > 0
            ? Math.round(withBagrut.reduce((s, p) => s + p.bagrut_avg_raw, 0) / withBagrut.length * 10) / 10
            : 0;

        const withPsycho = matched.filter(p => p.psycho_score_total && p.psycho_score_total > 0);
        const avgPsychometric = withPsycho.length > 0
            ? Math.round(withPsycho.reduce((s, p) => s + p.psycho_score_total, 0) / withPsycho.length)
            : 0;

        // Top fields of interest
        const fieldCounts: Record<string, number> = {};
        for (const p of matched) {
            for (const field of (p.major_subjects || [])) {
                fieldCounts[field] = (fieldCounts[field] || 0) + 1;
            }
        }
        const topFields = Object.entries(fieldCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([field, count]) => ({ field, count }));

        // Geographic distribution
        const cityCounts: Record<string, number> = {};
        for (const p of matched) {
            if (p.location_city) {
                cityCounts[p.location_city] = (cityCounts[p.location_city] || 0) + 1;
            }
        }
        const geographic = Object.entries(cityCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([city, count]) => ({ city, count }));

        // Journey stage breakdown
        const journeyCounts: Record<string, number> = {};
        for (const p of matched) {
            const stage = p.journey_stage || 'anonymous';
            journeyCounts[stage] = (journeyCounts[stage] || 0) + 1;
        }

        // Intent signals
        const activelyComparing = matched.filter(p => p.journey_stage === 'comparing' || p.journey_stage === 'deciding').length;
        const trackedPrograms = matched.filter(p => (p.tracked_programs?.length || 0) > 0).length;

        // Sample anonymized profiles (top 5 by lead score)
        const sampleProfiles = matched
            .sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0))
            .slice(0, 5)
            .map((p, i) => ({
                id: `lead_${i + 1}`,
                bagrut_avg: p.bagrut_avg_raw ? Math.round(p.bagrut_avg_raw * 10) / 10 : null,
                psychometric: p.psycho_score_total || null,
                temperature: p.temperature || 'cold',
                fields: (p.major_subjects || []).slice(0, 3),
                journey_stage: p.journey_stage || 'anonymous',
                city: p.location_city || null,
            }));

        return res.status(200).json({
            partner_type: partnerType,
            total_relevant_leads: total,
            lead_breakdown: { hot, warm, cold },
            academic_profile: {
                avg_bagrut: avgBagrut,
                avg_psychometric: avgPsychometric,
                top_fields: topFields,
            },
            intent_signals: {
                actively_comparing: activelyComparing,
                tracked_programs: trackedPrograms,
            },
            journey_stages: journeyCounts,
            geographic,
            sample_profiles: sampleProfiles,
        });
    } catch (error: any) {
        console.error('Client view error:', error);
        return res.status(500).json({ error: error.message });
    }
}
