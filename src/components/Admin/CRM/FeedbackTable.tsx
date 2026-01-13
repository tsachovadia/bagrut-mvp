import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader2, MessageSquare, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface BugReport {
    id: string;
    content: string;
    created_at: string;
    user_id: string | null;
}

export function FeedbackTable() {
    const [reports, setReports] = useState<BugReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('bug_reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (err: any) {
            console.error('Error fetching reports:', err);
            setError('שגיאה בטעינת הנתונים');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center py-4">{error}</div>;
    }

    if (reports.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-gray-900 font-medium">אין דיווחים עדיין</h3>
                <p className="text-gray-500 text-sm mt-1">כאשר משתמשים ישלחו משוב, הוא יופיע כאן.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50 text-gray-700 font-medium">
                        <tr>
                            <th className="px-4 py-3 border-b">תוכן הדיווח</th>
                            <th className="px-4 py-3 border-b w-48">מאת (User ID)</th>
                            <th className="px-4 py-3 border-b w-48">תאריך</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {reports.map((report) => (
                            <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3 align-top">
                                    <div className="text-gray-900 whitespace-pre-wrap">{report.content}</div>
                                </td>
                                <td className="px-4 py-3 align-top text-gray-500 font-mono text-xs">
                                    {report.user_id ? (
                                        <div className="flex items-center gap-1.5" title={report.user_id}>
                                            <User size={14} className="text-gray-400" />
                                            <span className="truncate max-w-[120px]">{report.user_id.slice(0, 8)}...</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">אנונימי</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 align-top text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} className="text-gray-400" />
                                        <span dir="ltr">{format(new Date(report.created_at), 'dd/MM/yyyy HH:mm')}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
