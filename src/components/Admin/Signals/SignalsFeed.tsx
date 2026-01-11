import React, { useState } from 'react';
import {
    MessageCircle,
    Smartphone,
    AlertTriangle,
    CheckCircle2,
    Clock,
    ArrowLeft,
    Filter,
    MoreVertical
} from 'lucide-react';

export const SignalsFeed = () => {
    const [activeTab, setActiveTab] = useState<'whatsapp' | 'app'>('whatsapp');

    // Mock Signals - WhatsApp
    const whatsappSignals = [
        {
            id: 1,
            user: '054-922-1923 (עומרי)',
            group: 'הנדסה בן גוריון 2026',
            message: 'חבר׳ה מישהו יודע אם הציון פסיכומטרי משפיע על קבלה למעונות?',
            type: 'question',
            priority: 'high',
            intent: 'מעונות',
            timestamp: 'לפני 2 דק׳',
            status: 'new'
        },
        {
            id: 2,
            user: '052-XXX-XXXX',
            group: 'שיפור בגרויות חורף',
            message: 'חייב המלצה למכון פסיכומטרי, יואל גבע או קידום?',
            type: 'lead',
            priority: 'critical',
            intent: 'פסיכומטרי',
            timestamp: 'לפני 15 דק׳',
            status: 'pending'
        },
        {
            id: 3,
            user: '050-111-2222',
            group: 'מדעי המחשב כללי',
            message: 'מתי נפתח הרישום לסמסטר אביב?',
            type: 'question',
            priority: 'medium',
            intent: 'רישום',
            timestamp: 'לפני 45 דק׳',
            status: 'handled'
        }
    ];

    // Mock Signals - App
    const appSignals = [
        {
            id: 101,
            user: 'משתמש חדש',
            action: 'חישוב סכם - הנדסת חשמל',
            details: 'בגרות: 108, פסיכומטרי: 680',
            timestamp: 'עכשיו',
            institution: 'בן גוריון'
        },
        {
            id: 102,
            user: 'דניאל כהן',
            action: 'ביקור חוזר',
            details: 'צפה בעמוד "תנאי קבלה לרפואה"',
            timestamp: 'לפני 5 דק׳',
            institution: 'תל אביב'
        }
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-110px)] flex flex-col">
            {/* Header & Tabs */}
            <div className="border-b border-gray-100 bg-white">
                <div className="px-4 py-2.5 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Live Signals
                    </h2>
                    <button className="p-1 hover:bg-gray-50 rounded text-gray-400">
                        <Filter className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="flex px-4 gap-4">
                    <button
                        onClick={() => setActiveTab('whatsapp')}
                        className={`pb-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'whatsapp'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp Actions
                        <span className="bg-blue-50 text-blue-700 px-1 rounded text-[10px] font-bold">12</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('app')}
                        className={`pb-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'app'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Smartphone className="w-3.5 h-3.5" />
                        App Activity
                        <span className="bg-gray-100 text-gray-600 px-1 rounded text-[10px] font-bold">5</span>
                    </button>
                </div>
            </div>

            {/* Feed Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/50">

                {activeTab === 'whatsapp' && whatsappSignals.map((signal) => (
                    <div key={signal.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow group relative">
                        <div className="flex justify-between items-start mb-1.5">
                            <div className="flex items-center gap-1.5">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${signal.priority === 'critical' ? 'bg-red-50 text-red-700' :
                                    signal.priority === 'high' ? 'bg-orange-50 text-orange-700' :
                                        'bg-blue-50 text-blue-700'
                                    }`}>
                                    {signal.intent}
                                </span>
                                <span className="text-gray-300 text-[10px]">•</span>
                                <span className="text-gray-500 text-[10px] font-medium">{signal.group}</span>
                            </div>
                            <span className="text-gray-400 text-[10px] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {signal.timestamp}
                            </span>
                        </div>

                        <div className="mb-2">
                            <div className="text-gray-900 font-medium text-xs mb-0.5">{signal.user}</div>
                            <div className="text-gray-600 bg-gray-50/50 p-2 rounded text-xs border border-gray-100/50">
                                "{signal.message}"
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-gray-50">
                            <div className="flex gap-1.5">
                                <button className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 font-medium transition-colors">
                                    צור ליד
                                </button>
                                <button className="text-[10px] border border-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-50 font-medium transition-colors">
                                    השב בפרטי
                                </button>
                            </div>
                            <button className="text-gray-300 hover:text-gray-500">
                                <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}

                {activeTab === 'app' && appSignals.map((signal) => (
                    <div key={signal.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Smartphone className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-medium text-gray-900 text-xs">{signal.user}</span>
                                    <span className="text-gray-300 text-[10px]">•</span>
                                    <span className="text-indigo-600 text-[10px] font-medium bg-indigo-50 px-1 rounded">{signal.institution}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                    <span className="font-medium text-gray-700">{signal.action}</span> - <span className="text-[10px]">{signal.details}</span>
                                </div>
                            </div>
                        </div>
                        <span className="text-gray-400 text-[10px] whitespace-nowrap">{signal.timestamp}</span>
                    </div>
                ))}

            </div>
        </div>
    );
};
