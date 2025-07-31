import { Injectable, Logger } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { WorkflowExecutionEngine } from './workflow-execution-engine.service';
import { ExecutionContextService } from './execution-context.service';
import { ExecuteWorkflowCommand } from './commands/execute-workflow.command';
import { StopExecutionCommand } from './commands/stop-execution.command';
import { RetryExecutionCommand } from './commands/retry-execution.command';
import { GetExecutionStatusQuery } from './queries/get-execution-status.query';
import { ExecutionStatus } from '@n8n-clone/shared';

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
    private readonly executionEngine: WorkflowExecutionEngine,
    private readonly contextService: ExecutionContextService,
  ) {}

  async executeWorkflow(
    workflowId: string,
    data?: any,
    options?: {
      async?: boolean;
      userId?: string;
      source?: string;
    }
  ): Promise<{ executionId: string; status: ExecutionStatus }> {
    this.logger.log(`Starting workflow execution: ${workflowId}`);

    const command = new ExecuteWorkflowCommand(
      workflowId,
      data,
      options?.userId,
      options?.source || 'manual',
      options?.async || false
    );

    const result = await this.commandBus.execute(command);
    return result;
  }

  async stopExecution(executionId: string, userId?: string): Promise<void> {
    this.logger.log(`Stopping execution: ${executionId}`);

    const command = new StopExecutionCommand(executionId, userId);
    await this.commandBus.execute(command);
  }

  async retryExecution(
    executionId: string,
    options?: {
      fromNode?: string;
      loadStaticData?: boolean;
      userId?: string;
    }
  ): Promise<{ executionId: string; status: ExecutionStatus }> {
    this.logger.log(`Retrying execution: ${executionId}`);

    const command = new RetryExecutionCommand(
      executionId,
      options?.fromNode,
      options?.loadStaticData || false,
      options?.userId
    );

    const result = await this.commandBus.execute(command);
    return result;
  }

  async getExecutionStatus(executionId: string): Promise<ExecutionStatus> {
    const query = new GetExecutionStatusQuery(executionId);
    return await this.queryBus.execute(query);
  }

  async getActiveExecutions(): Promise<string[]> {
    return this.executionEngine.getActiveExecutions();
  }

  async getExecutionContext(executionId: string) {
    return this.contextService.getContext(executionId);
  }
}
