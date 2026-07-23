import { Role } from '@/lib/generated/browser';

export type ModuleCategory = 'module' | 'administration';

export interface ToolboxModule {
    id: string;
    title: string;
    description: string;
    href: string;
    category: ModuleCategory;
    allowedRoles: Role[];
}

export const toolboxModules: ToolboxModule[] = [
    {
        id: 'member-management',
        title: 'Mitgliederverwaltung',
        description: 'Mitglieder freischalten, sperren und Rollen verwalten.',
        href: '/admin',
        category: 'administration',
        allowedRoles: [Role.ADMIN],
    },
];

export function getVisibleModules(role: Role): ToolboxModule[] {
    return toolboxModules.filter((module) => module.allowedRoles.includes(role));
}
