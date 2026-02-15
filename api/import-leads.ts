import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { findMatchByPhone, findMatchByEmail, linkProfiles } from './lib/profile-linking.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface LeadRow {
    name?: string;
    email?: string;
    phone?: string;
    interests?: string[];
    source_group?: string;
    raw?: Record<string, unknown>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Admin auth
    const authHeader = req.headers.authorization;
    const adminToken = process.env.ADMIN_API_TOKEN;
    if (!adminToken || authHeader !== `Bearer ${adminToken}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { leads, batch_id, source } = req.body as {
        leads: LeadRow[];
        batch_id?: string;
        source?: string;
    };

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
        return res.status(400).json({ error: 'Missing or empty leads array' });
    }

    if (leads.length > 500) {
        return res.status(400).json({ error: 'Max 500 leads per batch' });
    }

    const batchId = batch_id || `import_${Date.now()}`;
    const results = { imported: 0, skipped: 0, linked: 0, errors: 0 };

    for (const lead of leads) {
        try {
            // Skip completely empty rows
            if (!lead.name && !lead.email && !lead.phone) {
                results.skipped++;
                continue;
            }

            // Dedup check — skip if email already exists
            if (lead.email) {
                const { data: existing } = await supabase
                    .from('facebook_leads')
                    .select('id')
                    .eq('email', lead.email.toLowerCase().trim())
                    .limit(1)
                    .single();
                if (existing) {
                    results.skipped++;
                    continue;
                }
            }

            // Dedup by FB user ID (stored in raw_data)
            const fbUserId = (lead.raw as Record<string, unknown> | undefined)?.fb_user_id as string | undefined;
            if (fbUserId) {
                const { data: existing } = await supabase
                    .from('facebook_leads')
                    .select('id')
                    .contains('raw_data', { fb_user_id: fbUserId })
                    .limit(1)
                    .single();
                if (existing) {
                    results.skipped++;
                    continue;
                }
            }

            // Insert lead
            const { data: inserted, error: insertError } = await supabase
                .from('facebook_leads')
                .insert({
                    fb_name: lead.name || null,
                    email: lead.email?.toLowerCase().trim() || null,
                    phone: lead.phone || null,
                    interests: lead.interests || [],
                    source_group: lead.source_group || source || 'facebook_group',
                    import_batch: batchId,
                    raw_data: lead.raw || null,
                })
                .select('id')
                .single();

            if (insertError) {
                console.error('Insert error:', insertError);
                results.errors++;
                continue;
            }

            results.imported++;

            // Try to auto-link to existing profile
            if (inserted) {
                let canonicalId: string | null = null;

                if (lead.phone) {
                    canonicalId = await findMatchByPhone(lead.phone);
                }
                if (!canonicalId && lead.email) {
                    canonicalId = await findMatchByEmail(lead.email);
                }

                if (canonicalId) {
                    await linkProfiles(canonicalId, 'facebook_lead', inserted.id, 0.7, 'grouplead_import');
                    await supabase
                        .from('facebook_leads')
                        .update({ user_profile_id: canonicalId })
                        .eq('id', inserted.id);
                    results.linked++;
                }
            }
        } catch (err) {
            console.error('Lead processing error:', err);
            results.errors++;
        }
    }

    return res.status(200).json({
        batch_id: batchId,
        total: leads.length,
        ...results,
    });
}
