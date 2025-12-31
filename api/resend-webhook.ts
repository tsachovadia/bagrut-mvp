import { createClient } from '@supabase/supabase-js';
import { Webhook } from 'svix';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Note: For production, you should verify the webhook signature.
// See Resend docs: https://resend.com/docs/dashboard/webhooks/verify-webhook-signature

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(request: VercelRequest, response: VercelResponse) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error('Missing RESEND_WEBHOOK_SECRET');
        return response.status(500).json({ error: 'Server configuration error' });
    }

    const payload = request.body;
    const headers = request.headers;

    const svix_id = headers["svix-id"] as string;
    const svix_timestamp = headers["svix-timestamp"] as string;
    const svix_signature = headers["svix-signature"] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return response.status(400).json({ error: 'Missing svix headers' });
    }

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: any;

    try {
        evt = wh.verify(JSON.stringify(payload), {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        });
    } catch (err: any) {
        console.error('Webhook verification failed:', err.message);
        return response.status(400).json({ error: 'Webhook verification failed' });
    }

    const { type, data } = evt;
    // const { __event_data, email_id, created_at } = data; // Unused

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
