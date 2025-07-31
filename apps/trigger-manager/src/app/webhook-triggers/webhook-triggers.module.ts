import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { WebhookTriggersService } from './webhook-triggers.service';

@Module({
  imports: [HttpModule],
  providers: [
    WebhookTriggersService,
  ],
  exports: [
    WebhookTriggersService,
  ],
})
export class WebhookTriggersModule {}
