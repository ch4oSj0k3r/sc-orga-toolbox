import type { UserStatus } from '@/lib/generated/client';

export interface AdminTab {
    status: UserStatus;
    label: string;
}

export const ADMIN_TABS = [
    { status: 'VERIFIED', label: 'Verifiziert' },
    { status: 'PENDING', label: 'Pending' },
    { status: 'REJECTED', label: 'Rejected' },
    { status: 'ACTIVE', label: 'Aktiv' },
    { status: 'BANNED', label: 'Banned' },
] satisfies readonly AdminTab[];

export const DEFAULT_ADMIN_TAB = 'VERIFIED' satisfies UserStatus;

export function parseAdminTab(value: string | undefined): UserStatus {
    const normalized = value?.toUpperCase();

    return ADMIN_TABS.some((tab) => tab.status === normalized)
        ? (normalized as UserStatus)
        : DEFAULT_ADMIN_TAB;
}

export function getAdminTabHref(status: UserStatus): string {
    return `/admin/users?tab=${status.toLowerCase()}`;
}
