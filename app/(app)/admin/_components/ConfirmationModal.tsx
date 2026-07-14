'use client';

import { TerminalPanel } from '@/components/mobiglas/TerminalPanel';
import { TerminalButton } from '@/components/mobiglas/TerminalButton';

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
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-bg/80 backdrop-blur-sm transition-opacity"
                onClick={isLoading ? undefined : onCancel}
            />

            <TerminalPanel className="relative max-w-md" showCorners={false}>
                <h3 className="font-display text-lg font-bold uppercase tracking-wide text-text">
                    {title}
                </h3>
                <p className="font-mono text-xs text-text-dim mt-2 leading-relaxed">{message}</p>

                <div className="mt-6 flex justify-end gap-3">
                    <TerminalButton
                        variant="secondary"
                        disabled={isLoading}
                        onClick={onCancel}
                        className="w-auto! px-4 py-2"
                    >
                        Abbrechen
                    </TerminalButton>
                    <TerminalButton
                        variant={variant}
                        disabled={isLoading}
                        onClick={onConfirm}
                        className="w-auto! px-4 py-2"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span
                                    className={`w-3.5 h-3.5 border-2 rounded-full animate-spin ${
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
        </div>
    );
}
