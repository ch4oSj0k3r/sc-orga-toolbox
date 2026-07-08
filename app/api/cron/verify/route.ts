import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRsiProfileData } from '@/lib/auth-utils';

export async function POST() {
    try {
        // Optional: Hier könnte man noch einen Secret-Token-Abgleich einbauen,
        // damit nicht Hinz und Kunst den Cron-Job von außen triggern können.

        // 1. Alle User holen, die noch auf die Verifizierung warten
        const pendingUsers = await prisma.user.findMany({
            where: { status: 'PENDING' },
        });

        if (pendingUsers.length === 0) {
            return NextResponse.json(
                { message: 'Keine ausstehenden Registrierungen gefunden.' },
                { status: 200 }
            );
        }

        const targetOrgSid = process.env.VALID_ORGA_ID || 'KNEBELARMY'; // Default-Wert, falls nicht gesetzt
        const MAX_ATTEMPTS = process.env.MAX_ATTEMPTS ? parseInt(process.env.MAX_ATTEMPTS) : 18; // 18 Versuche * 10 Minuten = 3 Stunden Puffer

        let verifiedCount = 0;
        let rejectedCount = 0;
        let incrementedCount = 0;

        // 2. Alle Pending-User sequenziell prüfen
        for (const user of pendingUsers) {
            const rsiData = await getRsiProfileData(user.sc_handle);

            // Falls die API z.B. temporär offline ist, überspringen wir den User, statt ihn direkt zu rejecten
            if (!rsiData) {
                console.warn(
                    `Verifizierung für ${user.sc_handle} temporär übersprungen (API-Fehler).`
                );
                continue;
            }

            const hasToken = rsiData.bio.includes(user.verification_token);
            const isIndOrga = rsiData.organizationId.toUpperCase() === targetOrgSid.toUpperCase();

            if (hasToken && isIndOrga) {
                // Erfolg: Wechselt auf VERIFIED (wird im Admin-Dashboard sichtbar)
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        status: 'VERIFIED',
                        role: 'GUEST', // Standard-Rolle nach dem Token-Check
                        failed_attempts: 0, // Reset der Fehlversuche nach erfolgreicher Verifizierung
                    },
                });
                verifiedCount++;
                console.log(
                    `✅ User ${user.sc_handle} erfolgreich verifiziert (Status: VERIFIED).`
                );
            } else {
                // FEHLSCHLAG: Versuche hochzählen
                const nextAttempts = user.failed_attempts + 1;

                if (nextAttempts >= MAX_ATTEMPTS) {
                    // Limit erreicht -> REJECTED
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            status: 'REJECTED',
                            failed_attempts: nextAttempts,
                            rejectedAt: new Date(),
                        },
                    });
                    rejectedCount++;
                    console.log(
                        `🚫 User ${user.sc_handle} hat das Limit von ${MAX_ATTEMPTS} Versuchen erreicht. Status: REJECTED.`
                    );
                } else {
                    // Limit noch nicht erreicht -> Nur Counter erhöhen
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            failed_attempts: nextAttempts,
                        },
                    });
                    incrementedCount++;
                    console.log(
                        `❌ Validierung für ${user.sc_handle} fehlgeschlagen. Versuch ${nextAttempts}/${MAX_ATTEMPTS}.`
                    );
                }
            }
        }

        return NextResponse.json(
            {
                message: 'Cron-Job erfolgreich ausgeführt.',
                processed: pendingUsers.length,
                verified: verifiedCount,
                failed_or_skipped: rejectedCount,
                attempts_incremented: incrementedCount,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Fehler im Cron-Verifizierungs-Endpunkt:', error);
        return NextResponse.json(
            { error: 'Interner Server-Fehler beim Ausführen des Cron-Jobs.' },
            { status: 500 }
        );
    }
}
