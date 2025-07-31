import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): any {
    return { 
      message: 'n8n Clone API Gateway - Entry point for all microservices',
      version: '1.0.0',
      services: [
        'user-management',
        'workflow-orchestrator', 
        'node-runtime-engine',
        'trigger-manager',
        'credentials-vault',
        'execution-history',
        'template-manager',
        'variable-manager',
        'queue-processor',
        'notification-hub',
        'monitoring-service'
      ]
    };
  }
}
