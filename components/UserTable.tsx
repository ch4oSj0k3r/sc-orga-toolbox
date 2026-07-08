'use client';

import { useState, useTransition } from 'react';
import { activateUser, banUser, resetUserAttempts, deleteUser } from '@/app/admin/actions';
import { FormatDate } from './FormatDate';
import { ConfirmationModal } from './ConfirmationModal';

interface User {
    id: string;
    sc_handle: string;
    status: string;
    role: string;
    failed_attempts: number;
    createdAt: Date;
    rejectedAt: Date | null;
    bannedAt: Date | null;
}

interface UserTableProps {
    users: User[];
    type: 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'REJECTED' | 'BANNED';
}

export function UserTable({ users, type }: UserTableProps) {
    const [isPending, startTransition] = useTransition();

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        userId: string;
        action: ((id: string) => Promise<void>) | null;
        title: string;
        message: string;
    }>({
        isOpen: false,
        userId: '',
        action: null,
        title: '',
        message: '',
    });

    const openModal = (
        action: (id: string) => Promise<void>,
        id: string,
        title: string,
        message: string
    ) => {
        setModalConfig({
            isOpen: true,
            userId: id,
            action,
            title,
            message,
        });
    };

    const closeModal = () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
    };

    const handleConfirm = () => {
        const { action, userId } = modalConfig;

        if (!action || !userId) return;

        startTransition(async () => {
            try {
                await action(userId);
                closeModal();
            } catch (error) {
                alert(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten');
            }
        });
    };

    if (users.length === 0) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 text-center text-zinc-500 text-sm">
                Keine Benutzer mit diesem Status vorhanden.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-zinc-900 border border-zinc-800 rounded-lg">
            <table className="w-full text-left border-collapse text-sm text-zinc-300">
                <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400 font-medium">
                        <th className="p-4">RSI Handle</th>
                        <th className="p-4">Rolle</th>
                        <th className="p-4">Registriert am</th>
                        {type === 'REJECTED' && (
                            <th className="p-4">Fehlversuche / Abgelehnt am</th>
                        )}
                        {type === 'BANNED' && <th className="p-4">Gesperrt am</th>}
                        <th className="p-4 text-right">Aktionen</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                    {users.map((user) => (
                        <tr
                            key={user.id}
                            className={`hover:bg-zinc-800/30 transition-colors ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <td className="p-4 font-mono font-medium text-zinc-200">
                                {user.sc_handle}
                            </td>
                            <td className="p-4">
                                <span className="px-2 py-0.5 text-xs rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
                                    {user.role}
                                </span>
                            </td>
                            <td className="p-4 text-zinc-500">
                                <FormatDate date={user.createdAt} withTime />
                            </td>

                            {/* Zusätzliche Info-Spalten je nach Status */}
                            {type === 'REJECTED' && (
                                <td className="p-4 text-zinc-400">
                                    <span className="text-red-400 font-semibold">
                                        {user.failed_attempts} Versuche
                                    </span>
                                    {user.rejectedAt && (
                                        <span className="text-zinc-500 block text-xs">
                                            <FormatDate date={user.rejectedAt} withTime />
                                        </span>
                                    )}
                                </td>
                            )}
                            {type === 'BANNED' && (
                                <td className="p-4 text-purple-400 text-xs">
                                    {user.bannedAt ? (
                                        <FormatDate date={user.bannedAt} withTime />
                                    ) : (
                                        '-'
                                    )}
                                </td>
                            )}

                            {/* Dynamische Buttons je nach Tabellen-Typ */}
                            <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                {type === 'VERIFIED' && (
                                    <button
                                        onClick={() =>
                                            openModal(
                                                activateUser,
                                                user.id,
                                                'Mitglied aktivieren',
                                                `Möchtest du den User ${user.sc_handle} wirklich als ACTIVE freischalten?`
                                            )
                                        }
                                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition-colors"
                                    >
                                        Aktivieren
                                    </button>
                                )}

                                {type === 'ACTIVE' && (
                                    <button
                                        onClick={() =>
                                            openModal(
                                                banUser,
                                                user.id,
                                                'Mitglied bannen',
                                                `Möchtest du den User ${user.sc_handle} wirklich bannen?`
                                            )
                                        }
                                        className="px-3 py-1 bg-purple-900/60 hover:bg-purple-800 border border-purple-700 text-purple-200 text-xs font-medium rounded transition-colors"
                                    >
                                        Bannen
                                    </button>
                                )}

                                {type === 'REJECTED' && (
                                    <button
                                        onClick={() =>
                                            openModal(
                                                resetUserAttempts,
                                                user.id,
                                                'Fehlversuche zurücksetzen',
                                                `Möchtest du die Fehlversuche des User ${user.sc_handle} wirklich zurücksetzen?`
                                            )
                                        }
                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors"
                                    >
                                        Retry (Loop)
                                    </button>
                                )}

                                {/* Universeller Löschbutton für alles, was nicht aktiv ist */}
                                {type !== 'ACTIVE' && (
                                    <button
                                        onClick={() =>
                                            openModal(
                                                deleteUser,
                                                user.id,
                                                'Mitglied löschen',
                                                `Möchtest du den User ${user.sc_handle} wirklich löschen?`
                                            )
                                        }
                                        className="px-3 py-1 bg-zinc-800 hover:bg-red-950 hover:text-red-200 hover:border-red-800 border border-zinc-700 text-zinc-400 text-xs font-medium rounded transition-colors"
                                    >
                                        Löschen
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                isLoading={isPending}
                onConfirm={handleConfirm}
                onCancel={closeModal}
            />
        </div>
    );
}
