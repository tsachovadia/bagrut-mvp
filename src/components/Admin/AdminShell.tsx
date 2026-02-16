import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface AdminShellProps {
    children: React.ReactNode;
    title: string;
}

export const AdminShell: React.FC<AdminShellProps> = ({ children, title }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searching, setSearching] = useState(false);

    const doSearch = useCallback(async (q: string) => {
        if (q.length < 2) { setSearchResults([]); return; }
        setSearching(true);
        try {
            const { data } = await supabase
                .from('unified_profiles')
                .select('canonical_id, display_name, email, telegram_username, lead_score')
                .or(`display_name.ilike.%${q}%,email.ilike.%${q}%,telegram_username.ilike.%${q}%,phone.ilike.%${q}%`)
                .limit(8);
            setSearchResults(data || []);
        } catch { setSearchResults([]); }
        setSearching(false);
    }, []);

    useEffect(() => {
        const t = setTimeout(() => doSearch(searchQuery), 300);
        return () => clearTimeout(t);
    }, [searchQuery, doSearch]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
                setTimeout(() => document.getElementById('shadownet-search')?.focus(), 50);
            }
            if (e.key === 'Escape') setSearchOpen(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900" dir="rtl">
            {/* Header */}
            <header className="h-14 bg-white/80 backdrop-blur border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
                        title="חזרה לאתר"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-[10px]">S</span>
                        </div>
                        <h1 className="text-lg font-bold text-gray-800">{title}</h1>
                    </div>
                </div>

                <div className="relative">
                    <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        id="shadownet-search"
                        type="text"
                        placeholder="חיפוש... (⌘K)"
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                        onFocus={() => setSearchOpen(true)}
                        onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                        className="pl-4 pr-9 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
                    />
                    {searchOpen && searchQuery.length >= 2 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg ring-1 ring-black/5 z-50 max-h-80 overflow-y-auto p-1">
                            {searching ? (
                                <div className="p-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-blue-600" /></div>
                            ) : searchResults.length === 0 ? (
                                <div className="p-4 text-sm text-gray-500 text-center">לא נמצאו תוצאות</div>
                            ) : (
                                searchResults.map(r => (
                                    <button
                                        key={r.canonical_id}
                                        onMouseDown={() => {
                                            setSearchQuery('');
                                            setSearchOpen(false);
                                        }}
                                        className="w-full text-right px-3 py-2.5 hover:bg-gray-50 rounded-lg flex items-center justify-between group transition-colors"
                                    >
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{r.display_name || 'ללא שם'}</div>
                                            {r.email && <div className="text-xs text-gray-500">{r.email}</div>}
                                        </div>
                                        {r.lead_score > 0 && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${r.lead_score >= 60 ? 'bg-orange-100 text-orange-700' : r.lead_score >= 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {r.lead_score}
                                            </span>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Content */}
            <div className="p-6 max-w-7xl mx-auto">
                {children}
            </div>
        </div>
    );
};
