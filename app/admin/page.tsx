import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    // Doppelter Boden: Falls die Middleware umgangen wird
    if (!session || session.user?.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Orga Admin-Dashboard</h1>
            <p className="text-gray-400">
                Hier entstehen gleich unsere Tabellen für die Benutzerverwaltung.
            </p>

            {/* TODO: Komponenten für Tabellen und globalen Trigger einbinden */}
        </div>
    );
}
