import { trackEvent } from './gtm';
import { trackFbEvent } from './fb-pixel';
import { getUtmParams } from './utm';

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID || '';
const GOOGLE_ADS_CONVERSION_LABEL = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_LABEL || '';

/** Initialize Google Ads gtag.js (call once on app load). No-ops if ID is empty. */
export function initGoogleAds(): void {
    if (!GOOGLE_ADS_ID || typeof window === 'undefined') return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { (window.dataLayer as any[]).push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GOOGLE_ADS_ID);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
    document.head.appendChild(script);
}

export type ConversionEvent =
    | 'lead_submitted'
    | 'view_content'
    | 'search'
    | 'start_calculation'
    | 'complete_registration'
    | 'lead_form_open'
    | 'engagement';

interface ConversionParams {
    content_name?: string;
    content_category?: string;
    content_id?: string;
    value?: number;
    currency?: string;
    source?: string;
    [key: string]: any;
}

const FB_EVENT_MAP: Record<ConversionEvent, string | null> = {
    lead_submitted: 'Lead',
    view_content: 'ViewContent',
    search: 'Search',
    start_calculation: 'InitiateCheckout',
    complete_registration: 'CompleteRegistration',
    lead_form_open: null,
    engagement: null,
};

/**
 * Fire a conversion event to all platforms (GTM + Facebook Pixel + Google Ads).
 * Components should use this instead of calling trackEvent/trackFbEvent directly.
 */
export function trackConversion(event: ConversionEvent, params: ConversionParams = {}): void {
    const utm = getUtmParams();
    const enriched = { ...params, ...utm };

    // 1. GTM dataLayer
    trackEvent(event, enriched);

    // 2. Facebook Pixel
    const fbEvent = FB_EVENT_MAP[event];
    if (fbEvent) {
        trackFbEvent(fbEvent, {
            content_name: params.content_name,
            content_category: params.content_category,
            content_ids: params.content_id ? [params.content_id] : undefined,
            value: params.value,
            currency: params.currency || 'ILS',
        });
    }

    // 3. Google Ads conversion (only for lead_submitted)
    if (event === 'lead_submitted' && GOOGLE_ADS_ID && GOOGLE_ADS_CONVERSION_LABEL) {
        window.gtag?.('event', 'conversion', {
            send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
            value: params.value || 0,
            currency: params.currency || 'ILS',
        });
    }
}

/** Get first-touch attribution data to include in lead inserts. */
export function getAttributionData(): Record<string, string | null> {
    const utm = getUtmParams();
    return {
        ...utm,
        landing_page: sessionStorage.getItem('mitlabtim_landing_page'),
        referrer: sessionStorage.getItem('mitlabtim_referrer'),
    };
}

/** Capture first-touch attribution (call once on app load). */
export function captureAttribution(): void {
    if (typeof window === 'undefined') return;
    if (!sessionStorage.getItem('mitlabtim_landing_page')) {
        sessionStorage.setItem('mitlabtim_landing_page', window.location.pathname + window.location.search);
    }
    if (!sessionStorage.getItem('mitlabtim_referrer')) {
        sessionStorage.setItem('mitlabtim_referrer', document.referrer || 'direct');
    }
}
