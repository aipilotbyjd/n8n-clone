import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('health')
  getHealth() {
    return {
      service: 'node-runtime-engine',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      modules: [
        'runtime',
        'code-execution',
        'expression-parser',
        'sandbox'
      ],
      sandboxSecurity: 'enabled',
      runtimeVersion: process.version,
      memoryUsage: process.memoryUsage()
    };
  }
}
