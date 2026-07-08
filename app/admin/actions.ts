'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Hilfsfunktion zur Absicherung der Actions
async function assertAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
        throw new Error('Nicht autorisiert: Nur Admins haben hier Zugriff.');
    }
    return session;
}

async function assertNotLastAdmin(userId: string) {
    const target = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });

    if (target?.role !== 'ADMIN') return;

    const otherAdmins = await prisma.user.count({
        where: { role: 'ADMIN', id: { not: userId } },
    });

    if (otherAdmins === 0) {
        throw new Error('Aktion abgelehnt: Es muss mindestens ein Admin-Account bestehen bleiben.');
    }
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
        PENDING: allUsers.filter((u) => u.status === 'PENDING'),
        VERIFIED: allUsers.filter((u) => u.status === 'VERIFIED'),
        ACTIVE: allUsers.filter((u) => u.status === 'ACTIVE'),
        REJECTED: allUsers.filter((u) => u.status === 'REJECTED'),
        BANNED: allUsers.filter((u) => u.status === 'BANNED'),
    };
}

/**
 * 2. Aktiviert einen verifizierten User -> wird MEMBER
 */
export async function activateUser(userId: string) {
    await assertAdmin();

    await prisma.user.update({
        where: { id: userId },
        data: {
            status: 'ACTIVE',
            role: 'MEMBER', // Standard-Rolle nach Aktivierung
        },
    });

    revalidatePath('/admin');
}

/**
 * 3. Bannt einen aktiven User permanent
 */
export async function banUser(userId: string) {
    const session = await assertAdmin();

    if (session.user.id === userId) {
        throw new Error('Du kannst dich nicht selbst sperren.');
    }
    await assertNotLastAdmin(userId);

    await prisma.user.update({
        where: { id: userId },
        data: { status: 'BANNED', bannedAt: new Date() },
    });

    revalidatePath('/admin');
}

/**
 * 4. Setzt fehlgeschlagene Versuche zurück -> zurück in den Validierungs-Loop
 */
export async function resetUserAttempts(userId: string) {
    await assertAdmin();

    await prisma.user.update({
        where: { id: userId },
        data: {
            status: 'PENDING',
            failed_attempts: 0,
            rejectedAt: null, // Zeitstempel wieder löschen
        },
    });

    revalidatePath('/admin');
}

/**
 * 5. Löscht einen User-Datensatz permanent (Universell)
 */
export async function deleteUser(userId: string) {
    const session = await assertAdmin();

    if (session.user.id === userId) {
        throw new Error('Du kannst deinen eigenen Account nicht löschen.');
    }
    await assertNotLastAdmin(userId);

    await prisma.user.delete({ where: { id: userId } });
    revalidatePath('/admin');
}
