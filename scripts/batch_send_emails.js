import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const resendApiKey = process.env.RESEND_API_KEY;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!resendApiKey || !supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables (RESEND_API_KEY, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
    process.exit(1);
}

const resend = new Resend(resendApiKey);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const leadsToEmail = [
    {
        id: 'ad25a197-903c-4776-9e82-2c43f99d9bde',
        name: 'צח',
        email: 'tsach.ovadia@post.runi.ac.il',
        month: 'מרץ',
        painPoint: 'להתלבט בין הנדסת חשמל למדעי המחשב'
    },
    {
        id: '6427b81b-3c80-4364-904a-82915c289f1b',
        name: 'יפה',
        email: 'Rivka11simantov@gmail.com',
        month: 'דצמבר',
        painPoint: 'למצוא כיוון בלימודים'
    },
    {
        id: 'b0dae9f0-d54c-48f4-88f0-15f5c322b833',
        name: 'אווה',
        email: 'Evafisherman12@gmail.com',
        month: 'דצמבר',
        painPoint: 'לקבל החלטה לגבי הלימודים'
    },
    {
        id: 'e7db299f-9cb2-4ee3-9de2-75db18c6cfb4',
        name: 'יאיר',
        email: 'Yair.hers1@gmail.com',
        month: 'דצמבר',
        painPoint: 'להבין מה נכון לך ללמוד'
    },
    {
        id: 'eb2140d5-4fb6-42c1-bee5-e599da3a8d34',
        name: 'תמי',
        email: 'faten3434@icloud.com',
        month: 'דצמבר',
        painPoint: 'להתקדם בתהליך ההרשמה'
    },
    {
        id: 'a170ec2c-eaa1-4468-ad70-1e6821442119',
        name: 'ליאור',
        email: 'liort1001@gmail.com',
        month: 'דצמבר',
        painPoint: 'למצוא את המסלול המתאים'
    },
    {
        id: '57c582e1-1732-452a-83ba-1887ac29be19',
        name: 'ליה',
        email: 'liyakayli@gmail.com',
        month: 'דצמבר',
        painPoint: 'להתייעץ לגבי הלימודים'
    },
    {
        id: 'ffc69a0f-c34d-4423-b21d-403ad52b6b3f',
        name: 'וואסם',
        email: 'Sharkawiwasem00@gmail.com',
        month: 'דצמבר',
        painPoint: 'לקבל הכוונה אקדמית'
    },
    {
        id: 'cfe34ebb-315f-4d77-9294-b93e839795b6',
        name: 'אופק',
        email: 'ofekhugi@gmail.com',
        month: 'דצמבר',
        painPoint: 'לבחור את התואר הנכון'
    },
    {
        id: 'cc9487d3-d380-4eaf-bf5e-11ab4a76a2f9',
        name: 'ליהי',
        email: 'lihi2308@gmail.com',
        month: 'דצמבר',
        painPoint: 'למצוא פתרון לדילמה שלך'
    }
];

async function sendBatch() {
    console.log(`Starting batch email campaign for ${leadsToEmail.length} leads...`);

    for (const lead of leadsToEmail) {
        const subject = `היי ${lead.name}, בקשר להתעניינותך בלימודים`;
        const html = `
            <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <p>היי ${lead.name} - מה קורה ?</p>
                <p>אני צח המנהל של הקבוצה מתלבטים בלימודים- ראיתי שהצטרפת לקבוצה ב${lead.month} האחרון ורצית ${lead.painPoint} , אני אשמח לשמוע אם הסתדרת בסוף?</p>
                <p>ובנוסף אם היית רוצה לשמוע על מוצר חינמי שאני מפתח שעוזר לאנשים בדרכם האקדמית</p>
                <br>
                <p>בברכה,<br>צח עובדיה</p>
            </div>
        `;

        console.log(`Sending to ${lead.name} (${lead.email})...`);

        try {
            const { data, error } = await resend.emails.send({
                from: 'Bagrut Team <info@mitlabtim.co.il>',
                to: [lead.email],
                subject: subject,
                html: html
            });

            if (error) {
                console.error(`FAILED to send to ${lead.name}:`, error);
                continue;
            }

            console.log(`SUCCESS! Email sent to ${lead.name}. ID: ${data.id}`);

            // Log to Supabase
            const { error: dbError } = await supabase
                .from('email_logs')
                .insert({
                    lead_id: lead.id,
                    resend_email_id: data.id,
                    status: 'sent',
                    subject: subject,
                    recipient_email: lead.email,
                    body: html
                });

            if (dbError) {
                console.error(`Supabase logging error for ${lead.name}:`, dbError);
            } else {
                console.log(`Logged to Supabase for ${lead.name}`);
            }

        } catch (err) {
            console.error(`Unexpected error for ${lead.name}:`, err);
        }

        // Small delay to prevent hitting rate limits (though Resend is generous)
        await new Promise(r => setTimeout(r, 500));
    }

    console.log('Batch campaign completed.');
}

sendBatch();
