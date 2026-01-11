import React, { useEffect, useState } from 'react';
import {
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    ThermometerSun,
    Clock,
    ChevronDown,
    ChevronUp,
    FileText,
    Calculator
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { type Database } from '../../../types/database.types';
import { type SubjectGrade } from '../../../utils/calculator';
import { type SavedSimulation } from '../../../lib/userData';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

export const UsersTable = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedUserId(expandedUserId === id ? null : id);
    };

    const getHeatColor = (score: number | null) => {
        const s = score || 0;
        if (s >= 80) return 'text-red-600 bg-red-50';
        if (s >= 50) return 'text-orange-600 bg-orange-50';
        return 'text-blue-600 bg-blue-50';
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('he-IL');
    };

    if (isLoading) return <div className="p-8 text-center text-gray-400">טוען משתמשים...</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                <h2 className="font-semibold text-gray-800 text-sm">משתמשים אחרונים</h2>
                <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold border border-green-100">
                        {users.length} פעילים
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                        <tr>
                            <th className="w-8"></th>
                            <th className="px-4 py-2 font-semibold">משתמש</th>
                            <th className="px-4 py-2 font-semibold">סטטוס קהילה</th>
                            <th className="px-4 py-2 font-semibold">תחום עניין</th>
                            <th className="px-4 py-2 font-semibold">Score</th>
                            <th className="px-4 py-2 font-semibold">נוצר</th>
                            <th className="px-4 py-2 font-semibold">פעילות</th>
                            <th className="px-4 py-2 text-left font-semibold">פעולות</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <React.Fragment key={user.id}>
                                <tr
                                    className={`hover:bg-blue-50/30 transition-colors cursor-pointer ${expandedUserId === user.id ? 'bg-blue-50/20' : ''}`}
                                    onClick={() => toggleExpand(user.id)}
                                >
                                    <td className="px-2 text-gray-400">
                                        {expandedUserId === user.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-[10px] font-bold border border-white shadow-sm ring-1 ring-gray-100">
                                                {(user.first_name?.[0] || '?')}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{user.first_name} {user.last_name || ''}</div>
                                                <div className="text-gray-400 text-[10px] font-mono leading-none mt-0.5">{user.phone_primary || user.email_primary || '-'}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-2">
                                        {(user.wa_groups_common || 0) > 0 ? (
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1 text-green-700 font-medium text-[10px]">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    <span>בקבוצה</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                                                <XCircle className="w-3 h-3" />
                                                <span>לא בקבוצה</span>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-4 py-2">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-50 text-gray-700 text-[10px] font-medium border border-gray-200">
                                            {user.institution_pref && Array.isArray(user.institution_pref) ? user.institution_pref[0] : '-'}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2">
                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getHeatColor(user.lead_score)}`}>
                                            <ThermometerSun className="w-3 h-3" />
                                            {user.lead_score || 0}
                                        </div>
                                    </td>

                                    <td className="px-4 py-2 text-gray-500 text-[10px]">
                                        {formatDate(user.created_at)}
                                    </td>

                                    <td className="px-4 py-2 text-gray-500 text-[10px] flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-gray-400" />
                                        {user.app_last_active ? formatDate(user.app_last_active) : '-'}
                                    </td>

                                    <td className="px-4 py-2 text-left" onClick={(e) => e.stopPropagation()}>
                                        <button className="p-1 hover:bg-white hover:shadow-sm rounded text-gray-400 hover:text-gray-600 transition-all border border-transparent hover:border-gray-200">
                                            <MoreHorizontal className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>

                                {expandedUserId === user.id && (
                                    <tr className="bg-gray-50/50">
                                        <td colSpan={8} className="px-4 py-3 border-t border-gray-100">
                                            <div className="flex gap-6">
                                                {/* Left Column: Bagrut */}
                                                <div className="flex-1 bg-white rounded border border-gray-200 p-3">
                                                    <div className="flex items-center gap-2 mb-2 text-blue-600 font-medium text-xs border-b border-gray-100 pb-2">
                                                        <FileText size={14} />
                                                        ציוני בגרות
                                                    </div>
                                                    <div className="space-y-1">
                                                        {(user.bagrut_grades as unknown as SubjectGrade[])?.length > 0 ? (
                                                            (user.bagrut_grades as unknown as SubjectGrade[]).map((grade, idx) => (
                                                                <div key={idx} className="flex justify-between text-[11px] hover:bg-gray-50 p-1 rounded">
                                                                    <span className="text-gray-700">{grade.subject} ({grade.units} יח״ל)</span>
                                                                    <span className="font-bold text-gray-900">{grade.grade}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-gray-400 text-[10px] italic">אין נתוני בגרות</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Middle Column: Psychometric */}
                                                <div className="flex-1 bg-white rounded border border-gray-200 p-3">
                                                    <div className="flex items-center gap-2 mb-2 text-purple-600 font-medium text-xs border-b border-gray-100 pb-2">
                                                        <Calculator size={14} />
                                                        פסיכומטרי
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-[11px] p-1">
                                                            <span className="text-gray-600">כללי</span>
                                                            <span className="font-bold">{user.psycho_score_total || '-'}</span>
                                                        </div>
                                                        <div className="flex justify-between text-[11px] p-1">
                                                            <span className="text-gray-600">כמותי</span>
                                                            <span className="font-bold">{user.psycho_score_quant || '-'}</span>
                                                        </div>
                                                        <div className="flex justify-between text-[11px] p-1">
                                                            <span className="text-gray-600">אנגלית</span>
                                                            <span className="font-bold">{user.psycho_score_eng || '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Column: Calculations */}
                                                <div className="flex-1 bg-white rounded border border-gray-200 p-3">
                                                    <div className="flex items-center gap-2 mb-2 text-green-600 font-medium text-xs border-b border-gray-100 pb-2">
                                                        <Clock size={14} />
                                                        סימולציות שמורות
                                                    </div>
                                                    <div className="space-y-1 max-h-[150px] overflow-y-auto">
                                                        {(user.saved_simulations as unknown as SavedSimulation[])?.length > 0 ? (
                                                            (user.saved_simulations as unknown as SavedSimulation[]).map((sim, idx) => (
                                                                <div key={idx} className="bg-gray-50 p-2 rounded mb-1 last:mb-0">
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <div className="font-medium text-[11px]">{sim.name}</div>
                                                                        <div className="text-[10px] text-gray-500">{new Date(sim.createdAt).toLocaleDateString()}</div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-gray-400 text-[10px] italic">אין סימולציות שמורות</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
