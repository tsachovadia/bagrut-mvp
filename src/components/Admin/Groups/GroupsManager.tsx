import React, { useState, useEffect } from 'react';
import {
    Users,
    Copy,
    Zap,
    Power,
    Send,
    CheckCircle2,
    X,
    Plus,
    Loader2,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
);

const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_API_TOKEN || import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

interface BotGroup {
    id: string;
    telegram_group_id: string;
    name: string;
    type: string;
    invite_link: string;
    description: string | null;
    field_tags: string[];
    member_count: number;
    is_active: boolean;
    auto_moderate: boolean;
}

interface BaitTemplate {
    id: string;
    title: string;
    content: string;
    type: 'urgent' | 'info' | 'promo';
}

const baitTemplates: BaitTemplate[] = [
    { id: '1', title: 'מלגות הרשמה', content: 'חבר׳ה שימו לב - נפתחה ההרשמה למלגות דיקן. אל תפספסו, זה עד ה-15 לחודש!', type: 'urgent' },
    { id: '2', title: 'ערעור על ציונים', content: 'מי שקיבל ציון ולא מרוצה - הכנו מדריך קצר איך לערער בחוכמה. שלחו לי הודעה בפרטי אם רלוונטי.', type: 'info' },
    { id: '3', title: 'רוצים סימולציה?', content: 'פתחנו עוד מקומות לסימולציית הראיונות. מי שרוצה לתפוס מקום שיגיב ״אני״.', type: 'promo' },
];

const typeLabels: Record<string, string> = {
    general: 'כללי',
    field: 'תחום',
    stage: 'שלב',
};

