import { Controller, Get, Post, Param, Query } from '@nestjs/common';
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
      service: 'monitoring-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: this.appService.getUptime(),
      monitoredServices: this.appService.getServiceHealth()
    };
  }

  @Get('dashboard')
  getDashboard() {
    return this.appService.getDashboardData();
  }

  @Get('services')
  getServices() {
    return {
      services: this.appService.getServiceHealth(),
      summary: this.getServicesSummary()
    };
  }

  @Get('services/:name')
  getService(@Param('name') serviceName: string) {
    const service = this.appService.getServiceHealth(serviceName);
    if (!service) {
      return { error: 'Service not found' };
    }
    return service;
  }

  @Get('metrics')
  getMetrics() {
    return this.appService.getSystemMetrics();
  }

  @Get('alerts')
  getAlerts(@Query('limit') limit?: string) {
    const alertLimit = limit ? parseInt(limit) : 50;
    return {
      alerts: this.appService.getAlerts(alertLimit),
      total: this.appService.getAlerts().length
    };
  }

  @Post('alerts/:id/acknowledge')
  acknowledgeAlert(@Param('id') alertId: string) {
    const success = this.appService.acknowledgeAlert(alertId);
    return {
      success,
      message: success ? 'Alert acknowledged' : 'Alert not found'
    };
  }

  @Get('uptime')
  getUptime() {
    return {
      uptime: this.appService.getUptime(),
      uptimeFormatted: this.formatUptime(this.appService.getUptime())
    };
  }

  private getServicesSummary() {
    const services = this.appService.getServiceHealth() as any[];
    return {
      total: services.length,
      healthy: services.filter(s => s.status === 'healthy').length,
      unhealthy: services.filter(s => s.status === 'unhealthy').length,
      unknown: services.filter(s => s.status === 'unknown').length
    };
  }

  private formatUptime(uptimeMs: number): string {
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}
