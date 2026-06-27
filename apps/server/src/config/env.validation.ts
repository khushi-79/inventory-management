import { z, ZodIssue } from 'zod';

/**
 * Zod schema that validates all required environment variables at application
 * startup. Any missing or malformed variable causes an immediate fatal error
 * with a descriptive message so the problem is caught before runtime.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().default('api/v1'),

  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),

  CORS_ORIGINS: z.string().default('http://localhost:8081'),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates process.env against the schema and returns a typed config object.
 * Called by @nestjs/config as the `validate` option in AppModule.
 */
export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const formatted = result.error.issues
      .map((e: ZodIssue) => `  [${e.path.join('.')}] ${e.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${formatted}`);
  }

  return result.data;
}
