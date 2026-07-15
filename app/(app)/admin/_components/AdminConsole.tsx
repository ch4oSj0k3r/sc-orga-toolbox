import type { UserStatus } from '@/lib/generated/client';
import { ADMIN_TABS } from '../adminNavigation';
import { AdminToolbar } from './AdminToolbar';
import { AdminTabBar } from './AdminTabBar';
import { AdminUserList } from './AdminUserList';
import { ConsolePanel } from '@/components/mobiglas/ConsolePanel';
import { AdminUser } from '../adminTypes';

interface AdminConsoleProps {
    data: Record<UserStatus, AdminUser[]>;
    activeTab: UserStatus;
}

export function AdminConsole({ data, activeTab }: AdminConsoleProps) {
    const counts = Object.fromEntries(
        Object.entries(data).map(([status, users]) => [status, users.length])
    ) as Record<UserStatus, number>;

    return (
        <ConsolePanel className="mx-auto max-w-7xl">
            <AdminToolbar />
            <AdminTabBar tabs={ADMIN_TABS} counts={counts} activeTab={activeTab} />
            <AdminUserList users={data[activeTab]} type={activeTab} />
        </ConsolePanel>
    );
}
