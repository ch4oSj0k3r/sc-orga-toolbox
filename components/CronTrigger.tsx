'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { triggerCronVerification } from '@/app/admin/actions';

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
            {/* Globaler Lade-Overlay, der die gesamte UI blockiert */}
            {isLoading && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md">
                    <svg
                        className="animate-spin h-12 w-12 text-blue-500 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <p className="text-lg font-medium text-zinc-200 animate-pulse">
                        RSI API-Abgleich läuft... Bitte warten.
                    </p>
                    <p className="text-sm text-zinc-500 mt-1">
                        Dies kann einen Moment dauern, da Profile validiert werden.
                    </p>
                </div>
            )}

            <button
                type="button"
                disabled={isLoading}
                onClick={handleTrigger}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-sm font-medium rounded-md border border-blue-500/20 shadow-lg shadow-blue-600/10 transition-all"
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
            </button>
        </>
    );
}
