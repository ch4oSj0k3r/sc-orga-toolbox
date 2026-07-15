import { requireAdminSession } from '@/lib/auth/require-session';
import { getAdminDashboardData } from './actions';
import { AdminConsole } from './_components/AdminConsole';
import { parseAdminTab } from './adminNavigation';

interface AdminPageProps {
    searchParams: Promise<{ tab?: string }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
    await requireAdminSession();

    const { tab } = await searchParams;
    const activeTab = parseAdminTab(tab);
    const data = await getAdminDashboardData();

    return <AdminConsole data={data} activeTab={activeTab} />;
}
