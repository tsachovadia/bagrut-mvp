import { createClient } from '@supabase/supabase-js';

// Note: For production, you should verify the webhook signature.
// See Resend docs: https://resend.com/docs/dashboard/webhooks/verify-webhook-signature

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const payload = request.body;
    const { type, data } = payload;
    const { __event_data, email_id, created_at } = data; // event_data relies on Resend API version, check payload structure

    // Resend webhook payload structure:
    // { type: 'email.opened', created_at: '...', data: { email_id: '...', ... } }
    // Actually, structure is: { type: 'email.opened', created_at: '...', data: { created_at, email_id, to, from, subject, ... } }

    if (!type || !data?.email_id) {
        return response.status(400).json({ message: 'Invalid payload' });
    }

    const emailId = data.email_id;
    let updateData = {};

    if (type === 'email.opened') {
        updateData = {
            status: 'opened',
            opened_at: new Date().toISOString(),
            user_agent: data.user_agent,
            ip_address: data.ip_address,
            location: data.region ? `${data.city}, ${data.region}, ${data.country}` : data.country
        };
    } else if (type === 'email.clicked') {
        updateData = {
            status: 'clicked',
            clicked_at: new Date().toISOString(),
            user_agent: data.user_agent,
            ip_address: data.ip_address,
            location: data.region ? `${data.city}, ${data.region}, ${data.country}` : data.country
        };
    } else if (type === 'email.delivered') {
        updateData = { status: 'delivered' };
    } else if (type === 'email.bounced' || type === 'email.delivery_delayed') {
        updateData = { status: 'failed' };
    }

    if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
            .from('email_logs')
            .update(updateData)
            .eq('resend_email_id', emailId);

        if (error) {
            console.error('Error updating Supabase:', error);
            return response.status(500).json({ error: error.message });
        }
    }

    return response.status(200).json({ received: true });
}
