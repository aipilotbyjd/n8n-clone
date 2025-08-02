import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { 
  HealthCheckService, 
  HealthCheck, 
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator 
} from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Health check endpoint', 
    description: 'Returns the health status of the API Gateway and its dependencies' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Health check successful',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          properties: {
            database: { type: 'object' },
            memory_heap: { type: 'object' },
            memory_rss: { type: 'object' },
            storage: { type: 'object' }
          }
        },
        error: { type: 'object' },
        details: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 503, description: 'Health check failed' })
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health check
      () => this.db.pingCheck('database'),
      
      // Memory health checks
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      
      // Disk health check
      () => this.disk.checkStorage('storage', { 
        path: '/', 
        thresholdPercent: 0.9 
      }),
    ]);
  }

  @Get('ready')
  @ApiOperation({ 
    summary: 'Readiness check', 
    description: 'Returns if the service is ready to accept traffic' 
  })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  readiness() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env['npm_package_version'] || '1.0.0'
    };
  }

  @Get('live')
  @ApiOperation({ 
    summary: 'Liveness check', 
    description: 'Returns if the service is alive' 
  })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  liveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      pid: process.pid,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
  }
}
