import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { EnvConfig } from './config/env.validation';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    // Structured JSON logs in staging/production; human-readable in development
    logger: ['error', 'warn', 'log', 'verbose', 'debug'],
  });

  const config = app.get(ConfigService<EnvConfig, true>);
  const port = config.get('PORT');
  const apiPrefix = config.get('API_PREFIX');
  const nodeEnv = config.get('NODE_ENV');
  const corsOrigins = config.get('CORS_ORIGINS').split(',').map((o: string) => o.trim());

  // ---------------------------------------------------------------------------
  // Global API prefix — all routes served under /api/v1/
  // ---------------------------------------------------------------------------
  app.setGlobalPrefix(apiPrefix);

  // ---------------------------------------------------------------------------
  // CORS — restrict to configured origins per environment
  // ---------------------------------------------------------------------------
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ---------------------------------------------------------------------------
  // Global validation pipe — strips unknown properties and validates DTOs
  // ---------------------------------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ---------------------------------------------------------------------------
  // Graceful shutdown hooks — allows Prisma to disconnect cleanly on SIGTERM
  // ---------------------------------------------------------------------------
  app.enableShutdownHooks();

  await app.listen(port);

  logger.log(`Application running in [${nodeEnv}] mode`);
  logger.log(`Listening on http://localhost:${port}/${apiPrefix}`);
  logger.log(`Health check: http://localhost:${port}/${apiPrefix}/health`);
}

bootstrap().catch((error: unknown) => {
  new Logger('Bootstrap').fatal('Fatal error during bootstrap', error);
  process.exit(1);
});
