import { Link } from 'react-router-dom';

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 mt-auto py-2">
            <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                <p>© 2025 מתלבטים בלימודים. נבנה לתלמידים, על ידי סטודנטים.</p>
                <Link
                    to="/terms"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-gray-400 hover:text-blue-500 underline decoration-gray-300 underline-offset-4 transition-colors text-xs"
                >
                    תנאי שימוש
                </Link>
            </div>
        </footer>
    );
}
