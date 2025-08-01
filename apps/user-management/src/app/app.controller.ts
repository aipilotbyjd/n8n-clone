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
      service: 'user-management',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      modules: [
        'users',
        'workspaces', 
        'permissions',
        'collaboration'
      ]
    };
  }
}
