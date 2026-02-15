import { Button } from './ui/shim';
import { ArrowLeft, Sparkles, MessageCircle, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LeadCaptureModal } from './LeadCaptureModal';

interface CommunityHeroProps {
    onStart: () => void;
}

export function CommunityHero({ onStart }: CommunityHeroProps) {
    const [typedText, setTypedText] = useState('');
    const fullText = "אל תתלבט לבד";
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            setTypedText(fullText.slice(0, index + 1));
            index++;
            if (index === fullText.length) clearInterval(timer);
        }, 150);
        return () => clearInterval(timer);
    }, []);

    const handleStartClick = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        onStart(); // Continue to calculator after modal closes (submitted or skipped)
    };

    // Social proof avatars (using reliable placeholders)
    const avatars = [
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Mila"
    ];

    // Background dummy data
    const dummyResults = [
        { name: 'העברית', score: 107.50, status: 'accepted' },
        { name: 'תל אביב', score: 105.00, status: 'accepted' },
        { name: 'בן-גוריון', score: 107.10, status: 'accepted' },
        { name: 'הטכניון', score: 88.00, status: 'rejected' },
        { name: 'בר אילן', score: 103.50, status: 'accepted' },
        { name: 'אוניברסיטת חיפה', score: 104.75, status: 'accepted' },
        { name: 'רופין', score: 101.20, status: 'accepted' },
        { name: 'HIT', score: 107.50, status: 'accepted' },
        { name: 'הבינתחומי', score: 108.00, status: 'accepted' },
    ];

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-gray-50 flex items-center justify-center">

            <LeadCaptureModal isOpen={isModalOpen} onClose={handleModalClose} />

            {/* 1. Background Layer: Blurred Results */}
            <div className="absolute inset-0 p-4 md:p-8 filter blur-[6px] opacity-40 select-none pointer-events-none bg-white overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
                    {[...dummyResults, ...dummyResults, ...dummyResults].map((uni, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${uni.status === 'accepted' ? 'bg-green-500' : 'bg-red-400'}`} />
                                <span className="font-bold text-gray-700">{uni.name}</span>
                            </div>
                            <div className="text-gray-400 font-mono text-sm">
                                {uni.score}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Overlay Layer */}
            <div className="relative z-10 text-center px-4 max-w-4xl w-full">
                <div className="py-10 md:py-20 relative">

                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tight text-gray-900 drop-shadow-sm leading-tight">
                        {typedText}
                        <span className="animate-pulse text-blue-600">.</span>
                        <br />
                        <span className="text-4xl md:text-6xl text-blue-600">אנחנו קהילה</span>
                    </h1>

                    {/* Subtext */}
                    <p className="text-lg md:text-2xl text-gray-600 mb-8 font-medium max-w-2xl mx-auto leading-relaxed">
                        במקום לנחש, הצטרף ל-<b>5,000+ סטודנטים</b><br className="hidden md:block" />
                        שכבר לומדים במוסדות המובילים בישראל.
                    </p>

                    {/* Social Proof */}
                    <div className="flex flex-col items-center justify-center gap-2 mb-10">
                        <div className="flex items-center -space-x-3 space-x-reverse">
                            {avatars.map((src, i) => (
                                <img key={i} src={src} alt="User" className="w-10 h-10 rounded-full border-2 border-white bg-gray-100" />
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                                +120
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 shadow-sm animate-pulse">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            120 סטודנטים מחוברים כעת
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <Button
                            onClick={handleStartClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-4 px-10 rounded-full shadow-lg shadow-blue-600/30 transition-all hover:scale-105 hover:shadow-xl w-full md:w-auto flex items-center justify-center gap-3"
                        >
                            <Sparkles className="w-5 h-5 text-yellow-300" />
                            <span>בדוק סיכויי קבלה</span>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>

                        <Button
                            onClick={() => window.open('https://t.me/MitlabtimBot', '_blank')}
                            className="bg-white/80 hover:bg-white text-gray-700 hover:text-blue-600 border-2 border-gray-200 hover:border-blue-200 text-xl font-bold py-4 px-10 rounded-full backdrop-blur-sm transition-all w-full md:w-auto flex items-center justify-center gap-3"
                        >
                            <Users className="w-5 h-5" />
                            <span>כניסה לקהילה</span>
                        </Button>
                    </div>

                    <p className="mt-8 text-sm text-gray-400 font-medium">
                        * השירות חינם וללא התחייבות
                    </p>
                </div>
            </div>

        </div>
    );
}
