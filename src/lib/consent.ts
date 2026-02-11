import { supabase } from './supabase';

export type ConsentTier = 'basic' | 'community' | 'full';

export interface ConsentState {
    tier: ConsentTier;
    data_storage: boolean;
    marketing_communications: boolean;
    partner_sharing: boolean;
    community_participation: boolean;
    given_at: string;
    source: string;
}

const CONSENT_KEY = 'mitlabtim_consent';

/**
 * Get current consent state from localStorage.
 */
export function getConsentState(): ConsentState | null {
    try {
        const stored = localStorage.getItem(CONSENT_KEY);
        return stored ? JSON.parse(stored) as ConsentState : null;
    } catch {
        return null;
    }
}

/**
 * Save consent state to localStorage and sync to Supabase if authenticated.
 */
export async function saveConsentState(state: ConsentState): Promise<void> {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));

    // Sync to Supabase if user is authenticated
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('user_profiles')
                .update({
                    consent_marketing: state.marketing_communications,
                    consent_partners: state.partner_sharing,
                    consent_given_at: state.given_at,
                    consent_source: state.source,
                })
                .eq('id', user.id);
        }
    } catch {
        // Non-critical - consent is saved locally
    }
}

/**
 * Grant basic consent (data storage for calculation).
 */
export async function grantBasicConsent(source: string = 'wizard'): Promise<ConsentState> {
    const state: ConsentState = {
        tier: 'basic',
        data_storage: true,
        marketing_communications: false,
        partner_sharing: false,
        community_participation: false,
        given_at: new Date().toISOString(),
        source,
    };
    await saveConsentState(state);
    return state;
}

/**
 * Upgrade consent to include marketing communications.
 */
export async function upgradeToCommunityCommunications(source: string = 'results_gate'): Promise<ConsentState> {
    const current = getConsentState() || await grantBasicConsent(source);
    const upgraded: ConsentState = {
        ...current,
        tier: 'community',
        marketing_communications: true,
        community_participation: true,
        given_at: new Date().toISOString(),
        source,
    };
    await saveConsentState(upgraded);
    return upgraded;
}

/**
 * Upgrade consent to full (including partner sharing).
 */
export async function upgradeToFullConsent(source: string = 'welcome_modal'): Promise<ConsentState> {
    const current = getConsentState() || await grantBasicConsent(source);
    const upgraded: ConsentState = {
        ...current,
        tier: 'full',
        marketing_communications: true,
        partner_sharing: true,
        community_participation: true,
        given_at: new Date().toISOString(),
        source,
    };
    await saveConsentState(upgraded);
    return upgraded;
}

/**
 * Check if a specific consent level has been granted.
 */
export function hasConsent(level: 'data_storage' | 'marketing_communications' | 'partner_sharing' | 'community_participation'): boolean {
    const state = getConsentState();
    if (!state) return false;
    return state[level];
}

/**
 * Check if any consent has been given (for wizard skip logic).
 */
export function hasAnyConsent(): boolean {
    return getConsentState() !== null;
}
