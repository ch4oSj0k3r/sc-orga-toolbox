'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { TerminalPanel } from '@/components/mobiglas/TerminalPanel';
import { StatusLine } from '@/components/mobiglas/StatusLine';
import { TerminalButton } from '@/components/mobiglas/TerminalButton';
import { TokenDisplay } from '@/components/mobiglas/TokenDisplay';

export default function WaitingPageClient() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.status === 'ACTIVE') {
            router.push('/dashboard');
            router.refresh();
        }

        if (session?.user?.status === 'REJECTED') {
            signOut({ callbackUrl: '/login?error=Rejected' });
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return (
            <TerminalPanel>
                <StatusLine variant="active">Lade Account-Status...</StatusLine>
            </TerminalPanel>
        );
    }

    if (!session?.user) {
        router.push('/login');
        return null;
    }

    const { status: userStatus, verification_token: verificationToken } = session.user;

    return (
        <TerminalPanel>
            <div className="eyebrow">
                <span className="eyebrow-dot" />
                SECURITY CLEARANCE PENDING
            </div>

            <h1 className="font-display text-2xl font-bold uppercase tracking-wide mb-1">
                Sicherheitsbereich
            </h1>
            <p className="font-mono text-xs text-text-dim mb-5">
                Hallo <span className="text-text">{session.user.name}</span>, dein Account wird
                aktuell überprüft.
            </p>

            {userStatus === 'PENDING' && (
                <div className="space-y-4">
                    <StatusLine variant="active">
                        Schritt 1: RSI-Verifizierung erforderlich
                    </StatusLine>

                    <p className="font-mono text-[11px] text-text-dim leading-relaxed">
                        Kopiere den Code unten in deine{' '}
                        <span className="text-cyan-dim">RSI-Profil-Bio</span> auf der offiziellen
                        RSI-Website.
                    </p>

                    <TokenDisplay token={verificationToken} />

                    <p className="font-mono text-[10px] text-text-dim text-center">
                        Bios werden automatisch in regelmäßigen Abständen geprüft.
                    </p>
                </div>
            )}

            {userStatus === 'VERIFIED' && (
                <div className="space-y-4">
                    <StatusLine variant="granted">Schritt 2: Warte auf Admin-Freigabe</StatusLine>

                    <p className="font-mono text-[11px] text-text-dim leading-relaxed">
                        Dein RSI-Handle wurde erfolgreich verifiziert. Den Code kannst du jetzt
                        wieder aus deiner Bio entfernen.
                    </p>

                    <div className="bg-panel-alt border border-line p-4 text-center">
                        <p className="font-mono text-xs text-text-dim">
                            Dein Account liegt zur manuellen Freischaltung vor.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 pt-5 mt-5 border-t border-line">
                <TerminalButton onClick={() => update()}>Status aktualisieren</TerminalButton>

                <TerminalButton onClick={() => signOut({ callbackUrl: '/login' })} variant="danger">
                    Abmelden
                </TerminalButton>
            </div>
        </TerminalPanel>
    );
}
