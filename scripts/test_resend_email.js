import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
    console.error('Missing RESEND_API_KEY in .env file');
    process.exit(1);
}

const resend = new Resend(resendApiKey);

async function testSendEmail() {
    console.log('Sending test email to Tzach Ovadia (ts23ov@gmail.com)...');

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev', // Default testing sender
            to: 'tsach.ovadia@post.runi.ac.il', // Verified user
            subject: 'Test Email from Debug Script',
            html: '<p>This is a test to verify Resend functionality for Tzach Ovadia.</p>'
        });

        if (error) {
            console.error('FAILED to send email:', error);
        } else {
            console.log('SUCCESS! Email sent.', data);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testSendEmail();
