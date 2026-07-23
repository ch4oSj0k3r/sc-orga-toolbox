'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardLink() {
    const pathname = usePathname();

    if (pathname === '/dashboard') {
        return null;
    }

    return (
        <nav className="ml-4 border-l border-line pl-4 sm:ml-6 sm:pl-6">
            <Link
                href="/dashboard"
                aria-label="Zum Dashboard"
                className="focus-terminal font-mono text-xs uppercase tracking-[0.06em] text-text-dim transition-colors hover:text-cyan"
            >
                <span aria-hidden="true">←</span>
                <span className="ml-2 hidden sm:inline">Dashboard</span>
            </Link>
        </nav>
    );
}
