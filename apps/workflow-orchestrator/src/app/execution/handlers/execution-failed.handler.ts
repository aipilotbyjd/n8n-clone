import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { ExecutionFailedEvent } from '../events/execution-failed.event';

@Injectable()
@EventsHandler(ExecutionFailedEvent)
export class ExecutionFailedHandler implements IEventHandler<ExecutionFailedEvent> {
  private readonly logger = new Logger(ExecutionFailedHandler.name);

  async handle(event: ExecutionFailedEvent): Promise<void> {
    this.logger.error(`Execution failed: ${event.executionId} - ${event.error.message}`);
    
    // Here you can:
    // - Log execution failure to monitoring service
    // - Update execution history with error details
    // - Send error notifications
    // - Update error metrics
    // - Trigger error webhooks
    // - Implement retry logic if applicable
    // - Clean up resources
    
    // Example implementations:
    // await this.executionHistoryService.recordFailure(event);
    // await this.alertingService.sendErrorAlert(event);
    // await this.metricsService.recordExecutionError(event);
    // await this.webhookService.triggerErrorWebhooks(event);
  }
}
