import { useCallback } from 'react';



export const useAnalytics = () => {
    const trackEvent = useCallback((eventName: string, params?: Record<string, any>) => {
        if (typeof window !== 'undefined') {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: eventName,
                ...params
            });

            // Dev mode logger
            if (import.meta.env.DEV) {
                console.log(`[Analytics] ${eventName}`, params);
            }
        }
    }, []);

    return { trackEvent };
};
