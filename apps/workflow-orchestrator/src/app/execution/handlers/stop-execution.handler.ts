import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { StopExecutionCommand } from '../commands/stop-execution.command';
import { WorkflowExecutionEngine } from '../workflow-execution-engine.service';
import { ExecutionStoppedEvent } from '../events/execution-stopped.event';

@Injectable()
@CommandHandler(StopExecutionCommand)
export class StopExecutionHandler implements ICommandHandler<StopExecutionCommand> {
  private readonly logger = new Logger(StopExecutionHandler.name);

  constructor(
    private readonly executionEngine: WorkflowExecutionEngine,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: StopExecutionCommand): Promise<void> {
    this.logger.log(`Stopping execution: ${command.executionId}`);

    try {
      await this.executionEngine.stop(command.executionId, command.reason);

      // Emit execution stopped event
      this.eventBus.publish(new ExecutionStoppedEvent(
        command.executionId,
        command.userId,
        command.reason
      ));
    } catch (error) {
      this.logger.error(`Failed to stop execution ${command.executionId}:`, error);
      throw error;
    }
  }
}
