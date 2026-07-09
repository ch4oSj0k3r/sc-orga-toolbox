import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function requireActiveSession() {
    const session = await getServerSession(authOptions);

    if (!session) redirect('/login');
    if (session.user.status === 'BANNED') redirect('/login?error=Banned');
    if (session.user.status === 'REJECTED') redirect('/login?error=Rejected');
    if (session.user.status === 'PENDING' || session.user.status === 'VERIFIED') {
        redirect('/waiting');
    }

    return session; // status ist hier garantiert 'ACTIVE'
}

export async function requireAdminSession() {
    const session = await requireActiveSession();
    if (session.user.role !== 'ADMIN') redirect('/dashboard');
    return session;
}

export async function requireWaitingSession() {
    const session = await getServerSession(authOptions);

    if (!session) redirect('/login');
    if (session.user.status === 'BANNED') redirect('/login?error=Banned');
    if (session.user.status === 'REJECTED') redirect('/login?error=Rejected');
    if (session.user.status === 'ACTIVE') redirect('/dashboard');

    return session; // status ist hier garantiert 'PENDING' oder 'VERIFIED'
}
