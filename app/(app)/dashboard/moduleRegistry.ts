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
        href: '/admin/users',
        category: 'administration',
        allowedRoles: [Role.ADMIN],
    },
    {
        id: 'module-management',
        title: 'Modulverwaltung',
        description: 'Module aktivieren, konfigurieren und sortieren.',
        href: '/admin/modules',
        category: 'administration',
        allowedRoles: [Role.ADMIN],
    },
];

export function getVisibleModules(role: Role): ToolboxModule[] {
    return toolboxModules.filter((module) => module.allowedRoles.includes(role));
}
