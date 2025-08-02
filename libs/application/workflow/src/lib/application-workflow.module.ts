import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DomainWorkflowModule } from '@n8n-clone/domain/workflow';
import { CreateWorkflowHandler } from './commands/handlers/create-workflow.handler';
import { GetWorkflowsHandler } from './queries/handlers/get-workflows.handler';
import { GetWorkflowByIdHandler } from './queries/handlers/get-workflow-by-id.handler';

const CommandHandlers = [CreateWorkflowHandler];
const QueryHandlers = [GetWorkflowsHandler, GetWorkflowByIdHandler];

@Module({
  imports: [CqrsModule, DomainWorkflowModule],
  controllers: [],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class ApplicationWorkflowModule {}
