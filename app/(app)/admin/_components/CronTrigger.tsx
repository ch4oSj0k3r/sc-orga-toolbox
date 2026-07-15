'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { triggerCronVerification } from '../actions';
import { TerminalButton } from '@/components/mobiglas/TerminalButton';
import { StatusLine } from '@/components/mobiglas/StatusLine';
import { createPortal } from 'react-dom';

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

    const loadingOverlay =
        isLoading && typeof document !== 'undefined'
            ? createPortal(
                  <div
                      className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-bg/85 backdrop-blur-md"
                      role="status"
                      aria-live="polite"
                      aria-busy="true"
                  >
                      <div
                          aria-hidden="true"
                          className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-cyan-dim border-t-cyan"
                      />

                      <StatusLine variant="active">RSI API-Abgleich läuft...</StatusLine>

                      <p className="mt-1 font-mono text-[11px] text-text-dim">
                          Dies kann einen Moment dauern, da Profile validiert werden.
                      </p>
                  </div>,
                  document.body
              )
            : null;

    return (
        <>
            {loadingOverlay}

            <TerminalButton
                type="button"
                disabled={isLoading}
                onClick={handleTrigger}
                className="w-full! px-4 py-2 sm:w-auto!"
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
