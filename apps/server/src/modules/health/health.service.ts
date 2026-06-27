import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { HealthCheckResponseDto } from './dto/health-check-response.dto';
import { EnvConfig } from '../../config/env.validation';

/**
 * HealthService performs liveness and dependency checks.
 * Queries the database with a lightweight raw SQL ping to verify connectivity
 * without loading any application data.
 */
@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<EnvConfig, true>,
  ) {}

  async check(): Promise<HealthCheckResponseDto> {
    const dbStatus = await this.checkDatabase();

    const overallStatus = dbStatus === 'ok' ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      environment: this.config.get('NODE_ENV'),
      uptimeSeconds: Math.floor(process.uptime()),
      dependencies: {
        database: dbStatus,
      },
    };
  }

  private async checkDatabase(): Promise<'ok' | 'error'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'ok';
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return 'error';
    }
  }
}
