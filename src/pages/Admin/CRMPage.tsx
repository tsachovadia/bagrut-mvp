import React from 'react';
import { AdminShell } from '../../components/Admin/AdminShell';
import { UsersTable } from '../../components/Admin/CRM/UsersTable';
import { SoftLeadsTable } from '../../components/Admin/CRM/SoftLeadsTable';
import { FeedbackTable } from '../../components/Admin/CRM/FeedbackTable';

export const CRMPage = () => {
    const [activeTab, setActiveTab] = React.useState<'users' | 'leads' | 'feedback'>('users');

    return (
        <AdminShell title="ניהול משתמשים ולידים">
            <div className="space-y-6">
                {/* KPI Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-gray-500 text-xs font-medium mb-0.5">לידים חמים (24ש׳)</div>
                        <div className="text-xl font-bold text-gray-900 flex items-baseline gap-1.5">
                            45
                            <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">+12%</span>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-gray-500 text-xs font-medium mb-0.5">הצטרפו לקבוצות</div>
                        <div className="text-xl font-bold text-gray-900 flex items-baseline gap-1.5">
                            12
                            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">חדשים</span>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-gray-500 text-xs font-medium mb-0.5">הודעות בוט</div>
                        <div className="text-xl font-bold text-gray-900">1,402</div>
                    </div>

                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                        <div className="text-blue-100 text-xs font-medium mb-0.5">רווח משוער (חודשי)</div>
                        <div className="text-xl font-bold">₪15,200</div>
                    </div>
                </div>

                {/* Tabs & Table */}
                <div className="space-y-4">
                    <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-lg w-fit">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'users'
                                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                }`}
                        >
                            משתמשים רשומים
                        </button>
                        <button
                            onClick={() => setActiveTab('leads')}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'leads'
                                ? 'bg-white text-yellow-600 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                }`}
                        >
                            לידים מהירים (New)
                        </button>
                        <button
                            onClick={() => setActiveTab('feedback')}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'feedback'
                                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                }`}
                        >
                            משוב ותקלות 🐛
                        </button>
                    </div>

                    {activeTab === 'users' ? <UsersTable /> : activeTab === 'leads' ? <SoftLeadsTable /> : <FeedbackTable />}
                </div>
            </div>
        </AdminShell>
    );
};
