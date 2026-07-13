'use client';

import { signOut } from 'next-auth/react';

interface UserMenuProps {
    userName?: string | null;
}

export function UserMenu({ userName }: UserMenuProps) {
    return (
        <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-text-dim">{userName}</span>
            <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="font-mono text-xs uppercase tracking-[0.06em] text-text-dim hover:text-danger transition-colors"
            >
                Logout
            </button>
        </div>
    );
}
