import Link from 'next/link';
import type { UserStatus } from '@/lib/generated/client';
import type { AdminTab } from '../adminNavigation';

interface AdminTabBarProps {
    tabs: AdminTab[];
    counts: Record<UserStatus, number>;
    activeTab: UserStatus;
}

export function AdminTabBar({ tabs, counts, activeTab }: AdminTabBarProps) {
    return (
        <nav className="flex gap-1 border-b border-line mb-6 overflow-x-auto">
            {tabs.map((tab) => {
                const isActive = tab.status === activeTab;
                return (
                    <Link
                        key={tab.status}
                        href={`/admin?tab=${tab.status}`}
                        className={`font-mono text-xs uppercase tracking-[0.06em] px-4 py-3 border-b-2 whitespace-nowrap transition-colors focus-terminal ${
                            isActive
                                ? 'border-cyan text-cyan'
                                : 'border-transparent text-text-dim hover:text-text'
                        }`}
                    >
                        {tab.label} ({counts[tab.status]})
                    </Link>
                );
            })}
        </nav>
    );
}
