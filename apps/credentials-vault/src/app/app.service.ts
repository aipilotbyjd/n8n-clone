import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): any {
    return { 
      message: 'Credentials Vault - Secure credential management and OAuth flows',
      version: '1.0.0',
      features: [
        'credential-encryption',
        'oauth-flows',
        'api-key-management',
        'connection-testing'
      ],
      security: 'AES-256 encrypted'
    };
  }
}
