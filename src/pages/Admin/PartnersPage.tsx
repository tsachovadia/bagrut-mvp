import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    Pencil,
    X,
    Loader2,
    Building2,
    DollarSign,
    Users,
    Send,
    Receipt,
} from 'lucide-react';
import { AdminShell } from '@/components/Admin/AdminShell';
import { usePartners, type Partner, type PartnerCreateData } from '@/hooks/usePartners';
import { supabase } from '@/lib/supabase';

// ─── Helpers ────────────────────────────────────────────────

const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_API_TOKEN || '';

const tierBadge: Record<string, string> = {
    basic: 'bg-gray-600/40 text-gray-300',
    premium: 'bg-blue-600/30 text-blue-300',
    enterprise: 'bg-purple-600/30 text-purple-300',
};

const statusBadge: Record<string, { cls: string; label: string }> = {
    active: { cls: 'bg-green-600/20 text-green-400', label: 'פעיל' },
    potential: { cls: 'bg-yellow-600/20 text-yellow-400', label: 'פוטנציאלי' },
    contacted: { cls: 'bg-blue-600/20 text-blue-400', label: 'נוצר קשר' },
    inactive: { cls: 'bg-gray-600/20 text-gray-500', label: 'לא פעיל' },
};

const categoryLabels: Record<string, string> = {
    academic: 'אקדמי',
    influencer: 'משפיען',
    agency: 'סוכנות',
    other: 'אחר',
};

function formatCurrency(n: number | null | undefined): string {
    if (n == null || isNaN(n)) return '--';
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string | null | undefined): string {
    if (!d) return '--';
    return new Date(d).toLocaleDateString('he-IL');
}

// ─── Outreach & Billing types ───────────────────────────────

interface OutreachLog {
    id: string;
    partner_id: string;
    method: string;
    content: string | null;
    status: string;
    created_at: string;
}

interface BillingRecord {
    id: string;
    partner_id: string;
    period_start: string;
    period_end: string;
    leads_count: number;
    amount: number;
    status: string;
    paid_at: string | null;
    notes: string | null;
    created_at: string;
}

// ─── Partner Form Modal ─────────────────────────────────────

interface PartnerFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: PartnerCreateData) => Promise<void>;
    initial?: Partial<PartnerCreateData>;
    title: string;
}

