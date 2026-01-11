import React from 'react';
import { AdminShell } from '../../components/Admin/AdminShell';
import { SignalsFeed } from '../../components/Admin/Signals/SignalsFeed';

export const SignalsPage = () => {
    return (
        <AdminShell title="מודיעין בזמן אמת (Signals)">
            <SignalsFeed />
        </AdminShell>
    );
};
