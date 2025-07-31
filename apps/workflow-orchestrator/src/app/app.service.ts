import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): any {
    return { 
      message: 'Workflow Orchestrator Service - Core workflow execution engine',
      version: '1.0.0',
      capabilities: [
        'workflow-execution',
        'state-management',
        'flow-control',
        'error-handling',
        'node-orchestration',
        'retry-logic'
      ],
      status: 'ready'
    };
  }
}
