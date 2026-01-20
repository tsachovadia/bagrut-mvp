import { Button } from './ui/shim';
import { Menu, X, GraduationCap, Users, HelpCircle, TrendingUp, ShoppingBag, MessageCircle, LogOut, User, BookOpen, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { isProduction } from '../utils/env';

import { useNavigate } from 'react-router-dom';

export function Header() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) console.error('Error logging in:', error.message);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // User state updates via subscription
    };

    return (
        <header className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-sm supports-[backdrop-filter]:bg-white/60" dir="rtl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-10 items-center">

                    {/* Logo / Brand */}
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
                        <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-sm transition-all duration-300 object-cover" />
                        <span className="text-lg font-bold text-gray-900 tracking-tight">מתלבטים בלימודים</span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex flex-1 items-center justify-center space-x-1 space-x-reverse">
                        <NavItem onClick={() => navigate('/')} icon={<GraduationCap className="w-4 h-4" />} text="מחשבון בגרויות" />
                        <NavItem onClick={() => navigate('/programs')} icon={<BookOpen className="w-4 h-4" />} text="חיפוש תארים" />
                        <NavItem onClick={() => navigate('/tracking')} icon={<Heart className="w-4 h-4 text-pink-500" />} text="התארים שלי" />
                        <NavItem onClick={() => navigate('/dashboard')} icon={<TrendingUp className="w-4 h-4" />} text="הקוקפיט (סימולטור)" />
                        <NavItem onClick={() => window.open('https://chat.whatsapp.com/F3Kc5oNu2o46YNdGHxHTYm', '_blank')} icon={<Users className="w-4 h-4" />} text="קהילה בוואטסאפ" />
                        {!isProduction && (
                            <NavItem onClick={() => navigate('/admin/shadow')} icon={<Users className="w-4 h-4" />} text="CRM (Admin)" />
                        )}
                    </nav>

                    {/* Auth Button */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-700 hidden lg:inline-block">
                                    שלום, {user.user_metadata?.full_name?.split(' ')[0] || 'משתמש'}
                                </span>
                                {user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={handleLogin}
                                className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-medium"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                התחבר עם גוגל
                            </Button>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-4">
                        {user && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden">
                                {user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                        )}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-500 hover:text-gray-900 focus:outline-none p-2"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <MobileNavItem onClick={() => { navigate('/'); setIsMenuOpen(false); }} text="לאן אני מתקבל" />
                        <MobileNavItem onClick={() => { navigate('/programs'); setIsMenuOpen(false); }} text="חיפוש תארים" />
                        <MobileNavItem onClick={() => { navigate('/tracking'); setIsMenuOpen(false); }} text="התארים שלי" />
                        <MobileNavItem text="איך לשפר את הסכם" />
                        <MobileNavItem text="דעות אמיתיות של סטודנטים" />
                        <MobileNavItem onClick={() => window.open('https://chat.whatsapp.com/F3Kc5oNu2o46YNdGHxHTYm', '_blank')} text="קהילה בוואטסאפ" />

                        <div className="pt-4 px-2 border-t mt-2">
                            {user ? (
                                <Button
                                    variant="ghost"
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="h-4 w-4" />
                                    התנתק
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleLogin}
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    התחבר עם גוגל
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

function NavItem({ text, icon, onClick }: { text: string; icon?: React.ReactNode; onClick?: () => void }) {
    return (
        <a
            href="#"
            onClick={(e) => { e.preventDefault(); onClick?.(); }}
            className="group inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
        >
            {icon && <span className="ml-2 text-gray-400 group-hover:text-blue-500 transition-colors">{icon}</span>}
            {text}
        </a>
    );
}

function MobileNavItem({ text, onClick }: { text: string; onClick?: () => void }) {
    return (
        <a
            href="#"
            onClick={(e) => { e.preventDefault(); onClick?.(); }}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 text-right"
        >
            {text}
        </a>
    );
}
