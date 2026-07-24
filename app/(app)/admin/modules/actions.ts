'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAdminSession } from '@/lib/auth/require-session';
import { Role } from '@/lib/generated/enums';
import { getModuleDefinition } from '@/lib/modules/moduleCatalog';
import { prisma } from '@/lib/prisma';

import type { ModuleActionResult, SaveModuleConfigurationInput } from './moduleActionTypes';

const roleSchema = z.enum([Role.GUEST, Role.MEMBER, Role.ADMIN]);

const saveModuleConfigurationSchema = z.object({
    moduleId: z.string().trim().min(1, 'Die Modul-ID fehlt.'),
    title: z
        .string()
        .trim()
        .min(1, 'Der Titel muss mindestens ein Zeichen enthalten.')
        .max(80, 'Der Titel darf höchstens 80 Zeichen enthalten.'),
    description: z
        .string()
        .trim()
        .min(1, 'Die Beschreibung muss mindestens ein Zeichen enthalten.')
        .max(300, 'Die Beschreibung darf höchstens 300 Zeichen enthalten.'),
    enabled: z.boolean(),
    sortOrder: z
        .number()
        .int('Die Sortierreihenfolge muss eine ganze Zahl sein.')
        .min(0, 'Die Sortierreihenfolge darf nicht kleiner als 0 sein.')
        .max(9999, 'Die Sortierreihenfolge darf nicht größer als 9999 sein.'),
    allowedRoles: z.array(roleSchema).max(3),
});

const moduleIdSchema = z.string().trim().min(1);

function revalidateModuleRoutes() {
    revalidatePath('/dashboard');
    revalidatePath('/admin/modules');
}

export async function saveModuleConfiguration(
    input: SaveModuleConfigurationInput
): Promise<ModuleActionResult> {
    await requireAdminSession();

    const validationResult = saveModuleConfigurationSchema.safeParse(input);

    if (!validationResult.success) {
        return {
            success: false,
            message:
                validationResult.error.issues[0]?.message ?? 'Die Modulkonfiguration ist ungültig.',
        };
    }

    const data = validationResult.data;
    const definition = getModuleDefinition(data.moduleId);

    if (!definition) {
        return {
            success: false,
            message: 'Das angegebene technische Modul ist nicht bekannt.',
        };
    }

    const requestedRoles = [...new Set(data.allowedRoles)];

    const effectiveRoles = definition.configuration.allowedRoles
        ? [...new Set([...requestedRoles, ...definition.mandatoryRoles])]
        : [...new Set([...definition.defaultAllowedRoles, ...definition.mandatoryRoles])];

    if (effectiveRoles.length === 0) {
        return {
            success: false,
            message: 'Das Modul muss für mindestens eine effektive Rolle freigegeben sein.',
        };
    }

    const title = definition.configuration.title ? data.title : null;
    const description = definition.configuration.description ? data.description : null;
    const enabled = definition.configuration.enabled ? data.enabled : true;
    const sortOrder = definition.configuration.sortOrder
        ? data.sortOrder
        : definition.defaultSortOrder;

    const persistedRoles = definition.configuration.allowedRoles ? requestedRoles : [];

    try {
        await prisma.$transaction(async (transaction) => {
            await transaction.moduleConfiguration.upsert({
                where: {
                    moduleId: definition.id,
                },
                create: {
                    moduleId: definition.id,
                    title,
                    description,
                    enabled,
                    sortOrder,
                },
                update: {
                    title,
                    description,
                    enabled,
                    sortOrder,
                },
            });

            await transaction.moduleAllowedRole.deleteMany({
                where: {
                    moduleId: definition.id,
                },
            });

            if (persistedRoles.length > 0) {
                await transaction.moduleAllowedRole.createMany({
                    data: persistedRoles.map((role) => ({
                        moduleId: definition.id,
                        role,
                    })),
                });
            }
        });

        revalidateModuleRoutes();

        return {
            success: true,
            message: 'Modulkonfiguration gespeichert.',
        };
    } catch (error) {
        console.error('Modulkonfiguration konnte nicht gespeichert werden.', error);

        return {
            success: false,
            message: 'Die Modulkonfiguration konnte nicht gespeichert werden.',
        };
    }
}

export async function resetModuleConfiguration(moduleId: string): Promise<ModuleActionResult> {
    await requireAdminSession();

    const validationResult = moduleIdSchema.safeParse(moduleId);

    if (!validationResult.success) {
        return {
            success: false,
            message: 'Die Modul-ID ist ungültig.',
        };
    }

    const definition = getModuleDefinition(validationResult.data);

    if (!definition) {
        return {
            success: false,
            message: 'Das angegebene technische Modul ist nicht bekannt.',
        };
    }

    try {
        await prisma.moduleConfiguration.deleteMany({
            where: {
                moduleId: definition.id,
            },
        });

        revalidateModuleRoutes();

        return {
            success: true,
            message: 'Das Modul wurde auf die Standardwerte zurückgesetzt.',
        };
    } catch (error) {
        console.error('Modulkonfiguration konnte nicht zurückgesetzt werden.', error);

        return {
            success: false,
            message: 'Das Modul konnte nicht zurückgesetzt werden.',
        };
    }
}
