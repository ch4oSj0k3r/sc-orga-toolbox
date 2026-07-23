'use client';

import type { UserStatus } from '@/lib/generated/client';

import type { AdminUser } from '../adminTypes';
import { useAdminUserActions } from '../useAdminUserActions';
import { AdminUserCard } from './AdminUserCard';
import { AdminUserTable } from './AdminUserTable';
import { ConfirmationModal } from './ConfirmationModal';

interface AdminUserListProps {
    users: AdminUser[];
    type: UserStatus;
    currentUserId: string;
}

export function AdminUserList({ users, type, currentUserId }: AdminUserListProps) {
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
                <AdminUserTable
                    users={users}
                    type={type}
                    currentUserId={currentUserId}
                    onAction={openModal}
                    actions={actions}
                />
            </div>
            <div
                className={`md:hidden space-y-3 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
            >
                {users.map((user) => (
                    <AdminUserCard
                        key={user.id}
                        user={user}
                        type={type}
                        currentUserId={currentUserId}
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
