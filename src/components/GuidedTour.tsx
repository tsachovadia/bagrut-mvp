import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface GuidedTourProps {
    startTrigger: boolean;
    onEnd: () => void;
}

export function GuidedTour({ startTrigger, onEnd }: GuidedTourProps) {
    useEffect(() => {
        if (!startTrigger) return;

        const tourDriver = driver({
            showProgress: true,
            animate: true,
            allowClose: false,
            doneBtnText: 'סיימנו, בוא נתחיל!',
            nextBtnText: 'הבא →',
            prevBtnText: '← הקודם',
            steps: [
                {
                    element: '#hero-section',
                    popover: {
                        title: 'ברוכים הבאים למחשבון הבגרויות! 🎓',
                        description: 'כאן תוכלו לחשב את ממוצע הבגרות שלכם ולראות לאילו תארים אתם יכולים להתקבל.',
                        side: 'bottom',
                        align: 'start'
                    }
                },
                {
                    element: '#grade-input-section',
                    popover: {
                        title: 'הזנת ציונים 📝',
                        description: 'זה הלב של המערכת. הזינו כאן את הציונים שלכם. אפשר להשתמש בציוני אמת או בסימולציה.',
                        side: 'top',
                        align: 'start'
                    }
                },
                {
                    element: '#major-selection-section',
                    popover: {
                        title: 'בחירת מקצועות 🎯',
                        description: 'ספרו לנו מה מעניין אתכם ללמוד, ואנחנו נבדוק את סיכויי הקבלה שלכם.',
                        side: 'top',
                        align: 'start'
                    }
                },
            ],
            onDestroyed: () => {
                onEnd();
            }
        });

        tourDriver.drive();

        return () => {
            tourDriver.destroy();
        };
    }, [startTrigger, onEnd]);

    return null; // Logic only component
}
