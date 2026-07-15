'use client';

import type { UserStatus } from '@/lib/generated/client';
import { AdminUserTable } from './AdminUserTable';
import { AdminUserCard } from './AdminUserCard';
import { ConfirmationModal } from './ConfirmationModal';
import { useAdminUserActions } from '../useAdminUserActions';
import type { AdminUser } from '../adminTypes';

export function AdminUserList({ users, type }: { users: AdminUser[]; type: UserStatus }) {
    const { isPending, modalConfig, openModal, closeModal, handleConfirm, actions } =
        useAdminUserActions();

    if (users.length === 0) {
        return (
            <div className="bg-panel border border-line rounded p-6 text-center text-text-dim text-sm font-mono">
                Keine Benutzer mit diesem Status vorhanden.
            </div>
        );
    }

    return (
        <>
            <div className={`hidden md:block ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                <AdminUserTable users={users} type={type} onAction={openModal} actions={actions} />
            </div>
            <div
                className={`md:hidden space-y-3 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
            >
                {users.map((u) => (
                    <AdminUserCard
                        key={u.id}
                        user={u}
                        type={type}
                        onAction={openModal}
                        actions={actions}
                    />
                ))}
            </div>
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                variant={modalConfig.variant}
                isLoading={isPending}
                onConfirm={handleConfirm}
                onCancel={closeModal}
            />
        </>
    );
}
