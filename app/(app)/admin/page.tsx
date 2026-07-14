import { requireAdminSession } from '@/lib/auth/require-session';
import { getAdminDashboardData } from './actions';
import { AdminConsole } from './_components/AdminConsole';
import { DEFAULT_ADMIN_TAB, isValidAdminTab } from './adminNavigation';

interface AdminPageProps {
    searchParams: Promise<{ tab?: string }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
    await requireAdminSession();

    const { tab } = await searchParams;
    const activeTab = isValidAdminTab(tab) ? tab : DEFAULT_ADMIN_TAB;
    const data = await getAdminDashboardData();

    return <AdminConsole data={data} activeTab={activeTab} />;
}
