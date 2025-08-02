import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as fs from 'fs';
import * as os from 'os';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor() {}

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
  check() {
    const memory = process.memoryUsage();
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heap_used: memory.heapUsed,
        heap_total: memory.heapTotal,
        rss: memory.rss,
        external: memory.external,
        system_free: freeMemory,
        system_total: totalMemory
      },
      cpu: {
        load_average: os.loadavg(),
        cpu_count: os.cpus().length
      },
      version: process.env['npm_package_version'] || '1.0.0'
    };
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
