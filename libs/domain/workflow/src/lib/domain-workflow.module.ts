import { Module } from '@nestjs/common';
import { WorkflowService } from './services/workflow.service';

@Module({
  controllers: [],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class DomainWorkflowModule {}
