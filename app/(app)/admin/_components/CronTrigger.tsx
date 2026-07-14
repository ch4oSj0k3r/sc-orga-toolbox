'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { triggerCronVerification } from '../actions';
import { TerminalButton } from '@/components/mobiglas/TerminalButton';
import { StatusLine } from '@/components/mobiglas/StatusLine';

export function CronTrigger() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleTrigger = async () => {
        setIsLoading(true);
        try {
            await triggerCronVerification();
            toast.success('Verifizierungs-Lauf erfolgreich abgeschlossen!');
            router.refresh();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isLoading && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg/85 backdrop-blur-md">
                    <div className="w-10 h-10 border-2 border-cyan-dim border-t-cyan rounded-full animate-spin mb-4" />
                    <StatusLine variant="active">RSI API-Abgleich läuft...</StatusLine>
                    <p className="font-mono text-[11px] text-text-dim mt-1">
                        Dies kann einen Moment dauern, da Profile validiert werden.
                    </p>
                </div>
            )}

            <TerminalButton
                type="button"
                disabled={isLoading}
                onClick={handleTrigger}
                className="w-auto! px-4 py-2"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18"
                    />
                </svg>
                RSI-Sync manuell starten
            </TerminalButton>
        </>
    );
}
