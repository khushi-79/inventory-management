import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';

/**
 * AppModule is the root module of the NestJS application.
 *
 * Configuration loading order:
 * 1. ConfigModule loads and validates .env via Zod (validateEnv).
 * 2. PrismaModule connects to PostgreSQL and is exported globally.
 * 3. Feature modules are imported as the application grows sprint by sprint.
 */
@Module({
  imports: [
    // ---------------------------------------------------------------------------
    // Configuration — loads .env, validates all vars with Zod at startup
    // isGlobal: true makes ConfigService injectable everywhere without re-importing
    // ---------------------------------------------------------------------------
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: ['.env'],
    }),

    // ---------------------------------------------------------------------------
    // Database — global Prisma ORM module
    // ---------------------------------------------------------------------------
    PrismaModule,

    // ---------------------------------------------------------------------------
    // Feature Modules — Sprint 1: Health check only
    // ---------------------------------------------------------------------------
    HealthModule,
  ],
})
export class AppModule {}
