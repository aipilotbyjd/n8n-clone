import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private jobQueue: Map<string, any> = new Map();
  private processingStats = {
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    queuedJobs: 0
  };

  getData(): any {
    return { 
      message: 'Queue Processor - Background job processing and scheduling',
      version: '1.0.0',
      features: [
        'job-scheduling',
        'priority-handling',
        'worker-management',
        'retry-logic',
        'dead-letter-queue'
      ],
      stats: this.processingStats,
      queueSize: this.jobQueue.size
    };
  }

  async addJob(jobType: string, payload: any, priority: number = 0): Promise<string> {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const job = {
      id: jobId,
      type: jobType,
      payload,
      priority,
      status: 'queued',
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3
    };

    this.jobQueue.set(jobId, job);
    this.processingStats.totalJobs++;
    this.processingStats.queuedJobs++;
    
    this.logger.log(`Job ${jobId} added to queue with priority ${priority}`);
    return jobId;
  }

  async processJob(jobId: string): Promise<void> {
    const job = this.jobQueue.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    try {
      job.status = 'processing';
      job.attempts++;
      
      this.logger.log(`Processing job ${jobId} (attempt ${job.attempts})`);
      
      // Simulate job processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      job.status = 'completed';
      job.completedAt = new Date();
      
      this.processingStats.completedJobs++;
      this.processingStats.queuedJobs--;
      
      this.logger.log(`Job ${jobId} completed successfully`);
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      
      if (job.attempts < job.maxAttempts) {
        job.status = 'queued'; // Retry
        this.logger.warn(`Job ${jobId} failed, will retry (attempt ${job.attempts}/${job.maxAttempts})`);
      } else {
        this.processingStats.failedJobs++;
        this.processingStats.queuedJobs--;
        this.logger.error(`Job ${jobId} failed permanently after ${job.attempts} attempts`);
      }
    }
  }

  getJobStatus(jobId: string): any {
    return this.jobQueue.get(jobId) || null;
  }

  getQueueStats(): any {
    return {
      ...this.processingStats,
      queueSize: this.jobQueue.size,
      jobsByStatus: this.getJobsByStatus()
    };
  }

  private getJobsByStatus(): any {
    const stats = { queued: 0, processing: 0, completed: 0, failed: 0 };
    for (const job of this.jobQueue.values()) {
      stats[job.status] = (stats[job.status] || 0) + 1;
    }
    return stats;
  }
}
