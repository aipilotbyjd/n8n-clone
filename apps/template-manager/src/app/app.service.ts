import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): any {
    return { 
      message: 'Template Manager - Workflow templates and marketplace',
      version: '1.0.0',
      features: [
        'template-storage',
        'template-sharing',
        'version-control',
        'community-marketplace'
      ]
    };
  }
}
