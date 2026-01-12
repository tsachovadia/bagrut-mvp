import React, { useEffect, useState } from 'react';
import {
    MoreHorizontal,
    Clock,
    User,
    Phone,
    HelpCircle,
    Calendar
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface SoftLead {
    id: string;
    full_name: string | null;
    phone: string | null;
    interest: string | null;
    source: string | null;
    created_at: string;
}

export const SoftLeadsTable = () => {
    const [leads, setLeads] = useState<SoftLead[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const { data, error } = await supabase
                .from('soft_leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (error) {
            console.error('Error fetching soft leads:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('he-IL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) return <div className="p-8 text-center text-gray-400">טוען לידים...</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between bg-yellow-50/30">
                <h2 className="font-semibold text-gray-800 text-sm">לידים מהירים (Soft Leads)</h2>
                <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-full text-[10px] font-bold border border-yellow-100">
                        {leads.length} ממתינים
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-2 font-semibold">שם מלא</th>
                            <th className="px-4 py-2 font-semibold">טלפון</th>
                            <th className="px-4 py-2 font-semibold">התעניינות</th>
                            <th className="px-4 py-2 font-semibold">מקור</th>
                            <th className="px-4 py-2 font-semibold">נוצר</th>
                            <th className="px-4 py-2 text-left font-semibold">פעולות</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-yellow-50/30 transition-colors">
                                <td className="px-4 py-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                            <User size={12} />
                                        </div>
                                        <span className="font-medium text-gray-900">{lead.full_name || '-'}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                        <Phone size={12} className="text-gray-400" />
                                        <span className="font-mono">{lead.phone || '-'}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex items-center gap-1.5 text-gray-700">
                                        <HelpCircle size={12} className="text-gray-400" />
                                        <span>{lead.interest || '-'}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    <span className="inline-flex px-1.5 py-0.5 rounded bg-gray-50 text-gray-500 text-[10px] border border-gray-100">
                                        {lead.source}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-gray-500 text-[10px]">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} className="text-gray-400" />
                                        {formatDate(lead.created_at)}
                                    </div>
                                </td>
                                <td className="px-4 py-2 text-left">
                                    <button className="p-1 hover:bg-white hover:shadow-sm rounded text-gray-400 hover:text-gray-600 transition-all border border-transparent hover:border-gray-200">
                                        <MoreHorizontal className="w-3.5 h-3.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {leads.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 italic">
                                    אין לידים חדשים להצגה
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
