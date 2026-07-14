'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuthErrorMessage } from '@/lib/auth/auth-errors';
import { TerminalPanel } from '@/components/mobiglas/TerminalPanel';
import { StatusLine } from '@/components/mobiglas/StatusLine';
import { TerminalInput } from '@/components/mobiglas/TerminalInput';
import { TerminalButton } from '@/components/mobiglas/TerminalButton';
import { Footnote } from '@/components/mobiglas/Footnote';

export function LoginPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const errorParam = searchParams.get('error');
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    const [scHandle, setScHandle] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const error = localError || getAuthErrorMessage(errorParam);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setLocalError(null);

        const result = await signIn('credentials', {
            sc_handle: scHandle,
            password: password,
            redirect: false,
        });

        if (result?.error) {
            setLocalError(getAuthErrorMessage(result.error));
            setLoading(false);
        } else {
            router.push(callbackUrl);
            router.refresh();
        }
    };

    return (
        <TerminalPanel>
            <div className="eyebrow">
                <span className="eyebrow-dot" />
                SECURE CHANNEL // ORG AUTH
            </div>

            <h1 className="font-display text-2xl font-bold uppercase tracking-wide mb-1">
                Org Access
            </h1>
            <p className="font-mono text-xs text-text-dim mb-5">
                RSI Handle erforderlich, um fortzufahren
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
                    placeholder="z.B. RobertsSpaceInd"
                />
                <TerminalInput
                    id="password"
                    label="Passwort"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                />

                <TerminalButton type="submit" disabled={loading}>
                    {loading ? 'Verifiziere...' : 'Einloggen'}
                </TerminalButton>
            </form>

            <Footnote>
                Zugriffe werden protokolliert. Nur verifizierte{' '}
                <span className="tag">Org-Mitglieder</span> erhalten Zugang.
                <br />
                Noch nicht registriert?{' '}
                <a href="/register" className="link-terminal">
                    Zum Registrieren
                </a>
            </Footnote>
        </TerminalPanel>
    );
}
