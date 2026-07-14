'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            className={`font-mono text-xs uppercase tracking-[0.06em] pb-1 border-b-2 transition-colors ${
                isActive
                    ? 'text-cyan border-cyan'
                    : 'text-text-dim border-transparent hover:text-text'
            }`}
        >
            {children}
        </Link>
    );
}
