import { DashboardLink } from './DashboardLink';
import { UserMenu } from './UserMenu';
import { ToolboxBrand } from './ToolboxBrand';

interface HeaderProps {
    user: {
        name?: string | null;
    };
}

export function Header({ user }: HeaderProps) {
    return (
        <header className="sticky top-0 z-40 border-b border-line bg-panel/95 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
                <ToolboxBrand />

                <DashboardLink />

                <div className="ml-auto">
                    <UserMenu userName={user.name} />
                </div>
            </div>
        </header>
    );
}
