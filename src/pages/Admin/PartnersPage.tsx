import React from 'react';
import { AdminShell } from '../../components/Admin/AdminShell';
import { PartnerPortal } from '../../components/Admin/Partners/PartnerPortal';

export const PartnersPage = () => {
    return (
        <AdminShell title="פורטל שותפים (B2B)">
            <PartnerPortal />
        </AdminShell>
    );
};
