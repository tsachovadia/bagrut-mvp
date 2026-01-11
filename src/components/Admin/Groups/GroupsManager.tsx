import React, { useState } from 'react';
import {
    Users,
    MessageSquare,
    Copy,
    MoreHorizontal,
    Zap,
    Power,
    Send,
    CheckCircle2,
    X
} from 'lucide-react';

interface BaitTemplate {
    id: string;
    title: string;
    content: string;
    type: 'urgent' | 'info' | 'promo';
}

const baitTemplates: BaitTemplate[] = [
    { id: '1', title: 'מלגות הרשמה', content: 'חבר׳ה שימו לב - נפתחה ההרשמה למלגות דיקן. אל תפספסו, זה עד ה-15 לחודש!', type: 'urgent' },
    { id: '2', title: 'ערעור על ציונים', content: 'מי שקיבל ציון ולא מרוצה - הכנו מדריך קצר איך לערער בחוכמה. שלחו לי הודעה בפרטי אם רלוונטי.', type: 'info' },
    { id: '3', title: 'רוצים סימולציה?', content: 'פתחנו עוד מקומות לסימולציית הראיונות. מי שרוצה לתפוס מקום שיגיב ״אני״.', type: 'promo' }
];

export const GroupsManager = () => {
    const [activeBaitGroupId, setActiveBaitGroupId] = useState<number | null>(null);
    const [sendingBait, setSendingBait] = useState<string | null>(null);
    const [lastAction, setLastAction] = useState<{ groupId: number, baitName: string } | null>(null);

    const groups = [
        {
            id: 1,
            name: 'מחשבון בגרויות - הנדסה ב״ג 2026',
            members: 142,
            active: true,
            lastActivity: 'לפני 2 דק׳',
            tags: ['הנדסה', 'בן גוריון'],
            inviteLink: 'https://chat.whatsapp.com/Bsdf82...'
        },
        {
            id: 2,
            name: 'שיפור בגרויות - חורף 2026',
            members: 89,
            active: true,
            lastActivity: 'לפני 45 דק׳',
            tags: ['שיפור ציונים', 'כללי'],
            inviteLink: 'https://chat.whatsapp.com/Kls92...'
        },
        {
            id: 3,
            name: 'מועמדים לרפואה - תל אביב',
            members: 204,
            active: false,
            lastActivity: 'לפני 5 שעות',
            tags: ['רפואה', 'תל אביב'],
            inviteLink: 'https://chat.whatsapp.com/Md92...'
        }
    ];

    const handleInjectBait = (groupId: number, bait: BaitTemplate) => {
        setSendingBait(bait.id);
        setTimeout(() => {
            setSendingBait(null);
            setActiveBaitGroupId(null);
            setLastAction({ groupId, baitName: bait.title });
            // Clear success message after 3 seconds
            setTimeout(() => setLastAction(null), 3000);
        }, 800);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-sm font-bold text-gray-800">קהילות WhatsApp</h2>
                    <p className="text-xs text-gray-500">ניהול רשת הקבוצות, הפצת הזמנות והפעלת בוטים</p>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                    צור קבוצה חדשה
                </button>
            </div>

            {/* Notification Toast */}
            {lastAction && (
                <div className="fixed bottom-4 left-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg text-xs flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>פיתיון "<b>{lastAction.baitName}</b>" נשלח לקבוצה בהצלחה</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {groups.map((group) => (
                    <div key={group.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all p-3 relative group">

                        {/* Status Dot */}
                        <div className={`absolute top-3 left-3 w-2 h-2 rounded-full ${group.active ? 'bg-green-500' : 'bg-gray-300'}`} title={group.active ? 'בוט מחובר' : 'בוט מנותק'} />

                        <div className="mb-2.5">
                            <h3 className="font-bold text-gray-900 text-sm leading-tight mb-0.5 pl-3">{group.name}</h3>
                            <div className="text-gray-400 text-[10px] flex items-center gap-1.5">
                                <span>פעילות: {group.lastActivity}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1 text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded text-[10px] font-medium border border-gray-100">
                                <Users className="w-3 h-3 text-gray-400" />
                                {group.members}
                            </div>
                            <div className="flex gap-1 overflow-hidden">
                                {group.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Standard Actions */}
                        {activeBaitGroupId !== group.id ? (
                            <div className="grid grid-cols-2 gap-2">
                                <button className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 rounded text-xs font-medium transition-all group/btn">
                                    <Copy className="w-3 h-3 text-gray-400 group-hover/btn:text-blue-500" />
                                    העתק
                                </button>

                                <button
                                    onClick={() => setActiveBaitGroupId(group.id)}
                                    className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-700 rounded text-xs font-medium transition-colors"
                                >
                                    <Zap className="w-3 h-3" />
                                    פיתיון
                                </button>
                            </div>
                        ) : (
                            /* Bait Selection Mode */
                            <div className="space-y-2 bg-red-50 p-2 rounded border border-red-100 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex justify-between items-center text-[10px] text-red-800 font-medium mb-1">
                                    <span>בחר פיתיון לשליחה:</span>
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
                                                <Send className="w-2.5 h-2.5 text-red-300 opacity-0 group-hover:opacity-100" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-2.5 pt-2 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-[10px] text-gray-300">ID: ...{group.id}93</span>
                            <button className="text-gray-300 hover:text-gray-600">
                                <Power className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
