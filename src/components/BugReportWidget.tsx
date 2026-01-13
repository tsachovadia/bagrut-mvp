import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send, MessageSquarePlus } from 'lucide-react';
import { cn } from '../lib/utils';

export function BugReportWidget() {
    const [report, setReport] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!report.trim()) return;

        setStatus('submitting');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const { error } = await supabase.from('bug_reports').insert({
                content: report,
                user_id: session?.user?.id || null
            });

            if (error) throw error;

            setStatus('success');
            setReport('');
            setTimeout(() => {
                setStatus('idle');
            }, 3000);
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div className="mt-6 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-100 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

            <div className="flex items-start gap-3 relative z-10">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-indigo-100 text-indigo-600">
                    <MessageSquarePlus size={20} />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm mb-1">מצאתם משהו לא הגיוני?</h4>
                    <p className="text-gray-500 text-xs mb-3 leading-relaxed">
                        אנחנו עדיין בבטא, והדעה שלכם קריטית לנו.
                        <br />
                        ראיתם חישוב מוזר? משהו נשבר? כתבו לנו כאן:
                    </p>

                    <form onSubmit={handleSubmit} className="relative">
                        <textarea
                            value={report}
                            onChange={(e) => setReport(e.target.value)}
                            placeholder="למשל: הממוצע בבן גוריון נראה גבוה מדי..."
                            className="w-full min-h-[80px] p-3 bg-white border border-indigo-200 rounded-lg text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-sm"
                            required
                            disabled={status === 'success'}
                        />

                        <div className="flex justify-between items-center mt-2">
                            {status === 'success' ? (
                                <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-md border border-green-100 flex items-center gap-1 animate-in fade-in slide-in-from-bottom-1">
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
                                    "flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm",
                                    status === 'submitting'
                                        ? "bg-gray-100 text-gray-400 cursor-wait"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200"
                                )}
                            >
                                <span>{status === 'submitting' ? 'שולח...' : 'שליחה'}</span>
                                <Send size={12} className={cn("transition-transform", status === 'submitting' ? "translate-x-1" : "")} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
