import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { HttpService } from '@nestjs/axios';
import { TriggerExecutionResult, TriggerEvent, WebhookTriggerConfig } from '@n8n-clone/shared/types';

@Injectable()
export class WebhookTriggersService {
  private readonly logger = new Logger(WebhookTriggersService.name);

  constructor(
    private readonly eventBus: EventBus,
    private readonly httpService: HttpService
  ) {}

  async handleWebhook(event: TriggerEvent, config: WebhookTriggerConfig): Promise<TriggerExecutionResult> {
    this.logger.log(`Handling webhook for trigger ${event.triggerId}`);

    try {
      // Here you would add the logic to process the webhook
      // This could include authentication, validation, and processing

      // Simulating an execution result
      const result: TriggerExecutionResult = {
        success: true,
        data: { message: 'Webhook handled successfully' },
        duration: 100,
        timestamp: new Date()
      };

      return result;
    } catch (error) {
      this.logger.error(`Failed to process webhook for trigger ${event.triggerId}`, error);
      return {
        success: false,
        error: {
          message: error.message,
          stack: error.stack
        },
        duration: 0,
        timestamp: new Date()
      };
    }
  }
}

