import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): any {
    return { 
      message: 'Trigger Manager - Handles all workflow triggers and scheduling',
      version: '1.0.0',
      triggerTypes: [
        'cron-triggers',
        'webhook-triggers',
        'polling-triggers',
        'file-triggers',
        'manual-triggers'
      ],
      activeSchedulers: {
        cron: 'running',
        webhook: 'listening',
        polling: 'active'
      }
    };
  }
}
