import { PrismaClient } from '@/lib/generated/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { env } from './env';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    (() => {
        // 1. Adapter mit den ENV-Variablen konfigurieren
        const adapter = new PrismaMariaDb({
            host: env.DB_HOST,
            port: env.DB_PORT,
            user: env.DB_USER,
            password: env.DB_PASSWORD,
            database: env.DB_NAME,
            connectionLimit: 5,
        });
        // 2. Client mit dem expliziten Adapter füttern
        return new PrismaClient({
            adapter,
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });
    })();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
