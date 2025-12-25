export type LeadStatus = 'new' | 'draft_generated' | 'sent' | 'replied';

export interface Lead {
    id: string; // uuid
    facebook_user_id: string;
    full_name: string;
    profile_link?: string | null;
    age?: string | null;
    dilemma?: string | null;
    email?: string | null;
    status: LeadStatus;
    ai_draft?: string | null;
    joined_group_at?: string | null;
    city?: string | null;
    target_degree?: string | null;
    created_at: string;
    updated_at?: string;
}

export type EmailStatus = 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed';

export interface EmailLog {
    id: string; // uuid
    lead_id?: string | null;
    resend_email_id?: string | null;
    status: EmailStatus;
    subject?: string | null;
    recipient_email?: string | null;
    opened_at?: string | null;
    clicked_at?: string | null;
    created_at: string;
}
