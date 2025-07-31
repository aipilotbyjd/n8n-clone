import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface ServiceEndpoint {
  name: string;
  url: string;
  healthPath: string;
  timeout: number;
}

@Injectable()
export class ServiceProxyService {
  private readonly logger = new Logger(ServiceProxyService.name);
  
  private readonly services: Map<string, ServiceEndpoint> = new Map([
    ['user-management', {
      name: 'user-management',
      url: 'http://localhost:3004',
      healthPath: '/api/health',
      timeout: 5000
    }],
    ['workflow-orchestrator', {
      name: 'workflow-orchestrator',
      url: 'http://localhost:3001',
      healthPath: '/api/health',
      timeout: 10000
    }],
    ['node-runtime-engine', {
      name: 'node-runtime-engine',
      url: 'http://localhost:3002',
      healthPath: '/api/health',
      timeout: 15000
    }],
    ['trigger-manager', {
      name: 'trigger-manager',
      url: 'http://localhost:3003',
      healthPath: '/api/health',
      timeout: 5000
    }],
    ['credentials-vault', {
      name: 'credentials-vault',
      url: 'http://localhost:3005',
      healthPath: '/api/health',
      timeout: 5000
    }],
    ['execution-history', {
      name: 'execution-history',
      url: 'http://localhost:3006',
      healthPath: '/api/health',
      timeout: 5000
    }],
    ['notification-hub', {
      name: 'notification-hub',
      url: 'http://localhost:3010',
      healthPath: '/api/health',
      timeout: 5000
    }],
    ['monitoring-service', {
      name: 'monitoring-service',
      url: 'http://localhost:3011',
      healthPath: '/api/health',
      timeout: 5000
    }]
  ]);

  constructor(private readonly httpService: HttpService) {}

  async proxyRequest(serviceName: string, path: string, method: string, data?: any, headers?: any): Promise<any> {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new BadGatewayException(`Service ${serviceName} not found`);
    }

    try {
      const url = `${service.url}${path}`;
      this.logger.log(`Proxying ${method} request to ${url}`);

      const response = await firstValueFrom(
        this.httpService.request({
          method: method as any,
          url,
          data,
          headers,
          timeout: service.timeout
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to proxy request to ${serviceName}: ${error.message}`);
      throw new BadGatewayException(`Service ${serviceName} is unavailable`);
    }
  }

  async checkServiceHealth(serviceName: string): Promise<boolean> {
    const service = this.services.get(serviceName);
    if (!service) {
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${service.url}${service.healthPath}`, {
          timeout: 3000
        })
      );
      return response.status === 200;
    } catch (error) {
      this.logger.warn(`Health check failed for ${serviceName}: ${error.message}`);
      return false;
    }
  }

  async checkAllServicesHealth(): Promise<Record<string, boolean>> {
    const healthChecks = Array.from(this.services.keys()).map(async (serviceName) => {
      const isHealthy = await this.checkServiceHealth(serviceName);
      return [serviceName, isHealthy];
    });

    const results = await Promise.all(healthChecks);
    return Object.fromEntries(results);
  }

  getRegisteredServices(): ServiceEndpoint[] {
    return Array.from(this.services.values());
  }

  getServiceUrl(serviceName: string): string | null {
    const service = this.services.get(serviceName);
    return service ? service.url : null;
  }
}
