'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TerminalPanel } from '@/components/mobiglas/TerminalPanel';
import { StatusLine } from '@/components/mobiglas/StatusLine';
import { TerminalInput } from '@/components/mobiglas/TerminalInput';
import { TerminalButton } from '@/components/mobiglas/TerminalButton';
import { TokenDisplay } from '@/components/mobiglas/TokenDisplay';
import { Footnote } from '@/components/mobiglas/Footnote';

export default function RegisterPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<{ token: string; handle: string } | null>(null);

    const [scHandle, setScHandle] = useState('');
    const [password, setPassword] = useState('');

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        startTransition(async () => {
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sc_handle: scHandle, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Etwas ist schiefgelaufen.');
                }

                setSuccessData({
                    token: data.user.verification_token,
                    handle: data.user.sc_handle,
                });
            } catch (err: unknown) {
                setError(
                    err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten.'
                );
            }
        });
    }

    if (successData) {
        return (
            <TerminalPanel>
                <div className="eyebrow">
                    <span className="eyebrow-dot" />
                    REGISTRIERUNG ABGESCHLOSSEN
                </div>

                <h1 className="font-display text-2xl font-bold uppercase tracking-wide mb-1">
                    Account angelegt
                </h1>
                <p className="font-mono text-xs text-text-dim mb-5">
                    Hallo {successData.handle}, dein Account wurde im System angelegt.
                </p>

                <TokenDisplay token={successData.token} />

                <p className="font-mono text-[11px] text-text-dim leading-relaxed mt-4 mb-5">
                    Füge diesen Code jetzt in dein <span className="text-cyan-dim">RSI-Profil</span>{' '}
                    (Bio oder Moniker) ein, damit wir deine Identität im nächsten Schritt bestätigen
                    können.
                </p>

                <TerminalButton onClick={() => router.push('/login')}>
                    Weiter zum Login
                </TerminalButton>
            </TerminalPanel>
        );
    }

    return (
        <TerminalPanel>
            <div className="eyebrow">
                <span className="eyebrow-dot" />
                SECURE CHANNEL // ORG REGISTRATION
            </div>

            <h1 className="font-display text-2xl font-bold uppercase tracking-wide mb-1">
                Orga-Registrierung
            </h1>
            <p className="font-mono text-xs text-text-dim mb-5">
                Gib deinen exakten RSI-Handle an, um dich anzumelden.
            </p>

            {error && <StatusLine variant="denied">{error}</StatusLine>}

            <form onSubmit={handleSubmit}>
                <TerminalInput
                    id="sc_handle"
                    label="RSI Handle"
                    type="text"
                    required
                    value={scHandle}
                    onChange={(e) => setScHandle(e.target.value)}
                    disabled={isPending}
                    placeholder="z.B. ChrisRoberts"
                />
                <TerminalInput
                    id="password"
                    label="Passwort (min. 8 Zeichen)"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPending}
                    placeholder="••••••••"
                />

                <TerminalButton type="submit" disabled={isPending}>
                    {isPending ? 'Prüfe RSI-Datenbank...' : 'Registrieren'}
                </TerminalButton>
            </form>

            <Footnote>
                Bereits registriert?{' '}
                <a href="/login" className="text-cyan-dim hover:text-cyan">
                    Zum Login
                </a>
            </Footnote>
        </TerminalPanel>
    );
}
