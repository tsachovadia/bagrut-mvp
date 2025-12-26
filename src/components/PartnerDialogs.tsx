import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Partner, PartnerStatus } from '../types/supabase';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    Button, Input, Label, Textarea
} from './ui/shim';
import { Loader2 } from 'lucide-react';

interface PartnerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    partner: Partner | null;
}

export const PartnerDialog: React.FC<PartnerDialogProps> = ({ isOpen, onClose, onSuccess, partner }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        contact_name: '',
        email: '',
        phone: '',
        website: '',
        category: '',
        status: 'potential' as PartnerStatus,
        notes: ''
    });

    useEffect(() => {
        if (partner) {
            setFormData({
                name: partner.name,
                contact_name: partner.contact_name || '',
                email: partner.email || '',
                phone: partner.phone || '',
                website: partner.website || '',
                category: partner.category || '',
                status: partner.status,
                notes: partner.notes || ''
            });
        } else {
            setFormData({
                name: '',
                contact_name: '',
                email: '',
                phone: '',
                website: '',
                category: '',
                status: 'potential',
                notes: ''
            });
        }
    }, [partner, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = partner
            ? await supabase.from('partners').update(formData).eq('id', partner.id)
            : await supabase.from('partners').insert([formData]);

        if (!error) {
            onSuccess();
            onClose();
        } else {
            console.error('Error saving partner:', error);
            alert('שגיאה בשמירת הפרטנר');
        }
        setLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{partner ? 'ערוך פרטנר' : 'הוסף פרטנר חדש'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>שם הפרטנר *</Label>
                            <Input
                                required
                                value={formData.name}
                                onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>קטגוריה</Label>
                            <Input
                                placeholder="למשל: אקדמי, משפיען"
                                value={formData.category}
                                onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>איש קשר</Label>
                            <Input
                                value={formData.contact_name}
                                onChange={(e: any) => setFormData({ ...formData, contact_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>סטטוס</Label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.status}
                                onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="potential">פוטנציאלי</option>
                                <option value="contacted">בוצעה פנייה</option>
                                <option value="active">פעיל</option>
                                <option value="inactive">לא פעיל</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>טלפון</Label>
                            <Input
                                value={formData.phone}
                                onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>אימייל</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>אתר אינטרנט</Label>
                        <Input
                            placeholder="https://..."
                            value={formData.website}
                            onChange={(e: any) => setFormData({ ...formData, website: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>הערות</Label>
                        <Textarea
                            rows={3}
                            value={formData.notes}
                            onChange={(e: any) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" type="button" onClick={onClose}>ביטול</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                            שמור
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

interface OutreachDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    partner: Partner;
}

export const OutreachDialog: React.FC<OutreachDialogProps> = ({ isOpen, onClose, onSuccess, partner }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        method: 'whatsapp' as any,
        content: '',
        status: 'sent' as any
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.from('partner_outreach_logs').insert([{
            partner_id: partner.id,
            ...formData
        }]);

        if (!error) {
            // Also update partner status if it was 'potential'
            if (partner.status === 'potential') {
                await supabase.from('partners').update({ status: 'contacted' }).eq('id', partner.id);
            }
            onSuccess();
            onClose();
            setFormData({ method: 'whatsapp', content: '', status: 'sent' });
        } else {
            console.error('Error logging outreach:', error);
            alert('שגיאה בתיעוד הפנייה');
        }
        setLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>תיעוד פנייה ל-{partner?.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>שיטת פנייה</Label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.method}
                                onChange={(e: any) => setFormData({ ...formData, method: e.target.value })}
                            >
                                <option value="whatsapp">WhatsApp</option>
                                <option value="email">Email</option>
                                <option value="call">טלפון</option>
                                <option value="face-to-face">פגישה</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>סטטוס פנייה</Label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.status}
                                onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="sent">נשלח / בוצע</option>
                                <option value="replied">התקבל מענה</option>
                                <option value="ignored">לא רלוונטי כרגע</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>תוכן הפנייה / סיכום</Label>
                        <Textarea
                            required
                            rows={4}
                            placeholder="מה נאמר בפנייה? מה סוכם?"
                            value={formData.content}
                            onChange={(e: any) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" type="button" onClick={onClose}>ביטול</Button>
                        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                            תעד פנייה
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
