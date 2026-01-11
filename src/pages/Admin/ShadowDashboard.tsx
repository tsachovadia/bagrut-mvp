import React from 'react';
import { AdminShell } from '../../components/Admin/AdminShell';
import { UsersTable } from '../../components/Admin/CRM/UsersTable';

export const ShadowDashboard = () => {
    return (
        <AdminShell title="ניהול משתמשים ולידים">
            <div className="space-y-6">
                {/* KPI Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-gray-500 text-sm font-medium mb-1">לידים חמים (24ש׳)</div>
                        <div className="text-2xl font-bold text-gray-900 flex items-baseline gap-2">
                            45
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">+12%</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-gray-500 text-sm font-medium mb-1">הצטרפו לקבוצות</div>
                        <div className="text-2xl font-bold text-gray-900 flex items-baseline gap-2">
                            12
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">חדשים</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-gray-500 text-sm font-medium mb-1">הודעות בוט</div>
                        <div className="text-2xl font-bold text-gray-900">1,402</div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                        <div className="text-blue-100 text-sm font-medium mb-1">רווח משוער (חודשי)</div>
                        <div className="text-2xl font-bold">₪15,200</div>
                    </div>
                </div>

                {/* Main Table */}
                <UsersTable />
            </div>
        </AdminShell>
    );
};
