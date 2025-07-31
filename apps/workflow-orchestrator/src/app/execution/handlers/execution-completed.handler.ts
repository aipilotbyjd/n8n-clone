import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { ExecutionCompletedEvent } from '../events/execution-completed.event';

@Injectable()
@EventsHandler(ExecutionCompletedEvent)
export class ExecutionCompletedHandler implements IEventHandler<ExecutionCompletedEvent> {
  private readonly logger = new Logger(ExecutionCompletedHandler.name);

  async handle(event: ExecutionCompletedEvent): Promise<void> {
    this.logger.log(`Execution completed: ${event.executionId} with status: ${event.status} (${event.duration}ms)`);
    
    // Here you can:
    // - Log execution completion to monitoring service
    // - Update execution history
    // - Send success notifications
    // - Update metrics and analytics
    // - Trigger webhooks
    // - Clean up resources
    
    // Example implementations:
    // await this.executionHistoryService.recordCompletion(event);
    // await this.metricsService.recordExecutionTime(event.duration);
    // await this.webhookService.triggerCompletionWebhooks(event);
  }
}
