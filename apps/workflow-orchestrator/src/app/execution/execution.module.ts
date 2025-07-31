import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';

import { ExecutionService } from './execution.service';
import { ExecutionController } from './execution.controller';
import { WorkflowExecutionEngine } from './workflow-execution-engine.service';
import { NodeExecutionService } from './node-execution.service';
import { ExecutionContextService } from './execution-context.service';

// Command Handlers
import { ExecuteWorkflowHandler } from './handlers/execute-workflow.handler';
import { StopExecutionHandler } from './handlers/stop-execution.handler';
import { RetryExecutionHandler } from './handlers/retry-execution.handler';

// Event Handlers
import { ExecutionStartedHandler } from './handlers/execution-started.handler';
import { ExecutionCompletedHandler } from './handlers/execution-completed.handler';
import { ExecutionFailedHandler } from './handlers/execution-failed.handler';

const CommandHandlers = [
  ExecuteWorkflowHandler,
  StopExecutionHandler,
  RetryExecutionHandler,
];

const EventHandlers = [
  ExecutionStartedHandler,
  ExecutionCompletedHandler,
  ExecutionFailedHandler,
];

@Module({
  imports: [
    CqrsModule,
    HttpModule,
  ],
  controllers: [ExecutionController],
  providers: [
    ExecutionService,
    WorkflowExecutionEngine,
    NodeExecutionService,
    ExecutionContextService,
    ...CommandHandlers,
    ...EventHandlers,
  ],
  exports: [
    ExecutionService,
    WorkflowExecutionEngine,
    NodeExecutionService,
  ],
})
export class ExecutionModule {}
