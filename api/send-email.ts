import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { to, subject, html, leadId } = request.body;

    if (!to || !subject || !html) {
        return response.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Bagrut Team <info@mitlabtim.co.il>',
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error('Resend error:', error);
            return response.status(400).json({ error });
        }

        // Log to Supabase
        if (leadId) {
            const { error: dbError } = await supabase
                .from('email_logs')
                .insert({
                    lead_id: leadId,
                    resend_email_id: data?.id,
                    status: 'sent',
                    subject: subject,
                    recipient_email: to,
                    body: html // Save the email content
                });

            if (dbError) {
                console.error('Supabase logging error:', dbError);
                // We don't fail the request if logging fails, but we log it
            }
        }

        return response.status(200).json(data);
    } catch (error) {
        console.error('Server error:', error);
        return response.status(500).json({ error: error.message });
    }
}
