import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('health')
  getHealth() {
    return {
      service: 'queue-processor',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      stats: this.appService.getQueueStats()
    };
  }

  @Post('jobs')
  async addJob(@Body() jobData: { type: string; payload: any; priority?: number }) {
    const jobId = await this.appService.addJob(jobData.type, jobData.payload, jobData.priority);
    return { jobId, status: 'queued' };
  }

  @Get('jobs/:id')
  getJob(@Param('id') jobId: string) {
    const job = this.appService.getJobStatus(jobId);
    if (!job) {
      return { error: 'Job not found' };
    }
    return job;
  }

  @Post('jobs/:id/process')
  async processJob(@Param('id') jobId: string) {
    try {
      await this.appService.processJob(jobId);
      return { status: 'processing started' };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('stats')
  getStats() {
    return this.appService.getQueueStats();
  }
}
