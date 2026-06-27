import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 configuration file.
 *
 * The DATABASE_URL is read from the .env file via dotenv/config import.
 * This approach is required in Prisma 7+ — the datasource url field has been
 * removed from schema.prisma in favour of this centralised config file.
 */

const databaseUrl = process.env['DATABASE_URL'];

if (!databaseUrl) {
  throw new Error(
    '[prisma.config.ts] DATABASE_URL is not set in the environment. ' +
      'Check your .env file before running Prisma commands.',
  );
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});
