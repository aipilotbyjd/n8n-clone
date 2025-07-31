import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

// Simplified polling triggers module

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    // Services can be added later
  ],
  exports: [
    // Services can be exported later
  ],
})
export class PollingTriggersModule {}
