import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_request: VercelRequest, response: VercelResponse) {
    // Basic auth check for cron if needed, or Vercel specific checks
    // For now, let's just make it a GET/POST that processes recently sent emails

    try {
        console.log('Starting email status sync...');

        // 1. Fetch email logs that are 'sent' or 'delivered' but NOT 'opened' or 'clicked'
        // We only check emails from the last 7 days to keep it efficient
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: pendingEmails, error: fetchError } = await supabase
            .from('email_logs')
            .select('id, resend_email_id, status, lead_id')
            .in('status', ['sent', 'delivered'])
            .gte('created_at', sevenDaysAgo.toISOString())
            .not('resend_email_id', 'is', null);

        if (fetchError) {
            console.error('Error fetching pending emails:', fetchError);
            return response.status(500).json({ error: fetchError.message });
        }

        console.log(`Found ${pendingEmails?.length || 0} emails to check.`);

        const updates = [];

        for (const email of (pendingEmails || [])) {
            try {
                // 2. Query Resend API for the current status
                const { data, error: resendError } = await resend.emails.get(email.resend_email_id!);

                if (resendError) {
                    console.error(`Resend API error for ${email.resend_email_id}:`, resendError);
                    continue;
                }

                // Resend returns last_event: 'sent' | 'delivered' | 'delivery_delayed' | 'complained' | 'bounced' | 'opened' | 'clicked'
                const newStatus = data?.last_event;

                if (newStatus && newStatus !== email.status) {
                    console.log(`Updating email ${email.id} status from ${email.status} to ${newStatus}`);

                    const updateData: any = { status: newStatus };

                    // If it was opened/clicked, record the timestamp
                    if (newStatus === 'opened') {
                        updateData.opened_at = new Date().toISOString();
                    } else if (newStatus === 'clicked') {
                        updateData.clicked_at = new Date().toISOString();
                        // Usually opened comes before clicked, but let's be safe
                        const typedEmail = email as { opened_at?: string };
                        if (!typedEmail.opened_at) updateData.opened_at = new Date().toISOString();
                    }

                    const { error: updateError } = await supabase
                        .from('email_logs')
                        .update(updateData)
                        .eq('id', email.id);

                    if (updateError) {
                        console.error(`Error updating status for ${email.id}:`, updateError);
                    } else {
                        // 4. Update the main Lead status if it's an advancement (sent -> opened -> clicked)
                        // We check if the current lead status is not already 'replied' or 'clicked' before downgrading/changing
                        const { data: lead } = await supabase.from('leads').select('status').eq('id', email.lead_id).single();

                        const statusWeights: Record<string, number> = {
                            'new': 0,
                            'draft_generated': 1,
                            'sent': 2,
                            'delivered': 3,
                            'opened': 4,
                            'clicked': 5,
                            'replied': 6
                        };

                        if (lead && statusWeights[newStatus] > (statusWeights[lead.status] || 0)) {
                            await supabase
                                .from('leads')
                                .update({ status: newStatus })
                                .eq('id', email.lead_id);
                        }

                        updates.push({ id: email.id, status: newStatus });
                    }
                }
            } catch (err) {
                console.error(`Unexpected error processing ${email.id}:`, err);
            }
        }

        return response.status(200).json({
            message: 'Status sync completed',
            updatedCount: updates.length,
            updates
        });

    } catch (error: any) {
        console.error('Server error in sync-email-status:', error);
        return response.status(500).json({ error: error.message });
    }
}
