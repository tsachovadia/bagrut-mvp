const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const STORAGE_KEY = 'mitlabtim_utm';

export type UtmParams = Record<typeof UTM_KEYS[number], string | null>;

/** Capture UTM params from URL and persist to sessionStorage. Call once on app load. */
export function captureUtm(): void {
    const params = new URLSearchParams(window.location.search);
    const hasUtm = UTM_KEYS.some(k => params.get(k));
    if (!hasUtm) return;

    const utm: Record<string, string | null> = {};
    for (const key of UTM_KEYS) {
        utm[key] = params.get(key);
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
}

/** Get stored UTM params (from sessionStorage, falls back to current URL). */
export function getUtmParams(): UtmParams {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
        try { return JSON.parse(stored); } catch { /* fall through */ }
    }
    // Fallback: read from current URL
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string | null> = {};
    for (const key of UTM_KEYS) {
        utm[key] = params.get(key);
    }
    return utm as UtmParams;
}
