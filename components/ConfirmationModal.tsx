'use client';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function ConfirmationModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    isLoading = false,
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop / Hintergrund-Abdunkelung */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={isLoading ? undefined : onCancel}
            />

            {/* Modal-Content */}
            <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 p-6 shadow-xl transition-all">
                <h3 className="text-lg font-medium leading-6 text-zinc-100">{title}</h3>
                <div className="mt-2">
                    <p className="text-sm text-zinc-400">{message}</p>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50"
                    >
                        Abbrechen
                    </button>
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-md transition-colors disabled:opacity-50 flex items-center"
                    >
                        {isLoading ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                                Verarbeite...
                            </>
                        ) : (
                            'Bestätigen'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
