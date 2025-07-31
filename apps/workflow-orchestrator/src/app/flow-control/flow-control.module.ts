import { Module } from '@nestjs/common';

import { FlowControlService } from './flow-control.service';

@Module({
  providers: [FlowControlService],
  exports: [FlowControlService],
})
export class FlowControlModule {}
