import Link from 'next/link';
import { NavLink } from './NavLink';
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
            <div className="flex items-center px-6 py-4 max-w-7xl mx-auto">
                <Link href="/dashboard" className="eyebrow mb-0! focus-terminal">
                    <span className="eyebrow-dot" />
                    ORG TOOLBOX
                </Link>

                {user.role === 'ADMIN' && (
                    <nav className="flex items-center gap-6 pl-6 ml-6 border-l border-line">
                        <NavLink href="/admin">Admin</NavLink>
                    </nav>
                )}

                <div className="ml-auto">
                    <UserMenu userName={user.name} />
                </div>
            </div>
        </header>
    );
}
