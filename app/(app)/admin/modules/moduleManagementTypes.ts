import type { Role } from '@/lib/generated/enums';
import type { ModuleCategory, ModuleConfigurationPolicy } from '@/lib/modules/moduleCatalog';

export interface ModuleConfigurationViewModel {
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

export interface ModuleFormState {
    title: string;
    description: string;
    enabled: boolean;
    sortOrder: number;
    allowedRoles: Role[];
    allowedGroupIds: string[];
}
