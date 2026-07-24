import { Role } from '@/lib/generated/enums';

export type ModuleCategory = 'module' | 'administration';

export interface ModuleConfigurationPolicy {
    title: boolean;
    description: boolean;
    enabled: boolean;
    sortOrder: boolean;
    allowedRoles: boolean;
}

export interface ModuleDefinition {
    id: string;
    defaultTitle: string;
    defaultDescription: string;
    defaultSortOrder: number;
    href: string;
    category: ModuleCategory;
    defaultAllowedRoles: readonly Role[];
    mandatoryRoles: readonly Role[];
    configuration: ModuleConfigurationPolicy;
}

/**
 * Darstellungstyp für Module im Dashboard.
 */
export interface ToolboxModule {
    id: string;
    title: string;
    description: string;
    sortOrder: number;
    href: string;
    category: ModuleCategory;
    allowedRoles: readonly Role[];
}

export const moduleDefinitions = [
    {
        id: 'member-management',
        defaultTitle: 'Mitgliederverwaltung',
        defaultDescription: 'Mitglieder freischalten, sperren und Rollen verwalten.',
        defaultSortOrder: 100,
        href: '/admin/users',
        category: 'administration',
        defaultAllowedRoles: [Role.ADMIN],
        mandatoryRoles: [Role.ADMIN],
        configuration: {
            title: true,
            description: true,
            enabled: false,
            sortOrder: true,
            allowedRoles: false,
        },
    },
    {
        id: 'module-management',
        defaultTitle: 'Modulverwaltung',
        defaultDescription: 'Module aktivieren, konfigurieren und sortieren.',
        defaultSortOrder: 200,
        href: '/admin/modules',
        category: 'administration',
        defaultAllowedRoles: [Role.ADMIN],
        mandatoryRoles: [Role.ADMIN],
        configuration: {
            title: true,
            description: true,
            enabled: false,
            sortOrder: true,
            allowedRoles: false,
        },
    },
] satisfies readonly ModuleDefinition[];

export function getModuleDefinition(moduleId: string): ModuleDefinition | undefined {
    return moduleDefinitions.find((definition) => definition.id === moduleId);
}
