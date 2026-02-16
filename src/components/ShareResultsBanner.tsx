import { useState } from 'react';
import { X, Share2, Check } from 'lucide-react';
import { trackEvent } from '../utils/gtm';
import { trackFbEvent } from '../utils/fb-pixel';

interface ShareResultsBannerProps {
    eligibleCount: number;
    bagrutAverage: number;
}

export function ShareResultsBanner({ eligibleCount, bagrutAverage }: ShareResultsBannerProps) {
    const [dismissed, setDismissed] = useState(false);
    const [copied, setCopied] = useState(false);

    if (dismissed || eligibleCount <= 0) return null;

    const shareUrl = 'https://mitlabtim.co.il';
    const whatsappUrl = `${shareUrl}?utm_source=share&utm_medium=whatsapp`;
    const copyUrl = `${shareUrl}?utm_source=share&utm_medium=copy_link`;

    const whatsappMessage = `חישבתי את הסיכויים שלי להתקבל ללימודים — מתאים ל-${eligibleCount} תוכניות! 🎓\nבדקו גם: ${whatsappUrl}`;

    const handleWhatsApp = () => {
        trackEvent('results_shared', { method: 'whatsapp', eligible_count: eligibleCount, bagrut_avg: bagrutAverage });
        trackFbEvent('Share', { method: 'whatsapp' });
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
    };

    const handleCopy = async () => {
        trackEvent('results_shared', { method: 'copy', eligible_count: eligibleCount, bagrut_avg: bagrutAverage });
        trackFbEvent('Share', { method: 'copy_link' });
        await navigator.clipboard.writeText(copyUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gradient-to-l from-green-50 to-emerald-50 border border-green-200/60 rounded-2xl p-4 flex items-center justify-between gap-3" dir="rtl">
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <Share2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800">
                        מתאים ל-{eligibleCount} תוכניות לימוד!
                    </p>
                    <p className="text-xs text-gray-500 truncate">שתפו עם חברים שגם מתלבטים</p>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={handleWhatsApp}
                    className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1fb855] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    WhatsApp
                </button>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs px-3 py-2 rounded-xl transition-colors border border-gray-200"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    {copied ? 'הועתק!' : 'העתק לינק'}
                </button>
                <button
                    onClick={() => setDismissed(true)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
