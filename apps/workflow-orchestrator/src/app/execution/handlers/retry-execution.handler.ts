import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { RetryExecutionCommand } from '../commands/retry-execution.command';
import { WorkflowExecutionEngine } from '../workflow-execution-engine.service';
import { ExecutionRetryEvent } from '../events/execution-retry.event';
import { ExecutionStatus } from '@n8n-clone/shared';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
@CommandHandler(RetryExecutionCommand)
export class RetryExecutionHandler implements ICommandHandler<RetryExecutionCommand> {
  private readonly logger = new Logger(RetryExecutionHandler.name);

  constructor(
    private readonly executionEngine: WorkflowExecutionEngine,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: RetryExecutionCommand): Promise<{ executionId: string; status: ExecutionStatus }> {
    this.logger.log(`Retrying execution: ${command.executionId}`);

    try {
      // Generate new execution ID for retry
      const newExecutionId = uuidv4();

      const result = await this.executionEngine.retry({
        originalExecutionId: command.executionId,
        newExecutionId,
        fromNode: command.fromNode,
        loadStaticData: command.loadStaticData,
        userId: command.userId
      });

      // Emit execution retry event
      this.eventBus.publish(new ExecutionRetryEvent(
        command.executionId,
        newExecutionId,
        command.userId,
        command.fromNode
      ));

      return {
        executionId: newExecutionId,
        status: result.status
      };
    } catch (error) {
      this.logger.error(`Failed to retry execution ${command.executionId}:`, error);
      throw error;
    }
  }
}
