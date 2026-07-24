import 'server-only';

import type { Role } from '@/lib/generated/enums';
import { prisma } from '@/lib/prisma';
import { getActiveGroupIdsByModule } from '@/lib/access-groups/accessGroupService';

import {
    moduleDefinitions,
    type ModuleCategory,
    type ModuleConfigurationPolicy,
    type ModuleDefinition,
} from './moduleCatalog';

export interface StoredModuleConfiguration {
    moduleId: string;
    title: string | null;
    description: string | null;
    enabled: boolean;
    sortOrder: number;
    allowedRoles: readonly {
        role: Role;
    }[];
}

export interface EffectiveModuleConfiguration {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
    sortOrder: number;
    href: string;
    category: ModuleCategory;
    allowedRoles: readonly Role[];
    allowedGroupIds: readonly string[];
    mandatoryRoles: readonly Role[];
    configuration: ModuleConfigurationPolicy;
    hasPersistentConfiguration: boolean;
}

function mergeRoles(...roleGroups: readonly (readonly Role[])[]): Role[] {
    const roles = new Set<Role>();

    for (const roleGroup of roleGroups) {
        for (const role of roleGroup) {
            roles.add(role);
        }
    }

    return [...roles];
}

function resolveAllowedRoles(
    definition: ModuleDefinition,
    storedConfiguration: StoredModuleConfiguration | undefined
): Role[] {
    const configuredRoles =
        definition.configuration.allowedRoles && storedConfiguration
            ? storedConfiguration.allowedRoles.map(({ role }) => role)
            : definition.defaultAllowedRoles;

    return mergeRoles(configuredRoles, definition.mandatoryRoles);
}

function resolveAllowedGroupIds(
    definition: ModuleDefinition,
    activeGroupIdsByModule: ReadonlyMap<string, readonly string[]>
): string[] {
    if (!definition.configuration.allowedGroups) {
        return [];
    }

    return [...new Set(activeGroupIdsByModule.get(definition.id) ?? [])];
}

export function resolveEffectiveModuleConfigurations(
    storedConfigurations: readonly StoredModuleConfiguration[],
    activeGroupIdsByModule: ReadonlyMap<string, readonly string[]> = new Map()
): EffectiveModuleConfiguration[] {
    const storedConfigurationsByModuleId = new Map(
        storedConfigurations.map((configuration) => [configuration.moduleId, configuration])
    );

    const definitionOrder = new Map(
        moduleDefinitions.map((definition, index) => [definition.id, index])
    );

    return moduleDefinitions
        .map((definition) => {
            const storedConfiguration = storedConfigurationsByModuleId.get(definition.id);

            return {
                id: definition.id,
                title:
                    definition.configuration.title && storedConfiguration?.title
                        ? storedConfiguration.title
                        : definition.defaultTitle,
                description:
                    definition.configuration.description && storedConfiguration?.description
                        ? storedConfiguration.description
                        : definition.defaultDescription,
                enabled: definition.configuration.enabled
                    ? (storedConfiguration?.enabled ?? true)
                    : true,
                sortOrder: definition.configuration.sortOrder
                    ? (storedConfiguration?.sortOrder ?? definition.defaultSortOrder)
                    : definition.defaultSortOrder,
                href: definition.href,
                category: definition.category,
                allowedRoles: resolveAllowedRoles(definition, storedConfiguration),
                allowedGroupIds: resolveAllowedGroupIds(definition, activeGroupIdsByModule),
                mandatoryRoles: [...definition.mandatoryRoles],
                configuration: definition.configuration,
                hasPersistentConfiguration: storedConfiguration !== undefined,
            };
        })
        .sort((left, right) => {
            const sortOrderDifference = left.sortOrder - right.sortOrder;

            if (sortOrderDifference !== 0) {
                return sortOrderDifference;
            }

            return (
                (definitionOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
                (definitionOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER)
            );
        });
}

export async function getEffectiveModuleConfigurations(): Promise<EffectiveModuleConfiguration[]> {
    const [storedConfigurations, activeGroupIdsByModule] = await Promise.all([
        prisma.moduleConfiguration.findMany({
            include: {
                allowedRoles: {
                    select: {
                        role: true,
                    },
                },
            },
        }),
        getActiveGroupIdsByModule(),
    ]);

    return resolveEffectiveModuleConfigurations(storedConfigurations, activeGroupIdsByModule);
}

export async function getVisibleModulesForRole(
    role: Role
): Promise<EffectiveModuleConfiguration[]> {
    const modules = await getEffectiveModuleConfigurations();

    return modules.filter((module) => module.enabled && module.allowedRoles.includes(role));
}
