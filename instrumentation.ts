import type { ScheduledTask } from 'node-cron';
import { env } from './lib/env';

declare global {
    var rsiVerificationJob: ScheduledTask | undefined;
}

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        await import('@/lib/env'); // wirft Error beim Import, falls Env unvollständig -> App startet gar nicht
        const cron = await import('node-cron');

        console.log('🚀 [Instrumentation] Hintergrund-Tasks werden initialisiert...');

        if (!globalThis.rsiVerificationJob) {
            globalThis.rsiVerificationJob = cron.schedule('*/10 * * * *', async () => {
                console.log(
                    '⏱️ [Cron] Starte automatische RSI-Hintergrundprüfung für PENDING-User...'
                );

                try {
                    const baseUrl = env.NEXTAUTH_URL;

                    const response = await fetch(`${baseUrl}/api/cron/verify`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-cron-secret': env.CRON_SECRET,
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Cron-Endpunkt lieferte Status ${response.status}`);
                    }

                    const result = await response.json();
                    console.log(`✅ [Cron] Hintergrundprüfung beendet:`, result);
                } catch (error) {
                    console.error(
                        '❌ [Cron] Fehler bei der automatischen Hintergrundprüfung:',
                        error
                    );
                }
            });

            console.log(
                '📅 [Instrumentation] RSI-Verifizierungs-Cron-Job (alle 10 Min) erfolgreich registriert.'
            );
        }
    }
}
