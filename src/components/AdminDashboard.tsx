import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Lead } from '../types/supabase';
import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Input, Textarea } from './ui/shim';
import { Loader2, MessageSquare, Send, RefreshCw, Wand2, ChevronDown, ChevronUp, Mail, Clock, CheckCircle2, AlertCircle, MapPin, Smartphone, Eye } from 'lucide-react';
import type { EmailLog } from '../types/supabase';
import { sendEmail } from '../utils/email-service';
import { PartnersTable } from './PartnersTable';

export const AdminDashboard: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingId, setGeneratingId] = useState<string | null>(null);

    useEffect(() => {
        fetchLeads();

        // Subscribe to Realtime updates for leads and email_logs
        const leadsSubscription = supabase
            .channel('leads_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
                fetchLeads();
            })
            .subscribe();

        const logsSubscription = supabase
            .channel('email_logs_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'email_logs' }, (payload) => {
                const leadId = (payload.new as any)?.lead_id;
                if (leadId) {
                    fetchEmailLogs(leadId);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(leadsSubscription);
            supabase.removeChannel(logsSubscription);
        };
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
    const [emailLogs, setEmailLogs] = useState<Record<string, EmailLog[]>>({});
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [activeEmailLead, setActiveEmailLead] = useState<Lead | null>(null);

    const toggleRow = async (id: string) => {
        if (expandedLeadId === id) {
            setExpandedLeadId(null);
        } else {
            setExpandedLeadId(id);
            if (!emailLogs[id]) {
                await fetchEmailLogs(id);
            }
        }
    };

    const fetchEmailLogs = async (leadId: string) => {
        const { data, error } = await supabase
            .from('email_logs')
            .select('*')
            .eq('lead_id', leadId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setEmailLogs(prev => ({ ...prev, [leadId]: data as EmailLog[] }));
        }
    };

    const handleSendEmail = async () => {
        if (!activeEmailLead || !activeEmailLead.email) return;

        setSendingEmail(true);
        try {
            await sendEmail({
                to: activeEmailLead.email,
                subject: emailSubject,
                html: emailBody.replace(/\n/g, '<br>'), // Simple newline to BR
                leadId: activeEmailLead.id
            });

            // Refresh logs (custom delay to ensure DB write consistency)
            await new Promise(r => setTimeout(r, 500));
            await fetchEmailLogs(activeEmailLead.id);
            setActiveEmailLead(null);
            setEmailSubject('');
            setEmailBody('');
            alert('המייל נשלח בהצלחה!');
        } catch (error) {
            console.error('Failed to send email:', error);
            alert('שגיאה בשליחת המייל');
        } finally {
            setSendingEmail(false);
        }
    };

    const openEmailDialog = (lead: Lead) => {
        setActiveEmailLead(lead);
        setEmailSubject(`היי ${lead.full_name}, בקשר להתעניינותך בלימודים`);
        setEmailBody(lead.ai_draft || `היי ${lead.full_name},\n\nהמשך לשיחתנו...`);
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const colors: Record<string, string> = {
            new: 'bg-blue-100 text-blue-800',
            draft_generated: 'bg-purple-100 text-purple-800',
            sent: 'bg-green-100 text-green-800',
            replied: 'bg-orange-500 text-white animate-pulse shadow-sm border-orange-600'
        };
        const labels: Record<string, string> = {
            new: 'חדש',
            draft_generated: 'טיוטה מוכנה',
            sent: 'נשלח',
            replied: 'השיב - לבדוק!'
        };
        return (
            <Badge className={`${colors[status] || 'bg-gray-100'} px-2 py-1 flex items-center gap-1 font-bold`}>
                {status === 'replied' && <MessageSquare className="w-3 h-3 text-white" />}
                {labels[status] || status}
            </Badge>
        );
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <Card className="w-full max-w-7xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-3xl font-bold">Launch Pad CRM</CardTitle>
                    <Button onClick={fetchLeads} className="bg-gray-200 text-gray-800 hover:bg-gray-300">
                        <RefreshCw className="w-4 h-4 mr-2" /> רענן
                    </Button>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="leads" className="w-full">
                        <TabsList className="mb-6">
                            <TabsTrigger value="leads">לידים אקדמיים</TabsTrigger>
                            <TabsTrigger value="partners">פרטנרים ושיתופי פעולה</TabsTrigger>
                        </TabsList>

                        <TabsContent value="leads">
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
                                                                            <div className="space-y-4">
                                                                                <div className="flex justify-between items-center">
                                                                                    <h4 className="font-bold text-gray-700">היסטוריית מיילים</h4>
                                                                                    <Dialog open={!!activeEmailLead} onOpenChange={(open: boolean) => !open && setActiveEmailLead(null)}>
                                                                                        <DialogTrigger asChild>
                                                                                            <Button variant="outline" size="sm" onClick={() => openEmailDialog(lead)} disabled={!lead.email}>
                                                                                                <Mail className="w-4 h-4 mr-2" />
                                                                                                שלח מייל
                                                                                            </Button>
                                                                                        </DialogTrigger>
                                                                                        <DialogContent>
                                                                                            <DialogHeader>
                                                                                                <DialogTitle>שליחת מייל ל-{activeEmailLead?.full_name}</DialogTitle>
                                                                                            </DialogHeader>
                                                                                            <div className="space-y-4 py-4">
                                                                                                <div className="space-y-2">
                                                                                                    <label className="text-sm font-medium">נושא</label>
                                                                                                    <Input value={emailSubject} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailSubject(e.target.value)} />
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                    <label className="text-sm font-medium">תוכן ההודעה</label>
                                                                                                    <Textarea
                                                                                                        value={emailBody}
                                                                                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEmailBody(e.target.value)}
                                                                                                        rows={10}
                                                                                                    />
                                                                                                </div>
                                                                                                <div className="flex justify-end gap-2">
                                                                                                    <Button variant="outline" onClick={() => setActiveEmailLead(null)}>ביטול</Button>
                                                                                                    <Button onClick={handleSendEmail} disabled={sendingEmail}>
                                                                                                        {sendingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                                                        שלח
                                                                                                    </Button>
                                                                                                </div>
                                                                                            </div>
                                                                                        </DialogContent>
                                                                                    </Dialog>
                                                                                </div>

                                                                                {emailLogs[lead.id]?.length > 0 ? (
                                                                                    <div className="space-y-3">
                                                                                        {emailLogs[lead.id].map(log => (
                                                                                            <div key={log.id} className="border rounded-md bg-gray-50 overflow-hidden">
                                                                                                <div className="p-3 flex items-start justify-between">
                                                                                                    <div className="space-y-1">
                                                                                                        <p className="font-bold text-sm text-gray-800">{log.subject}</p>
                                                                                                        <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString('he-IL')}</p>

                                                                                                        <div className="flex gap-3 mt-2">
                                                                                                            {log.location && (
                                                                                                                <div className="flex items-center text-[10px] text-gray-500" title="מיקום פתיחה">
                                                                                                                    <MapPin className="w-3 h-3 mr-1" />
                                                                                                                    {log.location}
                                                                                                                </div>
                                                                                                            )}
                                                                                                            {log.user_agent && (
                                                                                                                <div className="flex items-center text-[10px] text-gray-500" title="מכשיר">
                                                                                                                    <Smartphone className="w-3 h-3 mr-1" />
                                                                                                                    {log.user_agent.includes('Mobile') ? 'Mobile' : 'Desktop'}
                                                                                                                </div>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="flex flex-col items-end gap-2">
                                                                                                        <Badge variant={log.status === 'opened' || log.status === 'clicked' ? 'success' : 'secondary'}>
                                                                                                            {log.status === 'opened' ? <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> נפתח</div> :
                                                                                                                log.status === 'clicked' ? <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> הוקלק</div> :
                                                                                                                    log.status === 'sent' ? <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> נשלח</div> :
                                                                                                                        log.status === 'failed' ? <div className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> נכשל</div> :
                                                                                                                            log.status}
                                                                                                        </Badge>
                                                                                                        {(log.opened_at || log.clicked_at) && (
                                                                                                            <span className="text-[10px] text-gray-500" title="זמן פתיחה אחרון">
                                                                                                                {new Date(log.opened_at || log.clicked_at || '').toLocaleTimeString()}
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>

                                                                                                {log.body && (
                                                                                                    <details className="border-t bg-white">
                                                                                                        <summary className="px-3 py-2 text-xs text-gray-500 cursor-pointer hover:bg-gray-50 flex items-center select-none">
                                                                                                            <Eye className="w-3 h-3 mr-1.5" />
                                                                                                            הצג תוכן המייל
                                                                                                        </summary>
                                                                                                        <div className="p-3 text-xs text-gray-700 bg-gray-50/50 overflow-x-auto">
                                                                                                            <div dangerouslySetInnerHTML={{ __html: log.body }} />
                                                                                                        </div>
                                                                                                    </details>
                                                                                                )}
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-md border border-dashed">
                                                                                        <Mail className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                                                                        עדיין לא נשלחו מיילים לליד זה.
                                                                                    </div>
                                                                                )}
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
                        </TabsContent>

                        <TabsContent value="partners">
                            <PartnersTable />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};
