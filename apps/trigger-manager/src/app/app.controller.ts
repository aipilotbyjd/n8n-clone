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
      service: 'trigger-manager',
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      modules: [
        'cron-triggers',
        'webhook-triggers',
        'polling-triggers',
        'trigger-manager'
      ],
      activeTriggers: 0,
      scheduledJobs: 0,
      webhookEndpoints: 0
    };
  }
}
