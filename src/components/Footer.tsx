import { Link } from 'react-router-dom';

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 mt-auto py-2">
            <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                <p>© 2025 מתלבטים בלימודים. נבנה לתלמידים, על ידי סטודנטים.</p>
                <div className="flex gap-4 items-center">
                    <Link
                        to="/terms"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="text-gray-400 hover:text-blue-500 underline decoration-gray-300 underline-offset-4 transition-colors text-xs"
                    >
                        תנאי שימוש
                    </Link>
                    <button
                        onClick={() => {
                            localStorage.removeItem('lead_captured');
                            localStorage.removeItem('has_seen_welcome_v2');
                            window.location.reload();
                        }}
                        className="text-xs text-red-300 hover:text-red-500 transition-colors opacity-50 hover:opacity-100"
                        title="Debug: Reset Welcome Flow"
                    >
                        [אפס משתמש]
                    </button>
                </div>
            </div>
        </footer>
    );
}
