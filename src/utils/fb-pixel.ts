declare global {
    interface Window {
        fbq: (...args: any[]) => void;
    }
}

/** Fire a Facebook Pixel standard or custom event. Safe to call even if pixel isn't loaded. */
export function trackFbEvent(eventName: string, params?: Record<string, any>): void {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', eventName, params);
    }
}
