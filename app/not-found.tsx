import Link from 'next/link';
import { TerminalPanel } from '@/components/mobiglas/TerminalPanel';
import { StatusLine } from '@/components/mobiglas/StatusLine';

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <TerminalPanel>
                <div className="eyebrow">
                    <span className="eyebrow-dot" />
                    404 // ROUTE NOT FOUND
                </div>
                <h1 className="font-display text-2xl font-bold uppercase tracking-wide mb-1">
                    Seite nicht gefunden
                </h1>
                <p className="font-mono text-xs text-text-dim mb-5">
                    Die angeforderte Route existiert nicht in diesem System.
                </p>

                <StatusLine variant="denied">ERR_NO_ROUTE</StatusLine>

                <Link href="/login" className="btn-terminal inline-flex mt-2">
                    Zurück zum Login
                </Link>
            </TerminalPanel>
        </div>
    );
}
