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
    MessageSquare,
    Hash,
    Megaphone,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
    is_forum: boolean;
    forum_topic_id: number | null;
    parent_group_id: string | null;
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
    const [activeBaitId, setActiveBaitId] = useState<string | null>(null);
    const [sendingBait, setSendingBait] = useState<string | null>(null);
    const [lastAction, setLastAction] = useState<{ name: string; action: string } | null>(null);
    const [showCreateTopic, setShowCreateTopic] = useState(false);
    const [topicForm, setTopicForm] = useState({ name: '', type: 'field', description: '', field_tags: '' });
    const [creating, setCreating] = useState(false);
    const [showBroadcast, setShowBroadcast] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcasting, setBroadcasting] = useState(false);

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

    // Separate forum parent, topics, and legacy groups
    const forumParent = groups.find(g => g.is_forum && !g.forum_topic_id);
    const topics = groups.filter(g => g.forum_topic_id !== null);
    const legacyGroups = groups.filter(g => !g.is_forum && g.forum_topic_id === null);

    const handleSendContent = async (groupId: string, bait: BaitTemplate, isTopic: boolean) => {
        setSendingBait(bait.id);
        try {
            const res = await fetch('/api/telegram-rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                },
                body: JSON.stringify({
                    action: isTopic ? 'send_to_topic' : 'send_to_room',
                    [isTopic ? 'topic_id' : 'room_id']: groupId,
                    message: bait.content,
                }),
            });
            const data = (await res.json()) as { ok?: boolean };
            if (data.ok) {
                setLastAction({ name: bait.title, action: 'נשלח בהצלחה' });
                setTimeout(() => setLastAction(null), 3000);
            }
        } finally {
            setSendingBait(null);
            setActiveBaitId(null);
        }
    };

    const handleToggleTopic = async (topic: BotGroup) => {
        const action = topic.is_active ? 'close_topic' : 'reopen_topic';
        const res = await fetch('/api/telegram-rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
            },
            body: JSON.stringify({ action, topic_id: topic.id }),
        });
        const data = (await res.json()) as { ok?: boolean };
        if (data.ok) {
            setGroups(prev => prev.map(g => g.id === topic.id ? { ...g, is_active: !g.is_active } : g));
        }
    };

    const handleToggleGroup = async (group: BotGroup) => {
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
        setLastAction({ name: 'קישור', action: 'הועתק' });
        setTimeout(() => setLastAction(null), 2000);
    };

    const handleCreateTopic = async () => {
        if (!forumParent || !topicForm.name) return;
        setCreating(true);
        try {
            const res = await fetch('/api/telegram-rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                },
                body: JSON.stringify({
                    action: 'create_topic',
                    parent_group_id: forumParent.id,
                    name: topicForm.name,
                    type: topicForm.type,
                    description: topicForm.description || null,
                    field_tags: topicForm.field_tags ? topicForm.field_tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                }),
            });
            const data = (await res.json()) as { ok?: boolean };
            if (data.ok) {
                setShowCreateTopic(false);
                setTopicForm({ name: '', type: 'field', description: '', field_tags: '' });
                fetchGroups();
                setLastAction({ name: topicForm.name, action: 'נושא נוצר' });
                setTimeout(() => setLastAction(null), 3000);
            }
        } finally {
            setCreating(false);
        }
    };

    const handleBroadcast = async () => {
        if (!broadcastMessage) return;
        setBroadcasting(true);
        try {
            const res = await fetch('/api/telegram-rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                },
                body: JSON.stringify({
                    action: 'broadcast_to_topics',
                    message: broadcastMessage,
                    // Optional: topic_type, exclude_topic_ids can be added here if we add UI filters
                }),
            });
            const data = (await res.json()) as { ok?: boolean; sent_count?: number };
            if (data.ok) {
                setShowBroadcast(false);
                setBroadcastMessage('');
                setLastAction({ name: 'Broadcast', action: `נשלח ל-${data.sent_count} נושאים` });
                setTimeout(() => setLastAction(null), 3000);
            }
        } finally {
            setBroadcasting(false);
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
        <div className="space-y-6">
            {/* Toast */}
            {lastAction && (
                <div className="fixed bottom-4 left-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg text-xs flex items-center gap-2 z-50">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>{lastAction.name} - {lastAction.action}</span>
                </div>
            )}

            {/* Forum Section */}
            {forumParent ? (
                <div className="space-y-4">
                    {/* Forum Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <MessageSquare className="w-4 h-4 text-blue-600" />
                                    <h2 className="text-sm font-bold text-gray-800">{forumParent.name}</h2>
                                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-medium">Forum</span>
                                    <div className={`w-2 h-2 rounded-full ${forumParent.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                                </div>
                                <p className="text-xs text-gray-500">
                                    סופרגרופ עם נושאים | {topics.length} נושאים פעילים |
                                    <span className="text-gray-400 mr-1">ID: {forumParent.telegram_group_id}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowBroadcast(!showBroadcast)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors"
                                >
                                    <Megaphone className="w-3 h-3" />
                                    שידור לכולם
                                </button>
                                {forumParent.invite_link && (
                                    <button
                                        onClick={() => handleCopyLink(forumParent.invite_link)}
                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-600 rounded text-xs transition-all"
                                    >
                                        <Copy className="w-3 h-3" />
                                        העתק לינק
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowCreateTopic(!showCreateTopic)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                                >
                                    <Plus className="w-3 h-3" />
                                    נושא חדש
                                </button>
                            </div>
                        </div>

                        {/* Member count */}
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                            <Users className="w-3 h-3" />
                            {forumParent.member_count} חברים בקהילה
                        </div>
                    </div>



                    {/* Broadcast Form */}
                    {showBroadcast && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                            <h3 className="text-xs font-bold text-purple-800 flex items-center gap-1.5">
                                <Megaphone className="w-3.5 h-3.5" />
                                שידור הודעה לכל הנושאים הפעילים ({topics.filter(t => t.is_active).length})
                            </h3>
                            <textarea
                                placeholder="הקלד הודעה לשידור..."
                                value={broadcastMessage}
                                onChange={e => setBroadcastMessage(e.target.value)}
                                className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg w-full h-20 resize-none outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 placeholder:text-gray-400"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleBroadcast}
                                    disabled={broadcasting || !broadcastMessage}
                                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all shadow-sm"
                                >
                                    {broadcasting ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            שולח...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-3.5 h-3.5" />
                                            שדר לכולם
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowBroadcast(false)}
                                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                                >
                                    ביטול
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500">
                                ההודעה תישלח בנפרד לכל נושא פעיל ברשימה. פעולה זו עשויה לקחת מספר שניות.
                            </p>
                        </div>
                    )}
                    {showCreateTopic && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                            <h3 className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                                <Hash className="w-3.5 h-3.5" />
                                נושא חדש בפורום
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    placeholder="שם הנושא (למשל: מדעי המחשב 2026)"
                                    value={topicForm.name}
                                    onChange={e => setTopicForm(f => ({ ...f, name: e.target.value }))}
                                    className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg col-span-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
                                />
                                <select
                                    value={topicForm.type}
                                    onChange={e => setTopicForm(f => ({ ...f, type: e.target.value }))}
                                    className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
                                >
                                    <option value="general">כללי</option>
                                    <option value="field">תחום לימוד</option>
                                    <option value="stage">שלב (שנה)</option>
                                </select>
                                <input
                                    placeholder="תגיות (מופרדות בפסיק)"
                                    value={topicForm.field_tags}
                                    onChange={e => setTopicForm(f => ({ ...f, field_tags: e.target.value }))}
                                    className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
                            <input
                                placeholder="תיאור קצר (אופציונלי)"
                                value={topicForm.description}
                                onChange={e => setTopicForm(f => ({ ...f, description: e.target.value }))}
                                className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCreateTopic}
                                    disabled={creating || !topicForm.name}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all shadow-sm"
                                >
                                    {creating ? 'יוצר נושא...' : 'צור נושא בטלגרם'}
                                </button>
                                <button
                                    onClick={() => setShowCreateTopic(false)}
                                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                                >
                                    ביטול
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500">
                                הנושא ייווצר אוטומטית בטלגרם דרך ה-Bot API
                            </p>
                        </div>
                    )}

                    {/* Topics Grid */}
                    {topics.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 text-xs border border-dashed border-gray-200 rounded-lg">
                            אין נושאים עדיין. צור נושא חדש כדי להתחיל.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {topics.map((topic) => (
                                <TopicCard
                                    key={topic.id}
                                    topic={topic}
                                    activeBaitId={activeBaitId}
                                    sendingBait={sendingBait}
                                    onSendContent={(bait) => handleSendContent(topic.id, bait, true)}
                                    onToggle={() => handleToggleTopic(topic)}
                                    onOpenBait={() => setActiveBaitId(topic.id)}
                                    onCloseBait={() => setActiveBaitId(null)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                    <MessageSquare className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-amber-800 mb-1">אין פורום מחובר</p>
                    <p className="text-xs text-amber-600">
                        צור סופרגרופ בטלגרם עם Topics מופעל, הוסף את @MitlabtimBot כאדמין, והמערכת תזהה אותו אוטומטית.
                    </p>
                </div>
            )
            }

            {/* Legacy Groups Section */}
            {
                legacyGroups.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">קבוצות נוספות (ללא Forum)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {legacyGroups.map((group) => (
                                <div key={group.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 relative opacity-75">
                                    <div className={`absolute top-3 left-3 w-2 h-2 rounded-full ${group.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    <h3 className="font-bold text-gray-900 text-sm leading-tight mb-0.5 pl-3">{group.name}</h3>
                                    <div className="text-gray-400 text-[10px] flex items-center gap-1.5 mb-2">
                                        <span className="bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded text-[9px]">
                                            {typeLabels[group.type] || group.type}
                                        </span>
                                        <Users className="w-3 h-3" />
                                        {group.member_count}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        {group.invite_link && (
                                            <button
                                                onClick={() => handleCopyLink(group.invite_link)}
                                                className="text-[10px] text-gray-400 hover:text-blue-500 flex items-center gap-1"
                                            >
                                                <Copy className="w-3 h-3" />
                                                העתק
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleToggleGroup(group)}
                                            className={`${group.is_active ? 'text-green-500 hover:text-red-500' : 'text-gray-300 hover:text-green-500'} transition-colors`}
                                        >
                                            <Power className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

// ============================
// Topic Card Component
// ============================

function TopicCard({
    topic,
    activeBaitId,
    sendingBait,
    onSendContent,
    onToggle,
    onOpenBait,
    onCloseBait,
}: {
    topic: BotGroup;
    activeBaitId: string | null;
    sendingBait: string | null;
    onSendContent: (bait: BaitTemplate) => void;
    onToggle: () => void;
    onOpenBait: () => void;
    onCloseBait: () => void;
}) {
    const icon = topic.type === 'field' ? '💻' : topic.type === 'stage' ? '📅' : '🏠';

    return (
        <div className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-all p-3 relative ${topic.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
            {/* Status */}
            <div className={`absolute top-3 left-3 w-2 h-2 rounded-full ${topic.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />

            <div className="mb-2">
                <h4 className="font-bold text-gray-900 text-sm leading-tight mb-0.5 pl-3 flex items-center gap-1.5">
                    <span>{icon}</span>
                    {topic.name}
                </h4>
                <div className="text-gray-400 text-[10px] flex items-center gap-1.5">
                    <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[9px] font-medium flex items-center gap-0.5">
                        <Hash className="w-2.5 h-2.5" />
                        {typeLabels[topic.type] || topic.type}
                    </span>
                    {topic.description && (
                        <span className="truncate">{topic.description}</span>
                    )}
                </div>
            </div>

            {/* Tags */}
            {topic.field_tags?.length > 0 && (
                <div className="flex gap-1 mb-2 overflow-hidden">
                    {topic.field_tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Actions */}
            {activeBaitId !== topic.id ? (
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={onOpenBait}
                        className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-700 rounded text-xs font-medium transition-colors"
                    >
                        <Zap className="w-3 h-3" />
                        שלח תוכן
                    </button>
                    <button
                        onClick={onToggle}
                        className={`flex items-center justify-center gap-1.5 w-full py-1.5 rounded text-xs font-medium transition-colors ${topic.is_active
                            ? 'bg-gray-50 hover:bg-red-50 border border-gray-200 text-gray-600 hover:text-red-600'
                            : 'bg-green-50 hover:bg-green-100 border border-green-200 text-green-700'
                            }`}
                    >
                        <Power className="w-3 h-3" />
                        {topic.is_active ? 'סגור' : 'פתח'}
                    </button>
                </div>
            ) : (
                <div className="space-y-2 bg-red-50 p-2 rounded border border-red-100">
                    <div className="flex justify-between items-center text-[10px] text-red-800 font-medium mb-1">
                        <span>בחר תוכן לשליחה:</span>
                        <button onClick={onCloseBait} className="p-0.5 hover:bg-red-200 rounded">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="space-y-1">
                        {baitTemplates.map(bait => (
                            <button
                                key={bait.id}
                                onClick={() => onSendContent(bait)}
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

            <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between items-center">
                <span className="text-[10px] text-gray-300">Topic #{topic.forum_topic_id}</span>
            </div>
        </div>
    );
}
