'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { env } from '@/lib/env';
import { Role, UserStatus } from '@/lib/generated/browser';
import { prisma } from '@/lib/prisma';

import type { AdminActionResult } from './adminActionTypes';

// Hilfsfunktionen zur Absicherung der Actions
async function assertAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== Role.ADMIN) {
        throw new Error('Nicht autorisiert: Nur Admins haben hier Zugriff.');
    }
    return session;
}

async function isLastAdmin(userId: string): Promise<boolean> {
    const target = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });

    if (target?.role !== Role.ADMIN) {
        return false;
    }

    const otherAdmins = await prisma.user.count({
        where: {
            role: Role.ADMIN,
            id: { not: userId },
        },
    });

    return otherAdmins === 0;
}

async function getUserOrThrow(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error('User nicht gefunden.');
    }
    return user;
}

/**
 * 1. Holt alle User aus der DB und gruppiert sie nach Status
 */
export async function getAdminDashboardData() {
    await assertAdmin();

    const allUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            sc_handle: true,
            status: true,
            role: true,
            failed_attempts: true,
            createdAt: true,
            updatedAt: true,
            rejectedAt: true,
            bannedAt: true,
        },
    });

    return {
        [UserStatus.PENDING]: allUsers.filter((u) => u.status === UserStatus.PENDING),
        [UserStatus.VERIFIED]: allUsers.filter((u) => u.status === UserStatus.VERIFIED),
        [UserStatus.ACTIVE]: allUsers.filter((u) => u.status === UserStatus.ACTIVE),
        [UserStatus.REJECTED]: allUsers.filter((u) => u.status === UserStatus.REJECTED),
        [UserStatus.BANNED]: allUsers.filter((u) => u.status === UserStatus.BANNED),
    };
}

/**
 * 2. Aktiviert einen verifizierten User -> wird MEMBER
 * Erlaubter Ausgangsstatus: nur VERIFIED
 */
export async function activateUser(userId: string): Promise<AdminActionResult> {
    await assertAdmin();
    const user = await getUserOrThrow(userId);

    if (user.status !== UserStatus.VERIFIED) {
        return {
            success: false,
            message: `Aktion abgelehnt: User hat Status ${user.status}, erwartet wird VERIFIED.`,
        };
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            status: UserStatus.ACTIVE,
            role: Role.MEMBER,
        },
    });

    revalidatePath('/admin');

    return {
        success: true,
    };
}

/**
 * 3. Bannt einen User permanent
 * Erlaubt aus jedem Status außer bereits BANNED (kein sinnvoller No-Op-Schutz nötig, aber sauberer)
 */
export async function banUser(userId: string): Promise<AdminActionResult> {
    const session = await assertAdmin();
    const user = await getUserOrThrow(userId);

    if (session.user.id === userId) {
        return {
            success: false,
            message: 'Du kannst dich nicht selbst sperren.',
        };
    }

    if (user.status === UserStatus.BANNED) {
        return {
            success: false,
            message: 'User ist bereits gesperrt.',
        };
    }

    if (await isLastAdmin(userId)) {
        return {
            success: false,
            message: 'Es muss mindestens ein Admin-Account bestehen bleiben.',
        };
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            status: UserStatus.BANNED,
            bannedAt: new Date(),
        },
    });

    revalidatePath('/admin');

    return {
        success: true,
    };
}

/**
 * 4. Setzt fehlgeschlagene Versuche zurück -> zurück in den Validierungs-Loop
 * Erlaubter Ausgangsstatus: REJECTED oder PENDING (manueller Reset bei feststeckendem Counter)
 */
export async function resetUserAttempts(userId: string): Promise<AdminActionResult> {
    await assertAdmin();
    const user = await getUserOrThrow(userId);

    if (user.status !== UserStatus.REJECTED && user.status !== UserStatus.PENDING) {
        return {
            success: false,
            message: `Reset nur aus REJECTED oder PENDING möglich. Aktueller Status: ${user.status}.`,
        };
    }

    await prisma.user.update({
        where: { id: userId },
        data: { status: UserStatus.PENDING, failed_attempts: 0, rejectedAt: null },
    });

    revalidatePath('/admin');

    return {
        success: true,
    };
}

/**
 * 5. Löscht einen User-Datensatz permanent
 */
export async function deleteUser(userId: string): Promise<AdminActionResult> {
    const session = await assertAdmin();

    if (session.user.id === userId) {
        return {
            success: false,
            message: 'Du kannst dich nicht selbst löschen.',
        };
    }

    if (await isLastAdmin(userId)) {
        return {
            success: false,
            message: 'Es muss mindestens ein Admin-Account bestehen bleiben.',
        };
    }

    await prisma.user.delete({ where: { id: userId } });
    revalidatePath('/admin');

    return {
        success: true,
    };
}

export async function triggerCronVerification() {
    await assertAdmin();

    const response = await fetch(`${env.NEXTAUTH_URL}/api/cron/verify`, {
        method: 'POST',
        headers: { 'x-cron-secret': env.CRON_SECRET },
    });

    if (!response.ok) {
        throw new Error('Verifizierungs-Lauf fehlgeschlagen.');
    }

    const result = await response.json();
    revalidatePath('/admin');
    return result;
}
