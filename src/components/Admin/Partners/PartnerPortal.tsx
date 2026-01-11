import React from 'react';
import {
    Building2,
    TrendingUp,
    Download,
    ExternalLink,
    PieChart
} from 'lucide-react';

export const PartnerPortal = () => {
    const partners = [
        {
            id: 1,
            name: 'המכללה האקדמית סמי שמעון',
            contact: 'רונית כהן',
            tier: 'Premium',
            budget: '₪20,000',
            used: '₪12,450',
            leadsThisMonth: 145,
            status: 'active'
        },
        {
            id: 2,
            name: 'מכללת אחווה - מכינות',
            contact: 'יוסי לוי',
            tier: 'Basic',
            budget: '₪5,000',
            used: '₪4,900',
            leadsThisMonth: 62,
            status: 'warning' // budget low
        },
        {
            id: 3,
            name: 'אוניברסיטת בן גוריון (רישום)',
            contact: 'מיכל ד.',
            tier: 'Enterprise',
            budget: 'לא מוגבל',
            used: '₪32,100',
            leadsThisMonth: 412,
            status: 'active'
        }
    ];

    return (
        <div className="space-y-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-3 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-white/10 rounded-md">
                            <Building2 className="w-4 h-4 text-blue-300" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-300">שותפים פעילים</div>
                            <div className="text-lg font-bold">5</div>
                        </div>
                    </div>
                    <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                        <div className="bg-blue-400 h-full w-3/4" />
                    </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-green-500" />
                    <div className="text-gray-500 text-xs font-medium mb-0.5">הכנסות החודש (משוער)</div>
                    <div className="text-xl font-bold text-gray-900">₪49,450</div>
                    <div className="text-green-600 text-[10px] mt-0.5 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +12.5%
                    </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="text-gray-500 text-xs font-medium mb-0.5">לידים שנמכרו</div>
                    <div className="text-xl font-bold text-gray-900">619</div>
                    <div className="text-gray-400 text-[10px] mt-1">ממוצע: ₪80 לליד</div>
                </div>
            </div>

            {/* Partners List */}
            <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">תיק לקוחות</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-xs text-right">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-4 py-2">לקוח</th>
                                <th className="px-4 py-2">חבילה</th>
                                <th className="px-4 py-2">תקציב / ניצול</th>
                                <th className="px-4 py-2">לידים (חודשי)</th>
                                <th className="px-4 py-2">סטטוס</th>
                                <th className="px-4 py-2">פעולות</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {partners.map(partner => (
                                <tr key={partner.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-2">
                                        <div className="font-bold text-gray-900">{partner.name}</div>
                                        <div className="text-[10px] text-gray-500">{partner.contact}</div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600 font-medium">
                                            {partner.tier}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex flex-col gap-1 w-24">
                                            <div className="flex justify-between text-[10px] text-gray-600">
                                                <span>{partner.used}</span>
                                                <span className="text-gray-400">{partner.budget}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${partner.status === 'warning' ? 'bg-red-500' : 'bg-blue-600'}`}
                                                    style={{
                                                        width: partner.budget === 'לא מוגבל'
                                                            ? '100%'
                                                            : `${Math.min(100, (parseInt(partner.used.replace(/\D/g, '')) / parseInt(partner.budget.replace(/\D/g, ''))) * 100)}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-900">
                                        {partner.leadsThisMonth}
                                    </td>
                                    <td className="px-4 py-2">
                                        {partner.status === 'active' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                פעיל
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                תקציב נמוך
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        <button className="text-blue-600 hover:text-blue-700 font-medium text-[10px] flex items-center gap-1">
                                            <Download className="w-3 h-3" />
                                            אקסל
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
