import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): any {
    return { 
      message: 'Execution History - Tracks and stores workflow execution history',
      version: '1.0.0',
      features: [
        'execution-logging',
        'performance-metrics',
        'debug-information',
        'audit-trail'
      ]
    };
  }
}
