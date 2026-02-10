import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send, MessageSquarePlus } from 'lucide-react';
import { cn } from '../lib/utils';

export function BugReportWidget() {
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
            }, 3000);
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div className="mt-8 bg-white rounded-2xl p-5 border border-indigo-50 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-50 pointer-events-none group-hover:bg-indigo-100 transition-colors"></div>

            <div className="flex flex-col sm:flex-row items-start gap-4 relative z-10">
                <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 shrink-0">
                    <MessageSquarePlus size={22} />
                </div>
                <div className="flex-1 w-full">
                    <h4 className="font-bold text-gray-900 text-base mb-1">מצאתם משהו לא הגיוני?</h4>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                        אנחנו עדיין בבטא, והדעה שלכם קריטית לנו. ראיתם חישוב מוזר? משהו נשבר? כתבו לנו:
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="השם שלכם (לא חובה)"
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            disabled={status === 'success'}
                        />
                        <textarea
                            value={report}
                            onChange={(e) => setReport(e.target.value)}
                            placeholder="למשל: הממוצע בבן גוריון נראה גבוה מדי..."
                            className="w-full min-h-[80px] p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none outline-none"
                            required
                            disabled={status === 'success'}
                        />

                        <div className="flex justify-between items-center pt-1">
                            {status === 'success' ? (
                                <span className="text-green-600 text-sm font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-1">
                                    ✅ התקבל, תודה!
                                </span>
                            ) : status === 'error' ? (
                                <span className="text-red-500 text-sm bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                                    שגיאה בשליחה
                                </span>
                            ) : (
                                <span></span>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'submitting' || !report.trim()}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-sm",
                                    status === 'submitting'
                                        ? "bg-gray-100 text-gray-400 cursor-wait"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5"
                                )}
                            >
                                <span>{status === 'submitting' ? 'שולח...' : 'שליחה'}</span>
                                <Send size={14} className={cn("transition-transform", status === 'submitting' ? "translate-x-1" : "")} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
