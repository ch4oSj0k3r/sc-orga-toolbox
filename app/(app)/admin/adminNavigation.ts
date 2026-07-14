import type { UserStatus } from '@/lib/generated/client';

export interface AdminTab {
    status: UserStatus;
    label: string;
}

export const ADMIN_TABS: AdminTab[] = [
    { status: 'VERIFIED', label: 'Verifiziert' },
    { status: 'PENDING', label: 'Pending' },
    { status: 'REJECTED', label: 'Rejected' },
    { status: 'BANNED', label: 'Banned' },
    { status: 'ACTIVE', label: 'Aktiv' },
];

export const DEFAULT_ADMIN_TAB: UserStatus = 'VERIFIED';

export function isValidAdminTab(value: string | undefined): value is UserStatus {
    return ADMIN_TABS.some((tab) => tab.status === value);
}
