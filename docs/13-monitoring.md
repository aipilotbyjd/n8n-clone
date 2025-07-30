# 📊 Monitoring & Observability

This document outlines the comprehensive monitoring and observability strategy for the n8n clone project.

## 📈 Metrics Collection

### Prometheus
Prometheus is used as the primary metrics collection system.

**Key Metrics:**
- `workflow_executions_total`: Total number of workflow executions
- `workflow_execution_duration_seconds`: Duration of workflow executions
- `api_requests_total`: Total number of API requests
- `active_connections`: Number of active connections
- `errors_total`: Total number of errors

### Application Metrics
```typescript
// Example metrics in the application
@Injectable()
export class MetricsService {
  private readonly workflowExecutionCounter: Counter<string>;

  constructor() {
    this.workflowExecutionCounter = new Counter({
      name: 'workflow_executions_total',
      help: 'Total number of workflow executions',
      labelNames: ['status', 'workflow_id'],
    });
  }

  recordExecution(workflowId: string, status: string) {
    this.workflowExecutionCounter.labels(status, workflowId).inc();
  }
}
```

## 📊 Dashboards

### Grafana
Grafana is used for creating visual dashboards based on Prometheus metrics.

**Key Dashboards:**
- **System Overview**: High-level system health and performance
- **Workflow Performance**: Detailed workflow execution metrics
- **API Performance**: API response times and error rates
- **Infrastructure**: Resource utilization (CPU, memory, disk)

### Sample Dashboard Configuration
```json
{
  "dashboard": {
    "id": null,
    "title": "N8N Clone Overview",
    "panels": [
      {
        "title": "Workflow Executions",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(workflow_executions_total[5m])",
            "refId": "A"
          }
        ]
      }
    ]
  }
}
```

## 🔍 Distributed Tracing

### Jaeger
Jaeger is used for distributed tracing to understand the flow of requests across microservices.

**Trace Information:**
- Request flow across services
- Service dependencies
- Performance bottlenecks
- Error propagation

### Tracing Implementation
```typescript
// Example tracing in NestJS
import { Injectable } from '@nestjs/common';
import * as opentracing from 'opentracing';

@Injectable()
export class WorkflowService {
  async executeWorkflow(workflowId: string): Promise<void> {
    const span = opentracing.globalTracer().startSpan('execute_workflow');
    span.setTag('workflow_id', workflowId);

    try {
      // Workflow execution logic
      await this.performExecution(workflowId);
      span.setTag('status', 'success');
    } catch (error) {
      span.setTag('status', 'error');
      span.setTag('error', error.message);
      throw error;
    } finally {
      span.finish();
    }
  }
}
```

## 📝 Centralized Logging

### ELK Stack (Elasticsearch, Logstash, Kibana)
The ELK stack is used for centralized logging and log analysis.

**Log Structure:**
```json
{
  "@timestamp": "2023-01-01T00:00:00.000Z",
  "level": "info",
  "service": "workflow-orchestrator",
  "message": "Workflow execution completed",
  "workflowId": "123e4567-e89b-12d3-a456-426614174000",
  "executionId": "456e7890-e89b-12d3-a456-426614174001",
  "duration": 1500,
  "traceId": "abc123def456"
}
```

### Structured Logging
```typescript
// Example structured logging
import { Logger } from '@nestjs/common';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  async executeWorkflow(workflowId: string): Promise<void> {
    this.logger.log('Starting workflow execution', {
      workflowId,
      timestamp: new Date().toISOString()
    });

    try {
      // Execution logic
      this.logger.log('Workflow execution completed successfully', {
        workflowId,
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.logger.error('Workflow execution failed', {
        workflowId,
        error: error.message,
        stack: error.stack
      });
    }
  }
}
```

## 🚨 Alerting

### Alertmanager
Prometheus Alertmanager is configured to send alerts based on predefined rules.

**Alert Rules:**
```yaml
# prometheus-alerts.yml
groups:
  - name: n8n-clone-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(errors_total[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is above 10% for more than 2 minutes"

      - alert: WorkflowExecutionFailure
        expr: increase(workflow_executions_total{status="failed"}[5m]) > 5
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Multiple workflow execution failures"
          description: "More than 5 workflow executions failed in the last 5 minutes"
```

## 🏥 Health Checks

### Health Check Endpoints
Each microservice exposes health check endpoints for monitoring.

```typescript
// Example health check controller
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly databaseHealth: TypeOrmHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      () => this.databaseHealth.pingCheck('database'),
    ]);
  }
}
```

---

**Next**: [Security Guide](./14-security.md)
