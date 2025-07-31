import { Module } from '@nestjs/common';

import { StateManagementService } from './state-management.service';

@Module({
  providers: [StateManagementService],
  exports: [StateManagementService],
})
export class StateManagementModule {}
