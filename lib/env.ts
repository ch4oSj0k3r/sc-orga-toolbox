import 'server-only';

import { z } from 'zod';

const envSchema = z.object({
    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().int().positive().default(3306),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),

    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.url(),
    SESSION_MAX_AGE: z.coerce
        .number()
        .int()
        .positive()
        .default(60 * 60 * 24), // 24h
    SESSION_UPDATE_AGE: z.coerce
        .number()
        .int()
        .positive()
        .default(60 * 15), // 15min
    CRON_SECRET: z.string().min(16, 'CRON_SECRET muss mind. 16 Zeichen lang sein.'),
    ORGA_API_BASE_URL: z.url(),
    ORGA_API_KEY: z.string().min(1),
    VALID_ORGA_ID: z.string().min(1),
    MAX_ATTEMPTS: z.coerce.number().int().positive().default(18),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error(
        '❌ Ungültige oder fehlende Umgebungsvariablen:\n' + z.prettifyError(parsed.error)
    );
    throw new Error('Environment validation failed. Siehe Log oberhalb für Details.');
}
export const env = parsed.data;
