import { requireAdminSession } from '@/lib/auth/require-session';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    await requireAdminSession();

    return children;
}