export const GroupsManager = () => {
    const [groups, setGroups] = useState<BotGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeBaitGroupId, setActiveBaitGroupId] = useState<string | null>(null);
    const [sendingBait, setSendingBait] = useState<string | null>(null);
    const [lastAction, setLastAction] = useState<{ groupId: string; baitName: string } | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', type: 'general', telegram_group_id: '', invite_link: '', description: '' });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, []);

    async function fetchGroups() {
        const { data } = await supabase
            .from('bot_groups')
            .select('*')
            .order('is_active', { ascending: false })
            .order('name');

        setGroups((data as BotGroup[]) || []);
        setLoading(false);
    }

    const handleInjectBait = async (groupId: string, bait: BaitTemplate) => {
        setSendingBait(bait.id);
        try {
            const res = await fetch('/api/telegram-rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                },
                body: JSON.stringify({
                    action: 'send_to_room',
                    room_id: groupId,
                    message: bait.content,
                }),
            });
            const data = (await res.json()) as { ok?: boolean };
            if (data.ok) {
                setLastAction({ groupId, baitName: bait.title });
                setTimeout(() => setLastAction(null), 3000);
            }
        } finally {
            setSendingBait(null);
            setActiveBaitGroupId(null);
        }
    };

    const handleToggleActive = async (group: BotGroup) => {
        const res = await fetch('/api/telegram-rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
            },
            body: JSON.stringify({
                action: 'update_room',
                room_id: group.id,
                updates: { is_active: !group.is_active },
            }),
        });
        const data = (await res.json()) as { ok?: boolean };
        if (data.ok) {
            setGroups(prev => prev.map(g => g.id === group.id ? { ...g, is_active: !g.is_active } : g));
        }
    };

    const handleCopyLink = (link: string) => {
        navigator.clipboard.writeText(link);
    };

    const handleCreateRoom = async () => {
        if (!createForm.name || !createForm.telegram_group_id || !createForm.invite_link) return;
        setCreating(true);
        try {
            const res = await fetch('/api/telegram-rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                },
                body: JSON.stringify({
                    action: 'create_room',
                    ...createForm,
                }),
            });
            const data = (await res.json()) as { ok?: boolean };
            if (data.ok) {
                setShowCreateForm(false);
                setCreateForm({ name: '', type: 'general', telegram_group_id: '', invite_link: '', description: '' });
                fetchGroups();
            }
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-sm font-bold text-gray-800">קהילות Telegram</h2>
                    <p className="text-xs text-gray-500">ניהול חדרי לימוד, הפצת תוכן ומעקב</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    צור חדר חדש
                </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <h3 className="text-xs font-bold text-blue-800">חדר חדש</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            placeholder="שם החדר"
                            value={createForm.name}
                            onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                            className="text-xs px-2 py-1.5 border rounded"
                        />
                        <select
                            value={createForm.type}
                            onChange={e => setCreateForm(f => ({ ...f, type: e.target.value }))}
                            className="text-xs px-2 py-1.5 border rounded"
                        >
                            <option value="general">כללי</option>
                            <option value="field">תחום</option>
                            <option value="stage">שלב</option>
                        </select>
                        <input
                            placeholder="Telegram Group ID"
                            value={createForm.telegram_group_id}
                            onChange={e => setCreateForm(f => ({ ...f, telegram_group_id: e.target.value }))}
                            className="text-xs px-2 py-1.5 border rounded"
                        />
                        <input
                            placeholder="Invite Link"
                            value={createForm.invite_link}
                            onChange={e => setCreateForm(f => ({ ...f, invite_link: e.target.value }))}
                            className="text-xs px-2 py-1.5 border rounded"
                        />
                    </div>
                    <input
                        placeholder="תיאור (אופציונלי)"
                        value={createForm.description}
                        onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                        className="text-xs px-2 py-1.5 border rounded w-full"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreateRoom}
                            disabled={creating}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3 py-1.5 rounded text-xs font-medium"
                        >
                            {creating ? 'יוצר...' : 'צור'}
                        </button>
                        <button
                            onClick={() => setShowCreateForm(false)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded text-xs"
                        >
                            ביטול
                        </button>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {lastAction && (
                <div className="fixed bottom-4 left-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg text-xs flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in z-50">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>תוכן "<b>{lastAction.baitName}</b>" נשלח לחדר בהצלחה</span>
                </div>
            )}

            {groups.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                    אין חדרים עדיין. צור חדר חדש כדי להתחיל.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {groups.map((group) => (
                        <div key={group.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all p-3 relative group/card">

                            {/* Status Dot */}
                            <div className={`absolute top-3 left-3 w-2 h-2 rounded-full ${group.is_active ? 'bg-green-500' : 'bg-gray-300'}`} title={group.is_active ? 'פעיל' : 'לא פעיל'} />

                            <div className="mb-2.5">
                                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-0.5 pl-3">{group.name}</h3>
                                <div className="text-gray-400 text-[10px] flex items-center gap-1.5">
                                    <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[9px] font-medium">
                                        {typeLabels[group.type] || group.type}
                                    </span>
                                    {group.description && (
                                        <span className="truncate">{group.description}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-1 text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded text-[10px] font-medium border border-gray-100">
                                    <Users className="w-3 h-3 text-gray-400" />
                                    {group.member_count}
                                </div>
                                {group.field_tags?.length > 0 && (
                                    <div className="flex gap-1 overflow-hidden">
                                        {group.field_tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Standard Actions */}
                            {activeBaitGroupId !== group.id ? (
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleCopyLink(group.invite_link)}
                                        className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 rounded text-xs font-medium transition-all"
                                    >
                                        <Copy className="w-3 h-3 text-gray-400" />
                                        העתק
                                    </button>

                                    <button
                                        onClick={() => setActiveBaitGroupId(group.id)}
                                        className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-700 rounded text-xs font-medium transition-colors"
                                    >
                                        <Zap className="w-3 h-3" />
                                        שלח תוכן
                                    </button>
                                </div>
                            ) : (
                                /* Content Selection Mode */
                                <div className="space-y-2 bg-red-50 p-2 rounded border border-red-100 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center text-[10px] text-red-800 font-medium mb-1">
                                        <span>בחר תוכן לשליחה:</span>
                                        <button onClick={() => setActiveBaitGroupId(null)} className="p-0.5 hover:bg-red-200 rounded">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        {baitTemplates.map(bait => (
                                            <button
                                                key={bait.id}
                                                onClick={() => handleInjectBait(group.id, bait)}
                                                disabled={!!sendingBait}
                                                className="w-full text-right px-2 py-1.5 bg-white hover:bg-red-100 border border-red-100 rounded text-[10px] text-gray-700 hover:text-red-900 transition-colors flex items-center justify-between"
                                            >
                                                <span className="truncate">{bait.title}</span>
                                                {sendingBait === bait.id ? (
                                                    <div className="w-2.5 h-2.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Send className="w-2.5 h-2.5 text-red-300" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-2.5 pt-2 border-t border-gray-50 flex justify-between items-center">
                                <span className="text-[10px] text-gray-300 truncate max-w-[120px]">ID: {group.telegram_group_id}</span>
                                <button
                                    onClick={() => handleToggleActive(group)}
                                    className={`${group.is_active ? 'text-green-500 hover:text-red-500' : 'text-gray-300 hover:text-green-500'} transition-colors`}
                                    title={group.is_active ? 'כבה' : 'הפעל'}
                                >
                                    <Power className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
