import { useState, useEffect } from 'react';

export function useFirstVisit() {
    const [isFirstVisit, setIsFirstVisit] = useState(false);

    useEffect(() => {
        const hasVisited = localStorage.getItem('lead_captured');
        if (!hasVisited) {
            setIsFirstVisit(true);
        }
    }, []);

    return isFirstVisit;
}
