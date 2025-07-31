import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';

// Domain
import { Workflow } from '@n8n-clone/infrastructure';

// Application Layer
import { CreateWorkflowHandler } from '@n8n-clone/application-workflow';

// Infrastructure Layer
import { WorkflowRepository } from '@n8n-clone/infrastructure';
import { IWorkflowRepository } from '@n8n-clone/domain-workflow';

const CommandHandlers = [CreateWorkflowHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Workflow]),
    CqrsModule,
  ],
  controllers: [WorkflowController],
  providers: [
    WorkflowService,
    {
      provide: 'IWorkflowRepository',
      useClass: WorkflowRepository,
    },
    ...CommandHandlers,
  ],
  exports: [WorkflowService],
})
export class WorkflowModule {}
