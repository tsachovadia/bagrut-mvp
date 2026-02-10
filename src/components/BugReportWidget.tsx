import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send, MessageSquarePlus, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function BugReportWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [report, setReport] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [name, setName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!report.trim()) return;

        setStatus('submitting');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const { error } = await supabase.from('bug_reports').insert({
                content: report,
                reporter_name: name || null,
                user_id: session?.user?.id || null
            });

            if (error) throw error;

            setStatus('success');
            setReport('');
            setName('');
            setTimeout(() => {
                setStatus('idle');
                setIsOpen(false);
            }, 2000);
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs text-gray-400 hover:text-indigo-500 transition-colors flex items-center gap-1"
            >
                <MessageSquarePlus size={13} />
                <span>דיווח על תקלה</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 left-4 z-50 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <MessageSquarePlus size={15} className="text-indigo-500" />
                    דיווח על תקלה
                </h4>
                <button
                    onClick={() => { setIsOpen(false); setStatus('idle'); }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="השם שלכם (לא חובה)"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    disabled={status === 'success'}
                />
                <textarea
                    value={report}
                    onChange={(e) => setReport(e.target.value)}
                    placeholder="מה לא עובד? תארו בקצרה..."
                    className="w-full min-h-[60px] p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none outline-none"
                    required
                    disabled={status === 'success'}
                    autoFocus
                />

                <div className="flex justify-between items-center">
                    {status === 'success' ? (
                        <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-md border border-green-100">
                            ✅ התקבל, תודה!
                        </span>
                    ) : status === 'error' ? (
                        <span className="text-red-500 text-xs bg-red-50 px-2 py-1 rounded-md border border-red-100">
                            שגיאה בשליחה
                        </span>
                    ) : (
                        <span></span>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'submitting' || !report.trim()}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                            status === 'submitting'
                                ? "bg-gray-100 text-gray-400 cursor-wait"
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                        )}
                    >
                        <span>{status === 'submitting' ? 'שולח...' : 'שליחה'}</span>
                        <Send size={12} />
                    </button>
                </div>
            </form>
        </div>
    );
}
