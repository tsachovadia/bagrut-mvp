import { useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * CTA component that generates a personalized Telegram bot link
 * for account linking. Shows after user has data in the web app.
 */
export function TelegramCTA() {
    const [loading, setLoading] = useState(false);
    const [botUrl, setBotUrl] = useState<string | null>(null);

    const handleConnect = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch('/api/generate-bot-link', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            const data = (await res.json()) as { url?: string; error?: string };
            if (data.url) {
                setBotUrl(data.url);
                window.open(data.url, '_blank');
            }
        } catch (err) {
            console.error('Failed to generate bot link:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-l from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mt-4">
            <div className="flex items-start gap-3">
                <div className="text-2xl shrink-0">💬</div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-sm">
                        הצטרף/י לקהילת מתלבטים בטלגרם
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                        קבל/י עדכונים אישיים, הצטרף/י לחדרי לימוד, ושתף/י עם חברים
                    </p>

                    {botUrl ? (
                        <a
                            href={botUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                            פתח בטלגרם
                        </a>
                    ) : (
                        <button
                            onClick={handleConnect}
                            disabled={loading}
                            className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                            {loading ? 'יוצר קישור...' : 'חבר חשבון טלגרם'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
