import { requireWaitingSession } from '@/lib/auth/require-session';
import WaitingPageClient from './_components/WaitingPageClient';

export default async function WaitingPage() {
    await requireWaitingSession();
    return <WaitingPageClient />;
}
