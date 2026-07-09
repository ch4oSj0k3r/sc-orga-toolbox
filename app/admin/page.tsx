import { getAdminDashboardData } from './actions';
import { UserTable } from '@/components/UserTable';
import { CronTrigger } from '@/components/CronTrigger';
import { requireAdminSession } from '@/lib/auth/require-session';

export default async function AdminPage() {
    await requireAdminSession();
    const data = await getAdminDashboardData();

    return (
        <div className="p-8 text-white max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orga Admin-Dashboard</h1>
                    <p className="text-gray-400 mt-1">
                        Verwaltung der Benutzerregistrierungen und Sicherheitsstufen.
                    </p>
                </div>
                <div>
                    <CronTrigger />
                </div>
            </div>

            <div className="space-y-12">
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-blue-400">
                        Aktive Mitglieder (ACTIVE)
                    </h2>
                    <UserTable users={data.ACTIVE} type="ACTIVE" />
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4 text-yellow-500">
                        Ausstehende Verifizierungen (VERIFIED)
                    </h2>
                    <UserTable users={data.VERIFIED} type="VERIFIED" />
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4 text-orange-400">
                        Registrierungen im Loop (PENDING)
                    </h2>
                    <UserTable users={data.PENDING} type="PENDING" />
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4 text-red-400">
                        Fehlgeschlagene Validierungen (REJECTED)
                    </h2>
                    <UserTable users={data.REJECTED} type="REJECTED" />
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4 text-purple-500">
                        Permanente Sperren (BANNED)
                    </h2>
                    <UserTable users={data.BANNED} type="BANNED" />
                </section>
            </div>
        </div>
    );
}
