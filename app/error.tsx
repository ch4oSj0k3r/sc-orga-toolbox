'use client';

import { useEffect } from 'react';
import { TerminalPanel } from '@/components/mobiglas/TerminalPanel';
import { TerminalButton } from '@/components/mobiglas/TerminalButton';
import { StatusLine } from '@/components/mobiglas/StatusLine';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <TerminalPanel>
                <div className="eyebrow">
                    <span className="eyebrow-dot" />
                    SYSTEM FAULT
                </div>
                <h1 className="font-display text-2xl font-bold uppercase tracking-wide mb-1">
                    Unerwarteter Fehler
                </h1>
                <p className="font-mono text-xs text-text-dim mb-5">
                    Etwas ist auf unserer Seite schiefgelaufen.
                </p>

                <StatusLine variant="denied">
                    {error.digest ? `Fehlercode: ${error.digest}` : 'Kein Fehlercode verfügbar'}
                </StatusLine>

                <TerminalButton onClick={reset} className="mt-2">
                    Erneut versuchen
                </TerminalButton>
            </TerminalPanel>
        </div>
    );
}
