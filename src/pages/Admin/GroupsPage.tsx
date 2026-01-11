import React from 'react';
import { AdminShell } from '../../components/Admin/AdminShell';
import { GroupsManager } from '../../components/Admin/Groups/GroupsManager';

export const GroupsPage = () => {
    return (
        <AdminShell title="ניהול קהילות וקבוצות">
            <GroupsManager />
        </AdminShell>
    );
};
