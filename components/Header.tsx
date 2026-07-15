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
        <header className="sticky top-0 z-40 border-b border-line bg-panel/95 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
                <Link href="/dashboard" className="eyebrow mb-0! focus-terminal">
                    <span className="eyebrow-dot" />
                    ORG TOOLBOX
                </Link>

                {user.role === 'ADMIN' && (
                    <nav className="ml-6 flex items-center gap-6 border-l border-line pl-6">
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
