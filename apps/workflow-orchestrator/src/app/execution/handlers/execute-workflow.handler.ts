import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { ExecuteWorkflowCommand } from '../commands/execute-workflow.command';
import { WorkflowExecutionEngine } from '../workflow-execution-engine.service';
import { ExecutionStartedEvent } from '../events/execution-started.event';
import { ExecutionStatus } from '@n8n-clone/shared';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
@CommandHandler(ExecuteWorkflowCommand)
export class ExecuteWorkflowHandler implements ICommandHandler<ExecuteWorkflowCommand> {
  private readonly logger = new Logger(ExecuteWorkflowHandler.name);

  constructor(
    private readonly executionEngine: WorkflowExecutionEngine,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: ExecuteWorkflowCommand): Promise<{ executionId: string; status: ExecutionStatus }> {
    this.logger.log(`Executing workflow: ${command.workflowId}`);

    try {
      // Generate execution ID
      const executionId = uuidv4();

      // Start execution
      const result = await this.executionEngine.execute({
        executionId,
        workflowId: command.workflowId,
        inputData: command.inputData,
        userId: command.userId,
        source: command.source,
        async: command.async,
        options: command.options
      });

      // Emit execution started event
      this.eventBus.publish(new ExecutionStartedEvent(
        executionId,
        command.workflowId,
        command.userId,
        command.source
      ));

      return {
        executionId,
        status: result.status
      };
    } catch (error) {
      this.logger.error(`Failed to execute workflow ${command.workflowId}:`, error);
      throw error;
    }
  }
}
