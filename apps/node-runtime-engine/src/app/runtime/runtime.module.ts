import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';

import { RuntimeService } from './runtime.service';
import { SecureExecutorService } from './secure-executor.service';

// For now, we'll create a simple module without complex handlers
// These can be added later as the system grows

@Module({
  imports: [
    CqrsModule,
    HttpModule,
  ],
  providers: [
    RuntimeService,
    SecureExecutorService,
  ],
  exports: [
    RuntimeService,
    SecureExecutorService,
  ],
})
export class RuntimeModule {}
