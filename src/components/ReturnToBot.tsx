import { useState, useEffect } from 'react';

const BOT_USERNAME = 'MitlabtimBot';
const RETURN_URL = `https://t.me/${BOT_USERNAME}?start=return`;

/**
 * Floating banner that shows when user arrives from Telegram bot.
 * Detects ?from=telegram in URL or sessionStorage flag.
 * Allows user to return to the bot after finishing on the website.
 */
export function ReturnToBot() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('from') === 'telegram') {
            sessionStorage.setItem('from_telegram', '1');
            // Clean URL without reload
            params.delete('from');
            const cleanUrl = params.toString()
                ? `${window.location.pathname}?${params.toString()}`
                : window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);
        }

        if (sessionStorage.getItem('from_telegram') === '1') {
            setVisible(true);
        }
    }, []);

    if (!visible) return null;

    return (
        <a
            href={RETURN_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
                sessionStorage.removeItem('from_telegram');
                setVisible(false);
            }}
            className="fixed bottom-20 md:bottom-6 left-4 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-full shadow-lg transition-all hover:scale-105 text-sm font-medium"
        >
            <span className="text-lg">💬</span>
            <span>חזור לבוט</span>
        </a>
    );
}
