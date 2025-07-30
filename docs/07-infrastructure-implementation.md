# 🔧 Infrastructure Implementation

This document provides a detailed guide to the infrastructure layer implementation, which handles all external concerns such as databases, message queues, and external APIs.

## 📂 Repository Implementation

### TypeORM Workflow Repository
- **Location**: `libs/infrastructure/database/repositories/typeorm-workflow.repository.ts`
- **Description**: Implements the `IWorkflowRepository` interface using TypeORM for PostgreSQL.

```typescript
// libs/infrastructure/database/repositories/typeorm-workflow.repository.ts
@Injectable()
export class TypeOrmWorkflowRepository implements IWorkflowRepository {
  constructor(
    @InjectRepository(WorkflowSchema)
    private readonly workflowRepo: Repository<WorkflowSchema>,
    private readonly workflowMapper: WorkflowMapper
  ) {}

  async findById(id: WorkflowId): Promise<Workflow | null> {
    const workflowData = await this.workflowRepo.findOne(id.value);
    return workflowData ? this.workflowMapper.toDomain(workflowData) : null;
  }

  async save(workflow: Workflow): Promise<void> {
    const workflowData = this.workflowMapper.toPersistence(workflow);
    await this.workflowRepo.save(workflowData);
  }
}
```

## 📬 Message Queue Implementation

### Kafka Service
- **Location**: `libs/infrastructure/message-queue/kafka/kafka.service.ts`
- **Description**: Provides a service for publishing and subscribing to Kafka events.

```typescript
// libs/infrastructure/message-queue/kafka/kafka.service.ts
@Injectable()
export class KafkaService {
  private kafka: Kafka;
  private producer: Producer;

  constructor(private readonly configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: this.configService.get('KAFKA_CLIENT_ID'),
      brokers: this.configService.get('KAFKA_BROKERS').split(','),
    });
  }

  async publishEvent(topic: string, event: any): Promise<void> {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(event) }],
    });
  }
}
```

## 🔒 Security Implementation

### JWT Authentication Guard
- **Location**: `libs/infrastructure/security/jwt-auth.guard.ts`
- **Description**: A NestJS guard that protects routes by validating JWT tokens.

```typescript
// libs/infrastructure/security/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ... JWT validation logic
  }
}
```

## 📈 Monitoring Implementation

### Metrics Service
- **Location**: `libs/infrastructure/monitoring/metrics.service.ts`
- **Description**: Provides a service for collecting and exposing Prometheus metrics.

```typescript
// libs/infrastructure/monitoring/metrics.service.ts
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

---

**Next**: [Integration Nodes](./08-integration-nodes.md)

