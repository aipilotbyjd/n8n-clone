import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Trigger modules
import { CronTriggersModule } from './cron-triggers/cron-triggers.module';
import { WebhookTriggersModule } from './webhook-triggers/webhook-triggers.module';
import { PollingTriggersModule } from './polling-triggers/polling-triggers.module';
import { TriggerManagerModule } from './trigger-manager/trigger-manager.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CqrsModule,
    HttpModule,
    ScheduleModule.forRoot(),
    CronTriggersModule,
    WebhookTriggersModule,
    PollingTriggersModule,
    TriggerManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
