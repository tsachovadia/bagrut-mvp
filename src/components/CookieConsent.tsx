import { useState, useEffect } from 'react';
import { Button } from './ui/shim';

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 shadow-lg z-[60] animate-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right" dir="rtl">
                <p className="text-gray-600 text-sm">
                    אנו משתמשים בעוגיות כדי לשפר את החוויה שלך באתר. המשך השימוש באתר מהווה הסכמה לשימוש בעוגיות.
                </p>
                <div className="flex gap-3">
                    <Button onClick={handleAccept} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30">
                        הבנתי, תודה
                    </Button>
                </div>
            </div>
        </div>
    );
}
