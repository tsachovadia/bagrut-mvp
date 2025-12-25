import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Lead } from '../types/supabase';
import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge } from './ui/shim';
import { Loader2, MessageSquare, Send, RefreshCw, Wand2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingId, setGeneratingId] = useState<string | null>(null);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching leads:', error);
        } else {
            setLeads(data || []);
        }
        setLoading(false);
    };

    const handleGenerateDraft = async (lead: Lead) => {
        setGeneratingId(lead.id);
        // Placeholder for Edge Function call
        // const { data } = await supabase.functions.invoke('generate-draft', { body: { lead } });

        // Mock simulation
        setTimeout(async () => {
            const mockDraft = `היי ${lead.full_name}, ראיתי שאת/ה מתלבט/ת לגבי ${lead.dilemma || 'הלימודים'}. אשמח לעזור!`;

            // Update local state and DB
            const { error } = await supabase
                .from('leads')
                .update({ ai_draft: mockDraft, status: 'draft_generated' })
                .eq('id', lead.id);

            if (!error) {
                setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, ai_draft: mockDraft, status: 'draft_generated' } : l));
            }
            setGeneratingId(null);
        }, 1500);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'draft_generated': return 'bg-purple-100 text-purple-800';
            case 'sent': return 'bg-green-100 text-green-800';
            case 'replied': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <Card className="w-full max-w-7xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-3xl font-bold">לידים אקדמיים (CRM)</CardTitle>
                    <Button onClick={fetchLeads} className="bg-gray-200 text-gray-800 hover:bg-gray-300">
                        <RefreshCw className="w-4 h-4 mr-2" /> רענן
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                        </div>
                    ) : (
                        <div className="overflow-hidden border rounded-lg">
                            <Table className="table-fixed w-full text-xs">
                                <TableHeader>
                                    <TableRow className="bg-gray-100">
                                        <TableHead className="w-[18%] text-right font-bold">פרטים אישיים</TableHead>
                                        <TableHead className="w-[12%] text-right font-bold">מיקום/תואר</TableHead>
                                        <TableHead className="w-[30%] text-right font-bold">דילמה</TableHead>
                                        <TableHead className="w-[10%] text-right font-bold">סטטוס</TableHead>
                                        <TableHead className="w-[10%] text-right font-bold">יצירת קשר</TableHead>
                                        <TableHead className="w-[12%] text-right font-bold">טיוטה</TableHead>
                                        <TableHead className="w-[8%] text-right font-bold">פעולות</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leads.map((lead) => {
                                        // Calculate Age
                                        let displayAge = lead.age;
                                        if (lead.age && lead.joined_group_at) {
                                            const joinedDate = new Date(lead.joined_group_at);
                                            const now = new Date();
                                            const yearsDiff = now.getFullYear() - joinedDate.getFullYear();
                                            const numericAge = parseInt(lead.age);
                                            if (!isNaN(numericAge)) {
                                                displayAge = `${numericAge + yearsDiff}`;
                                            }
                                        }

                                        const dateStr = lead.joined_group_at ? new Date(lead.joined_group_at).toLocaleDateString('he-IL') : '';
                                        const createdStr = new Date(lead.created_at).toLocaleDateString('he-IL');

                                        return (
                                            <TableRow key={lead.id} className="hover:bg-gray-50 transition-colors border-b">
                                                <TableCell className="align-top py-3 pr-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold text-sm text-gray-900">{lead.full_name}</span>
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <span>גיל: {displayAge}</span>
                                                            <span>•</span>
                                                            <span>{dateStr}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-0.5 mt-1">
                                                            <span className="text-[10px] text-gray-400 font-mono" title="Facebook User ID">
                                                                ID: {lead.facebook_user_id.slice(0, 10)}...
                                                            </span>
                                                            <span className="text-[10px] text-gray-400">
                                                                נוצר: {createdStr}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top py-3">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium text-gray-800">{lead.city || '-'}</span>
                                                        <span className="text-blue-600 font-medium text-[11px] leading-tight">{lead.target_degree || '-'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top py-3">
                                                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                                        {lead.dilemma || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top py-3">
                                                    <Badge className={`${getStatusColor(lead.status)} text-[10px] px-2 py-0.5 whitespace-nowrap`}>
                                                        {lead.status === 'new' ? 'חדש' :
                                                            lead.status === 'draft_generated' ? 'טיוטה' :
                                                                lead.status === 'sent' ? 'נשלח' : lead.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="align-top py-3">
                                                    <div className="flex flex-col gap-2 items-start">
                                                        {lead.profile_link && (
                                                            <button onClick={() => window.open(lead.profile_link!, '_blank')} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors">
                                                                <MessageSquare className="w-3.5 h-3.5" />
                                                                <span className="underline">פרופיל</span>
                                                            </button>
                                                        )}
                                                        {lead.email && (
                                                            <span className="text-gray-500 break-all">{lead.email}</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top py-3">
                                                    {lead.ai_draft ? (
                                                        <div className="bg-white p-2 border rounded shadow-sm max-h-24 overflow-y-auto text-gray-600 text-[11px] leading-relaxed custom-scrollbar">
                                                            {lead.ai_draft}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">---</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="align-top py-3">
                                                    <div className="flex flex-col gap-2">
                                                        {!lead.ai_draft && (
                                                            <Button
                                                                size="sm"
                                                                className="bg-purple-600 hover:bg-purple-700 w-full h-8 flex items-center justify-center gap-1.5 text-white shadow-sm"
                                                                onClick={() => handleGenerateDraft(lead)}
                                                                disabled={!!generatingId}
                                                            >
                                                                {generatingId === lead.id ? <Loader2 className="animate-spin w-3 h-3" /> : <Wand2 className="w-3.5 h-3.5" />}
                                                                <span>AI</span>
                                                            </Button>
                                                        )}
                                                        {lead.ai_draft && (
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700 w-full h-8 flex items-center justify-center gap-1.5 text-white shadow-sm"
                                                                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(lead.ai_draft || '')}`, '_blank')}
                                                            >
                                                                <Send className="w-3.5 h-3.5" />
                                                                <span>שלח</span>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {leads.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12 text-gray-500 text-lg">
                                                אין לידים להצגה. הרץ את סקריפט הייבוא.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
