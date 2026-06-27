import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthCheckResponseDto } from './dto/health-check-response.dto';

/**
 * HealthController exposes a public health check endpoint.
 * Used by load balancers, uptime monitors, and CI/CD pipelines
 * to verify the application and its dependencies are running.
 */
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * GET /api/v1/health
   *
   * Returns the operational status of the application and its
   * critical dependencies (database connection).
   *
   * HTTP 200: All systems healthy.
   * HTTP 503: One or more dependencies are unavailable.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async check(): Promise<HealthCheckResponseDto> {
    return this.healthService.check();
  }
}