const PartnerFormModal: React.FC<PartnerFormModalProps> = ({ open, onClose, onSubmit, initial, title }) => {
    const [form, setForm] = useState<PartnerCreateData>({
        name: '',
        contact_name: '',
        email: '',
        phone: '',
        category: 'academic',
        tier: 'basic',
        monthly_budget: undefined,
        price_per_lead: undefined,
        portal_type: '',
        billing_email: '',
        notes: '',
        status: 'potential',
        ...initial,
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open && initial) {
            setForm((prev) => ({ ...prev, ...initial }));
        }
    }, [open, initial]);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(form);
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    const set = (key: keyof PartnerCreateData, val: any) => setForm((f) => ({ ...f, [key]: val }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Name + Contact */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="שם שותף *" value={form.name} onChange={(v) => set('name', v)} required />
                        <Field label="איש קשר" value={form.contact_name || ''} onChange={(v) => set('contact_name', v)} />
                    </div>

                    {/* Email + Phone */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="אימייל" value={form.email || ''} onChange={(v) => set('email', v)} type="email" />
                        <Field label="טלפון" value={form.phone || ''} onChange={(v) => set('phone', v)} />
                    </div>

                    {/* Category + Tier */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5">קטגוריה</label>
                            <select
                                value={form.category || 'academic'}
                                onChange={(e) => set('category', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="academic">אקדמי</option>
                                <option value="influencer">משפיען</option>
                                <option value="agency">סוכנות</option>
                                <option value="other">אחר</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5">חבילה</label>
                            <select
                                value={form.tier || 'basic'}
                                onChange={(e) => set('tier', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="basic">Basic</option>
                                <option value="premium">Premium</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                        </div>
                    </div>

                    {/* Budget + Price per lead */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field
                            label="תקציב חודשי"
                            value={form.monthly_budget != null ? String(form.monthly_budget) : ''}
                            onChange={(v) => set('monthly_budget', v ? Number(v) : undefined)}
                            type="number"
                        />
                        <Field
                            label="מחיר לליד"
                            value={form.price_per_lead != null ? String(form.price_per_lead) : ''}
                            onChange={(v) => set('price_per_lead', v ? Number(v) : undefined)}
                            type="number"
                        />
                    </div>

                    {/* Portal type */}
                    <div>
                        <label className="block text-[11px] font-medium text-gray-500 mb-1.5">סוג פורטל</label>
                        <select
                            value={form.portal_type || ''}
                            onChange={(e) => set('portal_type', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        >
                            <option value="">ללא</option>
                            <option value="psycho_demo">פסיכומטרי</option>
                            <option value="bagrut_demo">בגרות</option>
                            <option value="demo">דמו מלא</option>
                        </select>
                    </div>

                    {/* Billing email */}
                    <Field label="אימייל לחשבוניות" value={form.billing_email || ''} onChange={(v) => set('billing_email', v)} type="email" />

                    {/* Notes */}
                    <div>
                        <label className="block text-[11px] font-medium text-gray-500 mb-1.5">הערות</label>
                        <textarea
                            value={form.notes || ''}
                            onChange={(e) => set('notes', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        >
                            ביטול
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !form.name}
                            className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
                        >
                            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {initial?.name ? 'עדכן פרטים' : 'צור שותף חדש'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Field: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    required?: boolean;
}> = ({ label, value, onChange, type = 'text', required }) => (
    <div>
        <label className="block text-[11px] font-medium text-gray-500 mb-1.5">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
        />
    </div>
);

// ─── Expanded Row: Outreach + Billing ───────────────────────

const ExpandedSection: React.FC<{ partner: Partner }> = ({ partner }) => {
    const [outreachLogs, setOutreachLogs] = useState<OutreachLog[]>([]);
    const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
    const [loadingOutreach, setLoadingOutreach] = useState(true);
    const [loadingBilling, setLoadingBilling] = useState(true);

    // Outreach mini-form
    const [showOutreachForm, setShowOutreachForm] = useState(false);
    const [outreachMethod, setOutreachMethod] = useState('whatsapp');
    const [outreachContent, setOutreachContent] = useState('');
    const [submittingOutreach, setSubmittingOutreach] = useState(false);

    // Invoice form
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);
    const [invoiceStart, setInvoiceStart] = useState('');
    const [invoiceEnd, setInvoiceEnd] = useState('');
    const [generatingInvoice, setGeneratingInvoice] = useState(false);

    const fetchOutreach = useCallback(async () => {
        setLoadingOutreach(true);
        const { data } = await supabase
            .from('partner_outreach_logs')
            .select('*')
            .eq('partner_id', partner.id)
            .order('created_at', { ascending: false });
        setOutreachLogs((data as OutreachLog[]) || []);
        setLoadingOutreach(false);
    }, [partner.id]);

    const fetchBilling = useCallback(async () => {
        setLoadingBilling(true);
        const { data } = await supabase
            .from('partner_billing')
            .select('*')
            .eq('partner_id', partner.id)
            .order('period_start', { ascending: false });
        setBillingRecords((data as BillingRecord[]) || []);
        setLoadingBilling(false);
    }, [partner.id]);

    useEffect(() => {
        fetchOutreach();
        fetchBilling();
    }, [fetchOutreach, fetchBilling]);

    const handleAddOutreach = async () => {
        if (!outreachContent.trim()) return;
        setSubmittingOutreach(true);
        await supabase.from('partner_outreach_logs').insert({
            partner_id: partner.id,
            method: outreachMethod,
            content: outreachContent,
            status: 'sent',
        });
        setOutreachContent('');
        setShowOutreachForm(false);
        setSubmittingOutreach(false);
        fetchOutreach();
    };

    const handleGenerateInvoice = async () => {
        if (!invoiceStart || !invoiceEnd) return;
        setGeneratingInvoice(true);
        try {
            await fetch('/api/admin/partner-billing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${ADMIN_TOKEN}`,
                },
                body: JSON.stringify({
                    partner_id: partner.id,
                    period_start: invoiceStart,
                    period_end: invoiceEnd,
                }),
            });
            setShowInvoiceForm(false);
            setInvoiceStart('');
            setInvoiceEnd('');
            fetchBilling();
        } finally {
            setGeneratingInvoice(false);
        }
    };

    const handleMarkPaid = async (billingId: string) => {
        await fetch('/api/admin/partner-billing', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ADMIN_TOKEN}`,
            },
            body: JSON.stringify({ id: billingId, status: 'paid', paid_at: new Date().toISOString() }),
        });
        fetchBilling();
    };

    const methodLabels: Record<string, string> = {
        whatsapp: 'WhatsApp',
        email: 'אימייל',
        call: 'שיחה',
        'face-to-face': 'פגישה',
    };

    return (
        <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Outreach Log */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-gray-700 flex items-center gap-2">
                            <Send className="w-4 h-4 text-blue-500" />
                            יומן פניות
                        </h4>
                        <button
                            onClick={() => setShowOutreachForm(!showOutreachForm)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                        >
                            + הוסף פנייה
                        </button>
                    </div>

                    {showOutreachForm && (
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 mb-3 space-y-3">
                            <select
                                value={outreachMethod}
                                onChange={(e) => setOutreachMethod(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                            >
                                <option value="whatsapp">WhatsApp</option>
                                <option value="email">אימייל</option>
                                <option value="call">שיחה</option>
                                <option value="face-to-face">פגישה</option>
                            </select>
                            <textarea
                                value={outreachContent}
                                onChange={(e) => setOutreachContent(e.target.value)}
                                placeholder="תוכן הפנייה..."
                                rows={2}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs text-gray-900 placeholder:text-gray-400 outline-none resize-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowOutreachForm(false)}
                                    className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                                >
                                    ביטול
                                </button>
                                <button
                                    onClick={handleAddOutreach}
                                    disabled={submittingOutreach || !outreachContent.trim()}
                                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
                                >
                                    {submittingOutreach ? 'שומר...' : 'שמור'}
                                </button>
                            </div>
                        </div>
                    )}

                    {loadingOutreach ? (
                        <div className="text-center py-4"><Loader2 className="w-4 h-4 animate-spin text-blue-600 mx-auto" /></div>
                    ) : outreachLogs.length === 0 ? (
                        <div className="text-xs text-gray-400 text-center py-4 italic">אין פניות עדיין</div>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {outreachLogs.map((log) => (
                                <div key={log.id} className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[11px] font-semibold text-gray-700">
                                            {methodLabels[log.method] || log.method}
                                        </span>
                                        <span className="text-[10px] text-gray-400">{formatDate(log.created_at)}</span>
                                    </div>
                                    {log.content && (
                                        <p className="text-xs text-gray-600 leading-relaxed">{log.content}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Billing */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-gray-700 flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-green-500" />
                            חשבוניות
                        </h4>
                        <button
                            onClick={() => setShowInvoiceForm(!showInvoiceForm)}
                            className="text-xs text-green-600 hover:text-green-700 font-medium hover:bg-green-50 px-2 py-1 rounded transition-colors"
                        >
                            + ייצר חשבונית
                        </button>
                    </div>

                    {showInvoiceForm && (
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 mb-3 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] text-gray-500 mb-1">מתאריך</label>
                                    <input
                                        type="date"
                                        value={invoiceStart}
                                        onChange={(e) => setInvoiceStart(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-900 outline-none focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 mb-1">עד תאריך</label>
                                    <input
                                        type="date"
                                        value={invoiceEnd}
                                        onChange={(e) => setInvoiceEnd(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-900 outline-none focus:border-green-500"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowInvoiceForm(false)}
                                    className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                                >
                                    ביטול
                                </button>
                                <button
                                    onClick={handleGenerateInvoice}
                                    disabled={generatingInvoice || !invoiceStart || !invoiceEnd}
                                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium"
                                >
                                    {generatingInvoice ? 'מייצר...' : 'ייצר'}
                                </button>
                            </div>
                        </div>
                    )}

                    {loadingBilling ? (
                        <div className="text-center py-4"><Loader2 className="w-4 h-4 animate-spin text-green-600 mx-auto" /></div>
                    ) : billingRecords.length === 0 ? (
                        <div className="text-xs text-gray-400 text-center py-4 italic">אין חשבוניות עדיין</div>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {billingRecords.map((rec) => (
                                <div key={rec.id} className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[11px] font-semibold text-gray-700">
                                            {formatDate(rec.period_start)} - {formatDate(rec.period_end)}
                                        </span>
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rec.status === 'paid'
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                                }`}
                                        >
                                            {rec.status === 'paid' ? 'שולם' : 'ממתין'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">
                                            {rec.leads_count} לידים • <span className="font-mono">{formatCurrency(rec.amount)}</span>
                                        </span>
                                        {rec.status !== 'paid' && (
                                            <button
                                                onClick={() => handleMarkPaid(rec.id)}
                                                className="text-[10px] text-green-600 hover:text-green-800 font-medium bg-green-50 px-2 py-0.5 rounded hover:bg-green-100 transition-colors"
                                            >
                                                סמן כשולם
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Copy to clipboard helper ───────────────────────────────

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className="text-gray-500 hover:text-blue-400 transition-colors"
            title="העתק קישור פורטל"
        >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    );
};

// ─── Main Page ──────────────────────────────────────────────

export const PartnersPage: React.FC = () => {
    const { partners, loading, error, refresh, createPartner, updatePartner, deletePartner } = usePartners();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // KPI computations
    const activeCount = partners.filter((p) => p.status === 'active').length;
    const monthlyRevenue = partners.reduce((sum, p) => sum + (p.total_billed || 0), 0);
    const totalLeads = partners.reduce((sum, p) => sum + (p.leads_this_month || 0), 0);

    const handleCreate = async (data: PartnerCreateData) => {
        await createPartner(data);
    };

    const handleEdit = async (data: PartnerCreateData) => {
        if (!editingPartner) return;
        await updatePartner(editingPartner.id, data);
        setEditingPartner(null);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('למחוק שותף זה?')) return;
        setDeletingId(id);
        try {
            await deletePartner(id);
        } finally {
            setDeletingId(null);
        }
    };

    const portalUrl = (token: string) => `${window.location.origin}/client-portal?token=${token}`;

    return (
        <AdminShell title="שותפים">
            <div className="space-y-6">
                {/* KPI Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">שותפים פעילים</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">הכנסה חודשית</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyRevenue)}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">לידים שנמסרו</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{totalLeads}</div>
                    </div>
                </div>

                {/* Header row with Add button */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">תיק שותפים</h3>
                    <button
                        onClick={() => { setEditingPartner(null); setModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
                    >
                        <Plus className="w-4 h-4" />
                        הוסף שותף
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-4 py-3">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                ) : partners.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Building2 className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">אין שותפים עדיין</h3>
                        <p className="text-xs text-gray-500 mb-4">התחל ביצירת השותף הראשון שלך</p>
                        <button
                            onClick={() => { setEditingPartner(null); setModalOpen(true); }}
                            className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-xs px-4 py-2 transition-colors"
                        >
                            צור שותף חדש
                        </button>
                    </div>
                ) : (
                    /* Partners Table */
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-xs text-right">
                            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">שם</th>
                                    <th className="px-6 py-3">Tier</th>
                                    <th className="px-6 py-3">תקציב</th>
                                    <th className="px-6 py-3">סטטוס</th>
                                    <th className="px-6 py-3">פורטל</th>
                                    <th className="px-6 py-3">פעולות</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {partners.map((partner) => {
                                    const isExpanded = expandedId === partner.id;
                                    const sBadge = statusBadge[partner.status] || statusBadge.inactive;
                                    const tBadge = tierBadge[partner.tier || 'basic'] || tierBadge.basic;
                                    const budgetUsed = partner.total_billed || 0;
                                    const budgetTotal = partner.monthly_budget || 0;
                                    const budgetPct = budgetTotal > 0 ? Math.min(100, (budgetUsed / budgetTotal) * 100) : 0;

                                    return (
                                        <React.Fragment key={partner.id}>
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                {/* Name + Contact */}
                                                <td className="px-6 py-3">
                                                    <div className="font-bold text-gray-900 text-sm">{partner.name}</div>
                                                    {partner.contact_name && (
                                                        <div className="text-[11px] text-gray-500 mt-0.5">{partner.contact_name}</div>
                                                    )}
                                                    {partner.category && (
                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600 font-medium">
                                                            {categoryLabels[partner.category] || partner.category}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Tier */}
                                                <td className="px-6 py-3">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                                                        ${partner.tier === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                                                            partner.tier === 'premium' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-600'}`}>
                                                        {(partner.tier || 'basic')}
                                                    </span>
                                                </td>

                                                {/* Budget */}
                                                <td className="px-6 py-3">
                                                    {budgetTotal > 0 ? (
                                                        <div className="w-28">
                                                            <div className="flex justify-between text-[10px] mb-1">
                                                                <span className="font-medium text-gray-900">{formatCurrency(budgetUsed)}</span>
                                                                <span className="text-gray-400">{formatCurrency(budgetTotal)}</span>
                                                            </div>
                                                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all ${budgetPct >= 90 ? 'bg-red-500' : budgetPct >= 70 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                                                    style={{ width: `${budgetPct}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-400 italic">לא הוגדר</span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium
                                                        ${partner.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                            partner.status === 'potential' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                                                partner.status === 'contacted' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                                    'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${partner.status === 'active' ? 'bg-green-500' :
                                                            partner.status === 'potential' ? 'bg-yellow-500' :
                                                                partner.status === 'contacted' ? 'bg-blue-500' : 'bg-gray-400'
                                                            }`} />
                                                        {sBadge.label}
                                                    </span>
                                                </td>

                                                {/* Portal */}
                                                <td className="px-6 py-3">
                                                    {partner.portal_token ? (
                                                        <CopyButton text={portalUrl(partner.portal_token)} />
                                                    ) : (
                                                        <span className="text-[10px] text-gray-400">-</span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingPartner(partner);
                                                                setModalOpen(true);
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                                                            title="ערוך"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setExpandedId(isExpanded ? null : partner.id)}
                                                            className={`p-1 rounded transition-all ${isExpanded ? 'bg-gray-100 text-gray-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                                                            title={isExpanded ? 'סגור' : 'הרחב'}
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronUp className="w-4 h-4" />
                                                            ) : (
                                                                <ChevronDown className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(partner.id)}
                                                            disabled={deletingId === partner.id}
                                                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                                            title="מחק"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expanded section */}
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={6} className="p-0">
                                                        <ExpandedSection partner={partner} />
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Create Modal */}
                <PartnerFormModal
                    open={modalOpen && !editingPartner}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleCreate}
                    title="שותף חדש"
                />

                {/* Edit Modal */}
                {editingPartner && (
                    <PartnerFormModal
                        open={modalOpen && !!editingPartner}
                        onClose={() => { setModalOpen(false); setEditingPartner(null); }}
                        onSubmit={handleEdit}
                        initial={{
                            name: editingPartner.name,
                            contact_name: editingPartner.contact_name || '',
                            email: editingPartner.email || '',
                            phone: editingPartner.phone || '',
                            category: editingPartner.category || 'academic',
                            tier: editingPartner.tier || 'basic',
                            monthly_budget: editingPartner.monthly_budget ?? undefined,
                            price_per_lead: editingPartner.price_per_lead ?? undefined,
                            portal_type: editingPartner.portal_type || '',
                            billing_email: editingPartner.billing_email || '',
                            notes: editingPartner.notes || '',
                            status: editingPartner.status || 'potential',
                        }}
                        title={`עריכת ${editingPartner.name}`}
                    />
                )}
            </div>
        </AdminShell>
    );
};
