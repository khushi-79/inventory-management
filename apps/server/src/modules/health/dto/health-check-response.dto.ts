export class HealthCheckResponseDto {
  /** Overall system status. */
  status: 'ok' | 'degraded';

  /** ISO 8601 timestamp of when the check was performed. */
  timestamp: string;

  /** Application environment (development | staging | production). */
  environment: string;

  /** Uptime in seconds since the process started. */
  uptimeSeconds: number;

  /** Status of individual downstream dependencies. */
  dependencies: {
    database: 'ok' | 'error';
  };
}
