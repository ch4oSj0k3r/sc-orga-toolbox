'use client';

import { signOut } from 'next-auth/react';
import { TerminalButton } from '@/components/mobiglas/TerminalButton';

interface UserMenuProps {
    userName?: string | null;
}

export function UserMenu({ userName }: UserMenuProps) {
    return (
        <div className="flex items-center gap-4 pl-6 border-l border-line">
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_8px_var(--color-cyan)]" />
                <span className="font-mono text-xs text-text">{userName}</span>
            </div>
            <TerminalButton
                variant="danger"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-auto! px-3 py-1.5 text-[11px]"
            >
                Logout
            </TerminalButton>
        </div>
    );
}
