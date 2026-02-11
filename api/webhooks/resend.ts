import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(request: VercelRequest, response: VercelResponse) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const payload = request.body;
        console.log('Received Resend Webhook:', JSON.stringify(payload, null, 2));

        // 1. Verify it's an "email received" event (a reply)
        if (payload.type === 'email.received') {
            const incoming = payload.data;
            const fromEmail = incoming.from.match(/<(.+)>/)?.[1] || incoming.from;
            const replyText = incoming.text || '';
            const inReplyTo = incoming.headers?.['In-Reply-To']?.[0];

            console.log(`Processing reply from ${fromEmail}. In-Reply-To: ${inReplyTo}`);

            // 2. Find the lead associated with this email
            // We search for the most recent email sent to this address
            const { data: recentEmail, error: findError } = await supabase
                .from('email_logs')
                .select('id, lead_id, resend_email_id')
                .eq('recipient_email', fromEmail)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (findError || !recentEmail) {
                console.warn(`Could not find a corresponding lead for email: ${fromEmail}`);
                return response.status(200).json({ status: 'ignored', reason: 'No matching lead found' });
            }

            console.log(`Matched reply to lead_id: ${recentEmail.lead_id}`);

            // 3. Update Lead Status in Supabase
            const { error: leadUpdateError } = await supabase
                .from('leads')
                .update({ status: 'replied' })
                .eq('id', recentEmail.lead_id);

            if (leadUpdateError) {
                console.error('Error updating lead status:', leadUpdateError);
            }

            // 4. Create a new log for the reply itself (as an outreach log or similar)
            // We can add it as a special type of entry in our email_logs if we want, 
            // but for now let's just update the lead and maybe log the reply content.

            // OPTIONAL: Insert the reply into email_logs or a new replies table
            // Let's at least log it in the console for now.
            const { error: replyLogError } = await supabase
                .from('email_logs')
                .insert({
                    lead_id: recentEmail.lead_id,
                    status: 'opened', // We mark it as opened since we received it
                    subject: `RE: ${incoming.subject}`,
                    recipient_email: fromEmail,
                    body: `--- REPLY RECEIVED ---\n\n${replyText}`,
                    created_at: new Date().toISOString()
                });

            if (replyLogError) {
                console.error('Error logging reply content:', replyLogError);
            }

            return response.status(200).json({ status: 'success', lead_id: recentEmail.lead_id });
        }

        // Handle other event types (opened, clicked, etc.) if desired
        // Resend also sends 'email.opened' and 'email.clicked' if configured
        if (payload.type === 'email.opened' || payload.type === 'email.clicked') {
            const emailId = payload.data.email_id;
            const newStatus = payload.type === 'email.opened' ? 'opened' : 'clicked';

            console.log(`Webook: Updating status for Resend ID ${emailId} to ${newStatus}`);

            const { error: updateError } = await supabase
                .from('email_logs')
                .update({
                    status: newStatus,
                    [newStatus === 'opened' ? 'opened_at' : 'clicked_at']: new Date().toISOString()
                })
                .eq('resend_email_id', emailId);

            if (updateError) {
                console.error('Error updating status via webhook:', updateError);
            }
        }

        return response.status(200).json({ status: 'processed' });

    } catch (error: any) {
        console.error('Webhook error:', error);
        return response.status(500).json({ error: error.message });
    }
}
