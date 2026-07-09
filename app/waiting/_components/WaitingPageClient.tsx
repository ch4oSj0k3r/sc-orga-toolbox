'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WaitingPageClient() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    // Sicherheits-Check: Wenn der Status des Users im Hintergrund auf ACTIVE springt,
    // leiten wir ihn sofort ins Dashboard weiter. Wenn der Status auf REJECTED springt,
    // loggen wir ihn aus und schicken ihn zurück auf die Login-Seite.
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.status === 'ACTIVE') {
            router.push('/dashboard');
            router.refresh();
        }

        if (session?.user?.status === 'REJECTED') {
            signOut({ callbackUrl: '/login?error=Rejected' });
        }

        if (session?.user?.status === 'BANNED') {
            signOut({ callbackUrl: '/login?error=Banned' });
        }
    }, [session, status, router]);

    // Während NextAuth die Session lädt
    if (status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <p className="text-slate-400 animate-pulse">Lade Account-Status...</p>
            </div>
        );
    }

    // Fallback, falls jemand uneingeloggt hier landet
    if (!session?.user) {
        router.push('/login');
        return null;
    }

    const { status: userStatus, verification_token: verificationToken } = session.user;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-950 text-white">
            <div className="w-full max-w-2xl space-y-8 rounded-xl bg-slate-900 p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
                {/* Dekorativer Sci-Fi Header-Stripe */}
                <div
                    className={`absolute top-0 left-0 right-0 h-1.5 ${userStatus === 'VERIFIED' ? 'bg-amber-500' : 'bg-sky-500'}`}
                />

                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Sicherheitsbereich</h2>
                    <p className="text-slate-400">
                        Hallo <span className="text-white font-semibold">{session.user.name}</span>,
                        dein Account wird aktuell überprüft.
                    </p>
                </div>

                <hr className="border-slate-800" />

                {/* ZUSTAND 1: PENDING (Token muss in die Bio) */}
                {userStatus === 'PENDING' && (
                    <div className="space-y-6">
                        <div className="rounded-md bg-sky-500/10 p-4 border border-sky-500/20">
                            <h3 className="text-lg font-medium text-sky-400 mb-2">
                                Schritt 1: RSI-Verifizierung erforderlich
                            </h3>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Um sicherzustellen, dass dieses RSI-Handle wirklich dir gehört,
                                kopiere bitte den unten stehenden Code und füge ihn in deine
                                **RSI-Profil-Biografie** (Short Bio) auf der offiziellen RSI-Website
                                ein.
                            </p>
                        </div>

                        <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 flex flex-col items-center justify-center space-y-2">
                            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                                Dein Verifizierungs-Code
                            </span>
                            <span className="text-2xl font-mono font-bold text-sky-400 tracking-widest bg-slate-900 px-4 py-2 rounded border border-slate-800 select-all">
                                {verificationToken}
                            </span>
                        </div>

                        <p className="text-xs text-slate-400 text-center">
                            Unser System prüft die RSI-Bios automatisch in regelmäßigen Abständen.
                            Sobald der Code erkannt wurde, springt diese Seite um.
                        </p>
                    </div>
                )}

                {/* ZUSTAND 2: VERIFIED (Warten auf Admin-Freigabe) */}
                {userStatus === 'VERIFIED' && (
                    <div className="space-y-6">
                        <div className="rounded-md bg-amber-500/10 p-4 border border-amber-500/20">
                            <h3 className="text-lg font-medium text-amber-400 mb-2">
                                Schritt 2: Warte auf Admin-Freigabe
                            </h3>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Dein RSI-Handle wurde **erfolgreich verifiziert**! Du kannst den
                                Code jetzt wieder aus deiner RSI-Biografie löschen, wenn du
                                möchtest.
                            </p>
                        </div>

                        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-center">
                            <p className="text-sm text-slate-300">
                                Dein Account liegt nun der Organisationsleitung zur manuellen
                                Freischaltung vor. Bitte gedulde dich ein wenig, bis ein Admin dich
                                aktiviert.
                            </p>
                        </div>
                    </div>
                )}

                <hr className="border-slate-800" />

                {/* Footer-Aktionen */}
                <div className="flex items-center justify-between pt-2">
                    <button
                        onClick={async () => {
                            await update(); // Aktualisiert die Session-Daten, um den aktuellen Status zu prüfen
                        }}
                        className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center space-x-1"
                    >
                        🔄 Status aktualisieren
                    </button>

                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                    >
                        Abmelden
                    </button>
                </div>
            </div>
        </div>
    );
}
