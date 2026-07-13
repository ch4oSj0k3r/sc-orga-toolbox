import Link from 'next/link';
import { UserMenu } from './UserMenu';

interface HeaderProps {
    user: {
        name?: string | null;
        role: string;
    };
}

export function Header({ user }: HeaderProps) {
    return (
        <header className="border-b border-line bg-panel">
            <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                <Link href="/dashboard" className="eyebrow">
                    <span className="eyebrow-dot" />
                    ORG TOOLBOX
                </Link>

                <nav className="flex items-center gap-6">
                    {user.role === 'ADMIN' && (
                        <Link
                            href="/admin"
                            className="font-mono text-xs uppercase tracking-[0.06em] text-text-dim hover:text-cyan transition-colors"
                        >
                            Admin
                        </Link>
                    )}
                    <UserMenu userName={user.name} />
                </nav>
            </div>
        </header>
    );
}
