import { TerminalButton } from '@/components/mobiglas/TerminalButton';
import type { UserStatus } from '@/lib/generated/client';

interface AdminUserActionsProps {
    user: { id: string; sc_handle: string };
    type: UserStatus;
    onAction: (
        action: (id: string) => Promise<void>,
        id: string,
        title: string,
        message: string,
        variant?: 'primary' | 'danger'
    ) => void;
    actions: ReturnType<typeof import('../useAdminUserActions').useAdminUserActions>['actions'];
}

export function AdminUserActions({ user, type, onAction, actions }: AdminUserActionsProps) {
    return (
        <div className="flex gap-2 flex-wrap">
            {type === 'VERIFIED' && (
                <TerminalButton
                    variant="secondary"
                    className="w-auto! px-3 py-1 text-cyan border-cyan-dim"
                    onClick={() =>
                        onAction(
                            actions.activateUser,
                            user.id,
                            'Mitglied aktivieren',
                            `Möchtest du den User ${user.sc_handle} wirklich als ACTIVE freischalten?`,
                            'primary'
                        )
                    }
                >
                    Aktivieren
                </TerminalButton>
            )}
            {type === 'ACTIVE' && (
                <TerminalButton
                    variant="secondary"
                    className="w-auto! px-3 py-1 text-amber border-amber/40"
                    onClick={() =>
                        onAction(
                            actions.banUser,
                            user.id,
                            'Mitglied bannen',
                            `Möchtest du den User ${user.sc_handle} wirklich bannen?`,
                            'danger'
                        )
                    }
                >
                    Bannen
                </TerminalButton>
            )}
            {type === 'REJECTED' && (
                <TerminalButton
                    variant="secondary"
                    className="w-auto! px-3 py-1"
                    onClick={() =>
                        onAction(
                            actions.resetUserAttempts,
                            user.id,
                            'Fehlversuche zurücksetzen',
                            `Möchtest du die Fehlversuche des User ${user.sc_handle} wirklich zurücksetzen?`,
                            'primary'
                        )
                    }
                >
                    Retry (Loop)
                </TerminalButton>
            )}
            {type !== 'ACTIVE' && (
                <TerminalButton
                    variant="secondary"
                    className="w-auto! px-3 py-1 hover:text-danger hover:border-danger"
                    onClick={() =>
                        onAction(
                            actions.deleteUser,
                            user.id,
                            'Mitglied löschen',
                            `Möchtest du den User ${user.sc_handle} wirklich löschen?`,
                            'danger'
                        )
                    }
                >
                    Löschen
                </TerminalButton>
            )}
        </div>
    );
}
