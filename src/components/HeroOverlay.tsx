import { Button } from './ui/shim';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeroOverlayProps {
    onStart: () => void;
}

export function HeroOverlay({ onStart }: HeroOverlayProps) {
    const [typedText, setTypedText] = useState('');
    const fullText = "גלו לאן אתם מתקבלים!";

    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            setTypedText(fullText.slice(0, index + 1));
            index++;
            if (index === fullText.length) clearInterval(timer);
        }, 100);
        return () => clearInterval(timer);
    }, []);

    // Expanded dummy data to fill a larger screen background
    const dummyResults = [
        { name: 'HIT', score: 107.50, status: 'accepted' },
        { name: 'אוניברסיטת חיפה', score: 104.75, status: 'accepted' },
        { name: 'אורט בראודה', score: 95.40, status: 'accepted' },
        { name: 'בן-גוריון', score: 107.10, status: 'accepted' },
        { name: 'העברית', score: 107.50, status: 'accepted' },
        { name: 'טכניון', score: 88.00, status: 'rejected' },
        { name: 'תל אביב', score: 105.00, status: 'accepted' },
        { name: 'אריאל', score: 102.00, status: 'accepted' },
        { name: 'בר אילן', score: 103.50, status: 'accepted' },
        { name: 'הפתוחה', score: 'Ptor', status: 'accepted' },
        { name: 'רופין', score: 101.20, status: 'accepted' },
        { name: 'סמי שמעון', score: 98.00, status: 'accepted' },
    ];

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-gray-50 flex items-center justify-center">

            {/* 1. Background Layer: Full Screen Blurred Results Table */}
            <div className="absolute inset-0 p-4 md:p-8 filter blur-[8px] opacity-50 select-none pointer-events-none bg-white overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
                    {/* Repeat results to ensure full coverage */}
                    {[...dummyResults, ...dummyResults, ...dummyResults].map((uni, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${uni.status === 'accepted' ? 'bg-green-400' : 'bg-red-400'}`} />
                                <span className="font-bold text-gray-700 text-lg">{uni.name}</span>
                            </div>
                            <div className="text-gray-400 font-mono text-sm">
                                ממוצע {uni.score}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Overlay Layer: Darken + Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl w-full">
                {/* Dark overlay backdrop solely for the text area to ensure readability if needed, or rely on blur */}
                <div className="absolute inset-0 bg-white/30 backdrop-blur-3xl rounded-3xl -z-10 shadow-2xl border border-white/50 transform scale-110 opacity-0 md:opacity-100" />

                <div className="py-12 md:py-20 relative">
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-gray-900 drop-shadow-sm">
                        סיכויי קבלה לכל התארים
                        <br />
                        <span className="block mt-2 text-blue-600">בלחיצה אחת</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 mb-10 font-medium max-w-2xl mx-auto leading-relaxed">
                        הפסיקו לנחש. הזינו את ציוני הבגרות והפסיכומטרי שלכם פעם אחת
                        <br className="hidden md:block" />
                        וגלו מיידית היכן אתם מתקבלים ללימודים.
                    </p>

                    <Button
                        onClick={onStart}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xl md:text-2xl font-bold py-8 px-12 rounded-full shadow-[0_10px_40px_rgba(37,99,235,0.4)] transition-all hover:scale-105 hover:shadow-[0_20px_60px_rgba(37,99,235,0.6)] border border-blue-400/20 flex items-center justify-center gap-4 mx-auto min-w-[320px]"
                    >
                        <Sparkles className="w-6 h-6 animate-pulse text-yellow-300" />
                        <span>{typedText}</span>
                        <span className="animate-pulse">|</span>
                        <ArrowLeft className="w-6 h-6 mr-1" />
                    </Button>

                    <p className="mt-6 text-sm text-gray-500 font-medium">
                        * מבוסס על נתוני אמת של המוסדות האקדמיים
                    </p>
                </div>
            </div>

        </div>
    );
}
