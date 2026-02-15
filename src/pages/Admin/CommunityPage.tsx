import React from 'react';
import { AdminShell } from '../../components/Admin/AdminShell';
import { GroupsManager } from '../../components/Admin/Groups/GroupsManager';

export const CommunityPage = () => {
    return (
        <AdminShell title="קהילה">
            <GroupsManager />
        </AdminShell>
    );
};
