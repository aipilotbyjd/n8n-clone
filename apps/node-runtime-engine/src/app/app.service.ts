import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): any {
    return { 
      message: 'Node Runtime Engine - Secure JavaScript execution sandbox',
      version: '1.0.0',
      capabilities: [
        'secure-javascript-execution',
        'expression-evaluation',
        'code-node-execution',
        'sandbox-isolation',
        'vm2-security'
      ],
      sandboxStatus: 'secure',
      supportedLanguages: ['javascript', 'typescript']
    };
  }
}
