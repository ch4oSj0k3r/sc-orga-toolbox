import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    throw new Error(
        'Fehlende DB_* Umgebungsvariablen für Prisma CLI. Prüfe deine .env-Datei (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).'
    );
}

const databaseUrl =
    `mysql://${DB_USER}:${encodeURIComponent(DB_PASSWORD)}` +
    `@${DB_HOST}:${DB_PORT || '3306'}/${DB_NAME}`;

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        url: databaseUrl,
    },
});
