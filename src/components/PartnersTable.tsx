import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Partner, PartnerOutreachLog } from '../types/supabase';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
    Button, Badge,
} from './ui/shim';
import {
    Loader2, ChevronDown, ChevronUp, MessageSquare,
    Phone, Mail, Globe, Plus, Search, Calendar, User, Tag, Clock, Send, Info
} from 'lucide-react';
import { PartnerDialog, OutreachDialog } from './PartnerDialogs';

export const PartnersTable: React.FC = () => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [outreachLogs, setOutreachLogs] = useState<Record<string, PartnerOutreachLog[]>>({});
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);
    const [isOutreachDialogOpen, setIsOutreachDialogOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('partners')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setPartners(data);
        }
        setLoading(false);
    };

    const fetchOutreachLogs = async (partnerId: string) => {
        const { data, error } = await supabase
            .from('partner_outreach_logs')
            .select('*')
            .eq('partner_id', partnerId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setOutreachLogs(prev => ({ ...prev, [partnerId]: data }));
        }
    };

    const toggleRow = async (id: string) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            if (!outreachLogs[id]) {
                await fetchOutreachLogs(id);
            }
        }
    };

    const statusColors: Record<string, string> = {
        potential: 'bg-blue-100 text-blue-800',
        contacted: 'bg-yellow-100 text-yellow-800',
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-red-100 text-red-800'
    };

    const statusLabels: Record<string, string> = {
        potential: 'פוטנציאלי',
        contacted: 'בוצעה פנייה',
        active: 'פעיל',
        inactive: 'לא פעיל'
    };

    const filteredPartners = partners.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-72">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="חפש פרטנר, איש קשר או קטגוריה..."
                        className="w-full pr-10 pl-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button onClick={() => { setSelectedPartner(null); setIsPartnerDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 ml-2" /> הוסף פרטנר חדש
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                </div>
            ) : (
                <div className="overflow-hidden border rounded-lg bg-white shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 text-xs">
                                <TableHead className="w-[5%]"></TableHead>
                                <TableHead className="w-[20%]">שם הפרטנר</TableHead>
                                <TableHead className="w-[15%]">איש קשר</TableHead>
                                <TableHead className="w-[10%]">קטגוריה</TableHead>
                                <TableHead className="w-[15%]">סטטוס</TableHead>
                                <TableHead className="w-[20%]">פרטי התקשרות</TableHead>
                                <TableHead className="w-[15%]">פעולות</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPartners.map((partner) => (
                                <React.Fragment key={partner.id}>
                                    <TableRow
                                        className={`cursor-pointer transition-colors ${expandedId === partner.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                                        onClick={() => toggleRow(partner.id)}
                                    >
                                        <TableCell>
                                            {expandedId === partner.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                        </TableCell>
                                        <TableCell className="font-semibold text-gray-900">{partner.name}</TableCell>
                                        <TableCell className="text-gray-600">{partner.contact_name || '-'}</TableCell>
                                        <TableCell>
                                            <Badge className="bg-gray-100 text-gray-600">{partner.category || '-'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${statusColors[partner.status]} px-2 py-0.5`}>
                                                {statusLabels[partner.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {partner.phone && <span title={partner.phone}><Phone className="w-4 h-4 text-gray-400" /></span>}
                                                {partner.email && <span title={partner.email}><Mail className="w-4 h-4 text-gray-400" /></span>}
                                                {partner.website && <span title={partner.website}><Globe className="w-4 h-4 text-gray-400" /></span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                                <Button variant="ghost" size="sm" onClick={() => { setSelectedPartner(partner); setIsPartnerDialogOpen(true); }}>
                                                    ערוך
                                                </Button>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => { setSelectedPartner(partner); setIsOutreachDialogOpen(true); }}>
                                                    תיעוד פנייה
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    {expandedId === partner.id && (
                                        <TableRow className="bg-gray-50/30">
                                            <TableCell colSpan={7} className="p-4">
                                                <div className="grid grid-cols-3 gap-6" onClick={e => e.stopPropagation()}>
                                                    <div className="col-span-1 space-y-4">
                                                        <div className="bg-white p-4 rounded-lg border shadow-xs">
                                                            <h4 className="font-bold text-sm mb-3 flex items-center border-b pb-2">
                                                                <Info className="w-4 h-4 ml-2 text-blue-500" /> פרטים נוספים
                                                            </h4>
                                                            <div className="space-y-2 text-sm">
                                                                <p><span className="text-gray-500">אתר:</span> {partner.website ? <a href={partner.website} target="_blank" className="text-blue-600 hover:underline">{partner.website}</a> : '-'}</p>
                                                                <p><span className="text-gray-500">טלפון:</span> {partner.phone || '-'}</p>
                                                                <p><span className="text-gray-500">מייל:</span> {partner.email || '-'}</p>
                                                                <div className="mt-4 pt-2 border-t">
                                                                    <p className="font-bold mb-1">הערות:</p>
                                                                    <p className="text-gray-600 whitespace-pre-wrap">{partner.notes || 'אין הערות.'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2 space-y-4">
                                                        <div className="bg-white p-4 rounded-lg border shadow-xs">
                                                            <div className="flex justify-between items-center mb-4">
                                                                <h4 className="font-bold text-sm flex items-center">
                                                                    <Clock className="w-4 h-4 ml-2 text-blue-500" /> היסטוריית פניות
                                                                </h4>
                                                                <Button size="sm" className="h-8" onClick={() => { setSelectedPartner(partner); setIsOutreachDialogOpen(true); }}>
                                                                    <Plus className="w-3 h-3 ml-1" /> פנייה חדשה
                                                                </Button>
                                                            </div>

                                                            {outreachLogs[partner.id]?.length > 0 ? (
                                                                <div className="space-y-3">
                                                                    {outreachLogs[partner.id].map(log => (
                                                                        <div key={log.id} className="border-r-4 border-r-blue-500 bg-gray-50 p-3 rounded-l-md shadow-xs">
                                                                            <div className="flex justify-between items-start mb-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    {log.method === 'whatsapp' && <Send className="w-3 h-3 text-green-600" />}
                                                                                    {log.method === 'email' && <Mail className="w-3 h-3 text-blue-600" />}
                                                                                    {log.method === 'call' && <Phone className="w-3 h-3 text-orange-600" />}
                                                                                    <span className="text-xs font-bold text-gray-700">
                                                                                        {log.method === 'whatsapp' ? 'WhatsApp' : log.method === 'email' ? 'Email' : log.method === 'call' ? 'טלפון' : 'פגישה'}
                                                                                    </span>
                                                                                </div>
                                                                                <span className="text-[10px] text-gray-400">{new Date(log.created_at).toLocaleString('he-IL')}</span>
                                                                            </div>
                                                                            <p className="text-sm text-gray-600 mb-2">{log.content}</p>
                                                                            <Badge className={`text-[10px] px-1.5 py-0 ${log.status === 'replied' ? 'bg-green-100 text-green-700' :
                                                                                log.status === 'ignored' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'
                                                                                }`}>
                                                                                {log.status === 'sent' ? 'נשלח' : log.status === 'replied' ? 'נענה' : 'לא רלוונטי'}
                                                                            </Badge>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-10 bg-gray-50 rounded-md border border-dashed border-gray-200">
                                                                    <p className="text-sm text-gray-400 italic">לא נמצאו פניות מתועדות.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                            {filteredPartners.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-20 text-gray-400">
                                        לא נמצאו פרטנרים.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <PartnerDialog
                isOpen={isPartnerDialogOpen}
                onClose={() => setIsPartnerDialogOpen(false)}
                onSuccess={fetchPartners}
                partner={selectedPartner}
            />

            <OutreachDialog
                isOpen={isOutreachDialogOpen}
                onClose={() => setIsOutreachDialogOpen(false)}
                onSuccess={() => fetchOutreachLogs(selectedPartner?.id!)}
                partner={selectedPartner!}
            />
        </div>
    );
};
