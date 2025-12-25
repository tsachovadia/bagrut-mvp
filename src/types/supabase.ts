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
