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
      service: 'api-gateway',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      routes: [
        '/api - Gateway info',
        '/api/health - Health check',
        '/api/workflows - Workflow operations',
        '/api/users - User management (proxied)',
        '/api/executions - Execution management (proxied)',
        '/api/triggers - Trigger management (proxied)'
      ]
    };
  }

  @Get('services')
  getServices() {
    return {
      gateway: 'http://localhost:3000',
      services: {
        'user-management': 'http://localhost:3004',
        'workflow-orchestrator': 'http://localhost:3001', 
        'node-runtime-engine': 'http://localhost:3002',
        'trigger-manager': 'http://localhost:3003',
        'credentials-vault': 'http://localhost:3005',
        'execution-history': 'http://localhost:3006',
        'template-manager': 'http://localhost:3007',
        'variable-manager': 'http://localhost:3008',
        'queue-processor': 'http://localhost:3009',
        'notification-hub': 'http://localhost:3010',
        'monitoring-service': 'http://localhost:3011'
      }
    };
  }
}
