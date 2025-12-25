import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Lead } from '../types/supabase';
import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from './ui/shim';
import { Loader2, MessageSquare, Send, RefreshCw, Wand2, ChevronDown, ChevronUp } from 'lucide-react';

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

    const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

    const toggleRow = (id: string) => {
        setExpandedLeadId(expandedLeadId === id ? null : id);
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const colors: Record<string, string> = {
            new: 'bg-blue-100 text-blue-800',
            draft_generated: 'bg-purple-100 text-purple-800',
            sent: 'bg-green-100 text-green-800',
            replied: 'bg-yellow-100 text-yellow-800'
        };
        const labels: Record<string, string> = {
            new: 'חדש',
            draft_generated: 'טיוטה מוכנה',
            sent: 'נשלח',
            replied: 'השיב'
        };
        return (
            <Badge className={`${colors[status] || 'bg-gray-100'} px-2 py-0.5`}>
                {labels[status] || status}
            </Badge>
        );
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
                        <div className="overflow-hidden border rounded-lg bg-white">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow className="bg-gray-50 text-sm">
                                        <TableHead className="w-[5%]"></TableHead>
                                        <TableHead className="w-[20%] text-right">שם מלא</TableHead>
                                        <TableHead className="w-[15%] text-right bg-blue-50/50">סטטוס</TableHead>
                                        <TableHead className="w-[20%] text-right">דואר אלקטרוני</TableHead>
                                        <TableHead className="w-[20%] text-right">תאריך יצירה</TableHead>
                                        <TableHead className="w-[20%] text-right">פעולות מהירות</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leads.map((lead) => (
                                        <React.Fragment key={lead.id}>
                                            <TableRow
                                                className={`cursor-pointer transition-colors ${expandedLeadId === lead.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                                                onClick={() => toggleRow(lead.id)}
                                            >
                                                <TableCell>
                                                    {expandedLeadId === lead.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                                </TableCell>
                                                <TableCell className="font-medium text-gray-900">{lead.full_name}</TableCell>
                                                <TableCell className="bg-blue-50/30"><StatusBadge status={lead.status} /></TableCell>
                                                <TableCell className="text-gray-600">{lead.email || '-'}</TableCell>
                                                <TableCell className="text-gray-500 text-sm">
                                                    {new Date(lead.created_at).toLocaleDateString('he-IL')}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                        {lead.profile_link && (
                                                            <Button variant="ghost" size="sm" onClick={() => window.open(lead.profile_link!, '_blank')}>
                                                                <MessageSquare className="w-4 h-4 text-blue-600" />
                                                            </Button>
                                                        )}
                                                        {lead.ai_draft && (
                                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0 rounded-full" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(lead.ai_draft || '')}`, '_blank')}>
                                                                <Send className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {expandedLeadId === lead.id && (
                                                <TableRow className="bg-gray-50/50">
                                                    <TableCell colSpan={6} className="p-4">
                                                        <div className="bg-white border rounded-lg p-6 shadow-sm" onClick={(e) => e.stopPropagation()}>
                                                            <Tabs defaultValue="overview" className="w-full">
                                                                <TabsList className="grid w-full grid-cols-4 mb-4">
                                                                    <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
                                                                    <TabsTrigger value="dilemma">הדילמה</TabsTrigger>
                                                                    <TabsTrigger value="ai">AI Assistant</TabsTrigger>
                                                                    <TabsTrigger value="communication">תקשורת ולוגים</TabsTrigger>
                                                                </TabsList>

                                                                <TabsContent value="overview">
                                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                                        <div className="space-y-2">
                                                                            <p><span className="font-bold">גיל:</span> {lead.age || '-'}</p>
                                                                            <p><span className="font-bold">עיר מגורים:</span> {lead.city || '-'}</p>
                                                                            <p><span className="font-bold">תואר מבוקש:</span> {lead.target_degree || '-'}</p>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <p><span className="font-bold">הצטרף לקבוצה:</span> {lead.joined_group_at ? new Date(lead.joined_group_at).toLocaleDateString('he-IL') : '-'}</p>
                                                                            <p><span className="font-bold">Facebook ID:</span> <span className="font-mono text-xs bg-gray-100 p-1 rounded">{lead.facebook_user_id}</span></p>
                                                                        </div>
                                                                    </div>
                                                                </TabsContent>

                                                                <TabsContent value="dilemma">
                                                                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100 text-gray-800 whitespace-pre-wrap leading-relaxed">
                                                                        {lead.dilemma || 'אין מידע על הדילמה.'}
                                                                    </div>
                                                                </TabsContent>

                                                                <TabsContent value="ai">
                                                                    <div className="space-y-4">
                                                                        <div className="flex justify-between items-center">
                                                                            <h4 className="font-bold text-gray-700">טיוטת הודעה (Generator)</h4>
                                                                            {!lead.ai_draft && (
                                                                                <Button
                                                                                    onClick={() => handleGenerateDraft(lead)}
                                                                                    disabled={!!generatingId}
                                                                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                                                                >
                                                                                    {generatingId === lead.id ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                                                                                    צור טיוטה חדשה
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                        {lead.ai_draft ? (
                                                                            <div className="border rounded-md p-4 bg-gray-50">
                                                                                <textarea
                                                                                    className="w-full bg-transparent border-none resize-none focus:ring-0 text-gray-700"
                                                                                    rows={4}
                                                                                    readOnly
                                                                                    value={lead.ai_draft}
                                                                                />
                                                                                <div className="mt-2 flex justify-end">
                                                                                    <Button
                                                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                                                        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(lead.ai_draft || '')}`, '_blank')}
                                                                                    >
                                                                                        <Send className="w-4 h-4 mr-2" /> שלח לוואטסאפ
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-md border border-dashed">
                                                                                טרם נוצרה טיוטה עבור ליד זה.
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </TabsContent>

                                                                <TabsContent value="communication">
                                                                    <div className="text-center py-8 text-gray-500">
                                                                        <p>אין היסטוריית תקשורת זמינה (Email/SMS).</p>
                                                                        {/* Placeholder for future EmailLogs integration */}
                                                                    </div>
                                                                </TabsContent>
                                                            </Tabs>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    {leads.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                                אין לידים להצגה.
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
