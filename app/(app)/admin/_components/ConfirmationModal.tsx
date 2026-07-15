'use client';

import { useEffect } from 'react';
import { TerminalPanel } from '@/components/mobiglas/TerminalPanel';
import { TerminalButton } from '@/components/mobiglas/TerminalButton';
import { createPortal } from 'react-dom';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    variant?: 'primary' | 'danger';
}

export function ConfirmationModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    isLoading = false,
    variant = 'primary',
}: ConfirmationModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape' && !isLoading) {
                onCancel();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isLoading, onCancel]);

    if (!isOpen || typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <div
            className="fixed inset-0 z-100 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-modal-title"
        >
            <div
                className="fixed inset-0 bg-bg/80 backdrop-blur-sm"
                onClick={isLoading ? undefined : onCancel}
                aria-hidden="true"
            />

            <TerminalPanel
                className="relative z-10 max-h-[calc(100dvh-2rem)] max-w-md overflow-y-auto"
                showCorners={false}
            >
                <h3
                    id="confirmation-modal-title"
                    className="font-display text-lg font-bold uppercase tracking-wide text-text"
                >
                    {title}
                </h3>

                <p className="mt-2 font-mono text-xs leading-relaxed text-text-dim">{message}</p>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <TerminalButton
                        autoFocus
                        variant="secondary"
                        disabled={isLoading}
                        onClick={onCancel}
                        className="w-full! px-4 py-2 sm:w-auto!"
                    >
                        Abbrechen
                    </TerminalButton>

                    <TerminalButton
                        variant={variant}
                        disabled={isLoading}
                        onClick={onConfirm}
                        className="w-full! px-4 py-2 sm:w-auto!"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span
                                    aria-hidden="true"
                                    className={`h-3.5 w-3.5 animate-spin rounded-full border-2 ${
                                        variant === 'danger'
                                            ? 'border-danger/40 border-t-danger'
                                            : 'border-cyan-dim border-t-cyan'
                                    }`}
                                />
                                Verarbeite...
                            </span>
                        ) : (
                            'Bestätigen'
                        )}
                    </TerminalButton>
                </div>
            </TerminalPanel>
        </div>,
        document.body
    );
}
