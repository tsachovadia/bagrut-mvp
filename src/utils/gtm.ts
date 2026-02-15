type GtmEvent = {
    event: string;
    [key: string]: any;
};

// Extend the window object to include the dataLayer
declare global {
    interface Window {
        dataLayer: GtmEvent[];
    }
}

export const GTM_ID = import.meta.env.VITE_GTM_ID || 'GTM-526PQ28M';

export const initializeGTM = (containerId: string = GTM_ID) => {
    if (typeof window === 'undefined') return;

    window.dataLayer = window.dataLayer || [];

    // Prevent duplicate injection
    if (document.getElementById('gtm-script')) return;

    (function (w: any, d: Document, s: string, l: string, i: string) {
        w[l] = w[l] || [];
        w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s) as HTMLScriptElement,
            dl = l != 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        j.id = 'gtm-script'; // Add ID to check for existence
        f.parentNode?.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', containerId);
};

export const trackEvent = (eventName: string, payload: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
            event: eventName,
            ...payload,
        });
    } else {
        console.warn('GTM dataLayer not found. Event:', eventName, payload);
    }
};
