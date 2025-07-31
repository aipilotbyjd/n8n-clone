import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): any {
    return { 
      message: 'Variable Manager - Environment and global variable management',
      version: '1.0.0',
      features: [
        'environment-variables',
        'global-variables',
        'variable-encryption',
        'scoping-rules'
      ]
    };
  }
}
