import React, { useState } from 'react';
import {
    Users,
    MessageSquare,
    MessagesSquare,
    Handshake,
    Settings,
    LogOut,
    Search,
    Menu,
    X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AdminShellProps {
    children: React.ReactNode;
    title: string;
}

export const AdminShell: React.FC<AdminShellProps> = ({ children, title }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { label: 'CRM / משתמשים', icon: Users, path: '/admin/shadow', id: 'crm' },
        { label: 'פיד סיגנלים', icon: MessageSquare, path: '/admin/shadow/signals', id: 'signals' },
        { label: 'קבוצות WhatsApp', icon: MessagesSquare, path: '/admin/shadow/groups', id: 'groups' },
        { label: 'שותפים (B2B)', icon: Handshake, path: '/admin/shadow/partners', id: 'partners' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900" dir="rtl">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex w-56 flex-col bg-white border-l border-gray-200 shadow-sm fixed h-full z-10 transition-all duration-300">
                <div className="h-12 flex items-center px-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xs">S</span>
                        </div>
                        <span className="font-bold text-sm text-gray-800 tracking-tight">ShadowNet</span>
                    </div>
                </div>

                <nav className="flex-1 py-3 px-2 space-y-0.5">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/admin/shadow' && location.pathname.startsWith(item.path));
                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-2 border-t border-gray-100">
                    <button className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <LogOut className="w-4 h-4" />
                        התנתק
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:mr-56 min-h-screen transition-all duration-300">
                {/* Header */}
                <header className="h-12 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <h1 className="text-sm font-bold text-gray-800">{title}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="חיפוש..."
                                className="pl-3 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-48"
                            />
                        </div>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4">
                    {children}
                </div>
            </main>
        </div>
    );
};
