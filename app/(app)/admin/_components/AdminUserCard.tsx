import { TerminalPanel } from '@/components/mobiglas/TerminalPanel';
import { FormatDate } from './FormatDate';
import { AdminUserActions } from './AdminUserActions';
import type { UserStatus } from '@/lib/generated/client';
import type { useAdminUserActions } from '../useAdminUserActions';
import type { AdminUser } from '../adminTypes';

interface AdminUserCardProps {
    user: AdminUser;
    type: UserStatus;
    onAction: ReturnType<typeof useAdminUserActions>['openModal'];
    actions: ReturnType<typeof useAdminUserActions>['actions'];
}

export function AdminUserCard({ user, type, onAction, actions }: AdminUserCardProps) {
    return (
        <TerminalPanel showCorners={false} className="max-w-none">
            <div className="flex justify-between items-start mb-3">
                <span className="font-mono font-medium">{user.sc_handle}</span>
                <span className="px-2 py-0.5 text-xs rounded bg-panel-alt border border-line text-text-dim">
                    {user.role}
                </span>
            </div>
            <p className="font-mono text-xs text-text-dim mb-1">
                Registriert: <FormatDate date={user.createdAt} withTime />
            </p>
            {type === 'REJECTED' && (
                <p className="font-mono text-xs text-danger mb-1">
                    {user.failed_attempts} Versuche
                    {user.rejectedAt && (
                        <>
                            {' '}
                            — <FormatDate date={user.rejectedAt} withTime />
                        </>
                    )}
                </p>
            )}
            {type === 'BANNED' && user.bannedAt && (
                <p className="font-mono text-xs text-danger-deep mb-1">
                    Gesperrt: <FormatDate date={user.bannedAt} withTime />
                </p>
            )}
            <div className="mt-3 pt-3 border-t border-line">
                <AdminUserActions user={user} type={type} onAction={onAction} actions={actions} />
            </div>
        </TerminalPanel>
    );
}
