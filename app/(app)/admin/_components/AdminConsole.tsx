import type { UserStatus } from '@/lib/generated/client';
import { ADMIN_TABS } from '../adminNavigation';
import { AdminToolbar } from './AdminToolbar';
import { AdminTabBar } from './AdminTabBar';
import { AdminUserList } from './AdminUserList';

interface AdminUser {
    id: string;
    sc_handle: string;
    status: UserStatus;
    role: string;
    failed_attempts: number;
    createdAt: Date;
    rejectedAt: Date | null;
    bannedAt: Date | null;
}

interface AdminConsoleProps {
    data: Record<UserStatus, AdminUser[]>;
    activeTab: UserStatus;
}

export function AdminConsole({ data, activeTab }: AdminConsoleProps) {
    const counts = Object.fromEntries(
        Object.entries(data).map(([status, users]) => [status, users.length])
    ) as Record<UserStatus, number>;

    return (
        <div className="max-w-7xl mx-auto">
            <AdminToolbar />
            <AdminTabBar tabs={ADMIN_TABS} counts={counts} activeTab={activeTab} />
            <AdminUserList users={data[activeTab]} type={activeTab} />
        </div>
    );
}
