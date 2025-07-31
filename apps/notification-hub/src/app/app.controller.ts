import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { AppService, NotificationConfig } from './app.service';

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
      service: 'notification-hub',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      stats: this.appService.getNotificationStats()
    };
  }

  @Post('send')
  async sendNotification(@Body() notificationData: {
    type: string;
    recipient: string;
    subject: string;
    content: string;
    channels?: string[];
  }) {
    const notificationId = await this.appService.sendNotification(
      notificationData.type,
      notificationData.recipient,
      notificationData.subject,
      notificationData.content,
      notificationData.channels
    );
    return { notificationId, status: 'sent' };
  }

  @Get('notifications/:id')
  getNotification(@Param('id') notificationId: string) {
    const notification = this.appService.getNotification(notificationId);
    if (!notification) {
      return { error: 'Notification not found' };
    }
    return notification;
  }

  @Get('stats')
  getStats() {
    return this.appService.getNotificationStats();
  }

  @Put('config')
  updateConfig(@Body() config: Partial<NotificationConfig>) {
    this.appService.updateConfig(config);
    return { status: 'configuration updated' };
  }

  @Post('send/email')
  async sendEmail(@Body() emailData: {
    recipient: string;
    subject: string;
    content: string;
  }) {
    const notificationId = await this.appService.sendNotification(
      'email',
      emailData.recipient,
      emailData.subject,
      emailData.content,
      ['email']
    );
    return { notificationId, channel: 'email' };
  }

  @Post('send/slack')
  async sendSlack(@Body() slackData: {
    channel: string;
    subject: string;
    content: string;
  }) {
    const notificationId = await this.appService.sendNotification(
      'slack',
      slackData.channel,
      slackData.subject,
      slackData.content,
      ['slack']
    );
    return { notificationId, channel: 'slack' };
  }
}
