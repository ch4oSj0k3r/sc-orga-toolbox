'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { activateUser, banUser, resetUserAttempts, deleteUser } from './actions';

type AdminAction = (id: string) => Promise<void>;
type ModalVariant = 'primary' | 'danger';

interface ModalConfig {
    isOpen: boolean;
    userId: string;
    action: AdminAction | null;
    title: string;
    message: string;
    variant: ModalVariant;
}

const initialModalConfig: ModalConfig = {
    isOpen: false,
    userId: '',
    action: null,
    title: '',
    message: '',
    variant: 'primary',
};

export function useAdminUserActions() {
    const [isPending, startTransition] = useTransition();
    const [modalConfig, setModalConfig] = useState<ModalConfig>(initialModalConfig);

    function openModal(
        action: AdminAction,
        id: string,
        title: string,
        message: string,
        variant: ModalVariant = 'primary'
    ) {
        setModalConfig({ isOpen: true, userId: id, action, title, message, variant });
    }

    function closeModal() {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
    }

    function handleConfirm() {
        const { action, userId, title } = modalConfig;
        if (!action || !userId) return;

        startTransition(async () => {
            try {
                await action(userId);
                toast.success(`${title} erfolgreich durchgeführt!`);
                closeModal();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten');
            }
        });
    }

    return {
        isPending,
        modalConfig,
        openModal,
        closeModal,
        handleConfirm,
        actions: { activateUser, banUser, resetUserAttempts, deleteUser },
    };
}
