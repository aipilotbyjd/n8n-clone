import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { ExecutionStartedEvent } from '../events/execution-started.event';

@Injectable()
@EventsHandler(ExecutionStartedEvent)
export class ExecutionStartedHandler implements IEventHandler<ExecutionStartedEvent> {
  private readonly logger = new Logger(ExecutionStartedHandler.name);

  async handle(event: ExecutionStartedEvent): Promise<void> {
    this.logger.log(`Execution started: ${event.executionId} for workflow: ${event.workflowId}`);
    
    // Here you can:
    // - Log execution start to monitoring service
    // - Update execution history
    // - Send notifications
    // - Update metrics
    
    // Example: Update execution history (would be in a real implementation)
    // await this.executionHistoryService.recordStart(event);
  }
}
