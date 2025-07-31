import { Injectable, Logger } from '@nestjs/common';

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  lastCheck: Date;
  uptime?: number;
  error?: string;
}

export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
  };
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private services: Map<string, ServiceHealth> = new Map();
  private alerts: any[] = [];
  private startTime = Date.now();

  constructor() {
    // Initialize monitored services
    this.initializeServices();
    
    // Start periodic health checks
    setInterval(() => this.performHealthChecks(), 30000); // Every 30 seconds
  }

  getData(): any {
    return { 
      message: 'Monitoring Service - System monitoring and health checks',
      version: '1.0.0',
      features: [
        'health-checks',
        'performance-monitoring',
        'alerting',
        'system-diagnostics',
        'uptime-tracking'
      ],
      monitoredServices: Array.from(this.services.keys()),
      systemUptime: this.getUptime()
    };
  }

  private initializeServices(): void {
    const serviceList = [
      'api-gateway',
      'user-management', 
      'workflow-orchestrator',
      'node-runtime-engine',
      'trigger-manager',
      'credentials-vault',
      'execution-history',
      'template-manager',
      'variable-manager',
      'queue-processor',
      'notification-hub'
    ];

    serviceList.forEach(service => {
      this.services.set(service, {
        name: service,
        status: 'unknown',
        lastCheck: new Date(),
        uptime: 0
      });
    });
  }

  private async performHealthChecks(): Promise<void> {
    for (const [serviceName, serviceHealth] of this.services) {
      try {
        const startTime = Date.now();
        
        // Simulate health check (in real implementation, make HTTP calls)
        await this.simulateHealthCheck(serviceName);
        
        const responseTime = Date.now() - startTime;
        
        this.services.set(serviceName, {
          ...serviceHealth,
          status: 'healthy',
          responseTime,
          lastCheck: new Date(),
          uptime: (serviceHealth.uptime || 0) + 30000
        });
        
      } catch (error) {
        this.services.set(serviceName, {
          ...serviceHealth,
          status: 'unhealthy',
          lastCheck: new Date(),
          error: error.message
        });
        
        this.createAlert('service_down', `Service ${serviceName} is unhealthy: ${error.message}`);
      }
    }
  }

  private async simulateHealthCheck(serviceName: string): Promise<void> {
    // Simulate random health check results
    const isHealthy = Math.random() > 0.1; // 90% success rate
    
    if (!isHealthy) {
      throw new Error(`Service ${serviceName} is not responding`);
    }
    
    // Simulate response time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
  }

  private createAlert(type: string, message: string): void {
    const alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      message,
      severity: type === 'service_down' ? 'critical' : 'warning',
      timestamp: new Date(),
      acknowledged: false
    };
    
    this.alerts.unshift(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }
    
    this.logger.warn(`ALERT [${alert.severity.toUpperCase()}]: ${message}`);
  }

  getSystemMetrics(): SystemMetrics {
    const memUsage = process.memoryUsage();
    
    return {
      cpu: {
        usage: Math.random() * 100, // Simulated CPU usage
        cores: require('os').cpus().length
      },
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
      },
      disk: {
        used: 1024 * 1024 * 1024 * 5, // Simulated 5GB used
        total: 1024 * 1024 * 1024 * 100, // Simulated 100GB total
        percentage: 5
      },
      network: {
        bytesIn: Math.floor(Math.random() * 1000000),
        bytesOut: Math.floor(Math.random() * 1000000)
      }
    };
  }

  getServiceHealth(serviceName?: string): ServiceHealth | ServiceHealth[] {
    if (serviceName) {
      return this.services.get(serviceName) || null;
    }
    return Array.from(this.services.values());
  }

  getAlerts(limit: number = 50): any[] {
    return this.alerts.slice(0, limit);
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date();
      return true;
    }
    return false;
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }

  getDashboardData(): any {
    const services = Array.from(this.services.values());
    const healthyServices = services.filter(s => s.status === 'healthy').length;
    const totalServices = services.length;
    const recentAlerts = this.alerts.filter(a => !a.acknowledged).length;
    
    return {
      overview: {
        totalServices,
        healthyServices,
        unhealthyServices: totalServices - healthyServices,
        systemUptime: this.getUptime(),
        activeAlerts: recentAlerts
      },
      services: services,
      metrics: this.getSystemMetrics(),
      recentAlerts: this.getAlerts(10)
    };
  }
}
