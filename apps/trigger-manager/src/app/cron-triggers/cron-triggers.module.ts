import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';

import { CronSchedulerService } from './cron-scheduler.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  providers: [
    CronSchedulerService,
  ],
  exports: [
    CronSchedulerService,
  ],
})
export class CronTriggersModule {}
