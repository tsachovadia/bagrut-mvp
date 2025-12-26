
interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    leadId?: string; // Optional: for tracking logs
}

export const sendEmail = async ({ to, subject, html, leadId }: SendEmailParams) => {
    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to, subject, html, leadId }),
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") === -1) {
            throw new Error("API Endpoint not found or returned HTML. Are you running 'vercel dev'?");
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || data.error || 'Failed to send email');
        }

        return data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
