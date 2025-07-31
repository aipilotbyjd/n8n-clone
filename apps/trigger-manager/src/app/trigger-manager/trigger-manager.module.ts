import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';

import { TriggerManagerService } from './trigger-manager.service';

// Simplified for now - complex handlers can be added later

@Module({
  imports: [
    CqrsModule,
    HttpModule,
  ],
  providers: [
    TriggerManagerService,
  ],
  exports: [
    TriggerManagerService,
  ],
})
export class TriggerManagerModule {}
