// ========================================
// PHASE 3: INFRASTRUCTURE IMPLEMENTATION
// ========================================

// 1. Database Schema and Repository Implementation
// libs/infrastructure/database/schemas/workflow.schema.ts
import { Entity, Column, PrimaryColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('workflows')
@Index(['userId', 'active'])
@Index(['name', 'userId'])
@Index(['tags'], { where: "tags IS NOT NULL" })
export class WorkflowSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 100 })
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column({ default: false })
  @Index()
  active: boolean;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('jsonb')
  settings: any;

  @Column({ default: 1 })
  version: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => NodeSchema, node => node.workflow, { cascade: true })
  nodes: NodeSchema[];

  @OneToMany(() => ConnectionSchema, connection => connection.workflow, { cascade: true })
  connections: ConnectionSchema[];

  @OneToMany(() => ExecutionSchema, execution => execution.workflow)
  executions: ExecutionSchema[];
}

@Entity('nodes')
@Index(['workflowId', 'position'])
export class NodeSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  workflowId: string;

  @Column({ length: 100 })
  type: string;

  @Column({ length: 100 })
  name: string;

  @Column('jsonb')
  parameters: any;

  @Column('jsonb')
  position: { x: number; y: number };

  @Column('uuid', { nullable: true })
  credentialId: string;

  @Column({ default: false })
  disabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => WorkflowSchema, workflow => workflow.nodes, { onDelete: 'CASCADE' })
  workflow: WorkflowSchema;
}

@Entity('connections')
@Index(['workflowId'])
@Index(['sourceNodeId'])
@Index(['targetNodeId'])
export class ConnectionSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  workflowId: string;

  @Column('uuid')
  sourceNodeId: string;

  @Column({ length: 50 })
  sourceOutput: string;

  @Column('uuid')
  targetNodeId: string;

  @Column({ length: 50 })
  targetInput: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => WorkflowSchema, workflow => workflow.connections, { onDelete: 'CASCADE' })
  workflow: WorkflowSchema;
}

// 2. Repository Implementation
// libs/infrastructure/database/repositories/typeorm-workflow.repository.ts
@Injectable()
export class TypeOrmWorkflowRepository implements IWorkflowRepository {
  constructor(
    @InjectRepository(WorkflowSchema)
    private readonly workflowRepo: Repository<WorkflowSchema>,
    
    @InjectRepository(NodeSchema)
    private readonly nodeRepo: Repository<NodeSchema>,
    
    @InjectRepository(ConnectionSchema)
    private readonly connectionRepo: Repository<ConnectionSchema>,
    
    private readonly workflowMapper: WorkflowMapper,
    private readonly cacheService: CacheService,
    private readonly logger: Logger
  ) {}

  async findById(id: WorkflowId): Promise<Workflow | null> {
    const cacheKey = `workflow:${id.value}`;
    
    try {
      // Try cache first
      const cached = await this.cacheService.get<Workflow>(cacheKey);
      if (cached) {
        this.logger.debug(`Workflow cache hit: ${id.value}`);
        return cached;
      }

      // Query database with optimized joins
      const workflowData = await this.workflowRepo
        .createQueryBuilder('workflow')
        .leftJoinAndSelect('workflow.nodes', 'node')
        .leftJoinAndSelect('workflow.connections', 'connection')
        .where('workflow.id = :id', { id: id.value })
        .getOne();

      if (!workflowData) {
        return null;
      }

      const workflow = this.workflowMapper.toDomain(workflowData);
      
      // Cache the result
      await this.cacheService.set(cacheKey, workflow, 300); // 5 minutes
      
      return workflow;

    } catch (error) {
      this.logger.error(`Failed to find workflow: ${id.value}`, error);
      throw new RepositoryError(`Database error: ${error.message}`);
    }
  }

  async findByUserId(userId: string, filters?: WorkflowFilters): Promise<Workflow[]> {
    try {
      const queryBuilder = this.workflowRepo
        .createQueryBuilder('workflow')
        .leftJoinAndSelect('workflow.nodes', 'node')
        .leftJoinAndSelect('workflow.connections', 'connection')
        .where('workflow.userId = :userId', { userId });

      // Apply filters
      if (filters) {
        if (filters.active !== undefined) {
          queryBuilder.andWhere('workflow.active = :active', { active: filters.active });
        }

        if (filters.tags && filters.tags.length > 0) {
          queryBuilder.andWhere('workflow.tags && :tags', { tags: filters.tags });
        }

        if (filters.search) {
          queryBuilder.andWhere(
            '(workflow.name ILIKE :search OR workflow.description ILIKE :search)',
            { search: `%${filters.search}%` }
          );
        }

        if (filters.createdAfter) {
          queryBuilder.andWhere('workflow.createdAt >= :createdAfter', { 
            createdAfter: filters.createdAfter 
          });
        }

        if (filters.createdBefore) {
          queryBuilder.andWhere('workflow.createdAt <= :createdBefore', { 
            createdBefore: filters.createdBefore 
          });
        }
      }

      const workflowsData = await queryBuilder
        .orderBy('workflow.updatedAt', 'DESC')
        .getMany();

      return workflowsData.map(data => this.workflowMapper.toDomain(data));

    } catch (error) {
      this.logger.error(`Failed to find workflows for user: ${userId}`, error);
      throw new RepositoryError(`Database error: ${error.message}`);
    }
  }

  async save(workflow: Workflow): Promise<void> {
    const queryRunner = this.workflowRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Map domain to persistence
      const workflowData = this.workflowMapper.toPersistence(workflow);
      
      // Save workflow
      await queryRunner.manager.save(WorkflowSchema, workflowData);

      // Save nodes
      if (workflow.nodes.length > 0) {
        const nodeData = workflow.nodes.map(node => 
          this.workflowMapper.nodeToPersistence(node, workflow.id.value)
        );
        await queryRunner.manager.save(NodeSchema, nodeData);
      }

      // Save connections
      if (workflow.connections.length > 0) {
        const connectionData = workflow.connections.map(connection =>
          this.workflowMapper.connectionToPersistence(connection, workflow.id.value)
        );
        await queryRunner.manager.save(ConnectionSchema, connectionData);
      }

      await queryRunner.commitTransaction();

      // Invalidate cache
      await this.cacheService.delete(`workflow:${workflow.id.value}`);
      await this.cacheService.delete(`user_workflows:${workflow.createdBy.value}`);

      this.logger.info(`Workflow saved: ${workflow.id.value}`);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to save workflow: ${workflow.id.value}`, error);
      throw new RepositoryError(`Failed to save workflow: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async update(workflow: Workflow): Promise<void> {
    const queryRunner = this.workflowRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update workflow
      const workflowData = this.workflowMapper.toPersistence(workflow);
      await queryRunner.manager.update(WorkflowSchema, workflow.id.value, workflowData);

      // Delete existing nodes and connections
      await queryRunner.manager.delete(NodeSchema, { workflowId: workflow.id.value });
      await queryRunner.manager.delete(ConnectionSchema, { workflowId: workflow.id.value });

      // Insert updated nodes and connections
      if (workflow.nodes.length > 0) {
        const nodeData = workflow.nodes.map(node => 
          this.workflowMapper.nodeToPersistence(node, workflow.id.value)
        );
        await queryRunner.manager.save(NodeSchema, nodeData);
      }

      if (workflow.connections.length > 0) {
        const connectionData = workflow.connections.map(connection =>
          this.workflowMapper.connectionToPersistence(connection, workflow.id.value)
        );
        await queryRunner.manager.save(ConnectionSchema, connectionData);
      }

      await queryRunner.commitTransaction();

      // Invalidate cache
      await this.cacheService.delete(`workflow:${workflow.id.value}`);
      await this.cacheService.delete(`user_workflows:${workflow.createdBy.value}`);

      this.logger.info(`Workflow updated: ${workflow.id.value}`);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to update workflow: ${workflow.id.value}`, error);
      throw new RepositoryError(`Failed to update workflow: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: WorkflowId): Promise<void> {
    try {
      const result = await this.workflowRepo.delete(id.value);
      
      if (result.affected === 0) {
        throw new WorkflowNotFoundError(id.value);
      }

      // Invalidate cache
      await this.cacheService.delete(`workflow:${id.value}`);

      this.logger.info(`Workflow deleted: ${id.value}`);

    } catch (error) {
      this.logger.error(`Failed to delete workflow: ${id.value}`, error);
      throw new RepositoryError(`Failed to delete workflow: ${error.message}`);
    }
  }

  async findActiveWorkflows(): Promise<Workflow[]> {
    const cacheKey = 'active_workflows';
    
    try {
      // Try cache first
      const cached = await this.cacheService.get<Workflow[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const workflowsData = await this.workflowRepo.find({
        where: { active: true },
        relations: ['nodes', 'connections'],
        order: { updatedAt: 'DESC' }
      });

      const workflows = workflowsData.map(data => this.workflowMapper.toDomain(data));
      
      // Cache for 1 minute (active workflows change frequently)
      await this.cacheService.set(cacheKey, workflows, 60);
      
      return workflows;

    } catch (error) {
      this.logger.error('Failed to find active workflows', error);
      throw new RepositoryError(`Database error: ${error.message}`);
    }
  }

  async exists(id: WorkflowId): Promise<boolean> {
    try {
      const count = await this.workflowRepo.count({
        where: { id: id.value }
      });
      return count > 0;
    } catch (error) {
      this.logger.error(`Failed to check workflow existence: ${id.value}`, error);
      throw new RepositoryError(`Database error: ${error.message}`);
    }
  }

  async count(filters?: WorkflowFilters): Promise<number> {
    try {
      const queryBuilder = this.workflowRepo.createQueryBuilder('workflow');

      if (filters) {
        if (filters.active !== undefined) {
          queryBuilder.where('workflow.active = :active', { active: filters.active });
        }

        if (filters.tags && filters.tags.length > 0) {
          queryBuilder.andWhere('workflow.tags && :tags', { tags: filters.tags });
        }
      }

      return await queryBuilder.getCount();

    } catch (error) {
      this.logger.error('Failed to count workflows', error);
      throw new RepositoryError(`Database error: ${error.message}`);
    }
  }

  async findDuplicatesByName(name: string, excludeId?: WorkflowId): Promise<Workflow[]> {
    try {
      const queryBuilder = this.workflowRepo
        .createQueryBuilder('workflow')
        .where('LOWER(workflow.name) = LOWER(:name)', { name });

      if (excludeId) {
        queryBuilder.andWhere('workflow.id != :excludeId', { excludeId: excludeId.value });
      }

      const workflowsData = await queryBuilder.getMany();
      return workflowsData.map(data => this.workflowMapper.toDomain(data));

    } catch (error) {
      this.logger.error(`Failed to find duplicate workflows by name: ${name}`, error);
      throw new RepositoryError(`Database error: ${error.message}`);
    }
  }
}

// 3. Message Queue Implementation
// libs/infrastructure/message-queue/kafka/kafka.service.ts
@Injectable()
export class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger
  ) {
    this.kafka = new Kafka({
      clientId: this.configService.get('KAFKA_CLIENT_ID', 'n8n-clone'),
      brokers: this.configService.get('KAFKA_BROKERS', 'localhost:9092').split(','),
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });
  }

  async onModuleInit() {
    await this.initializeProducer();
  }

  async onModuleDestroy() {
    await this.producer?.disconnect();
    
    for (const consumer of this.consumers.values()) {
      await consumer.disconnect();
    }
  }

  private async initializeProducer() {
    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000
    });

    await this.producer.connect();
    this.logger.info('Kafka producer connected');
  }

  async publishEvent(topic: string, event: any, key?: string): Promise<void> {
    try {
      const message = {
        key: key || uuidv4(),
        value: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
          version: '1.0'
        }),
        headers: {
          'event-type': event.constructor.name,
          'correlation-id': uuidv4()
        }
      };

      await this.producer.send({
        topic,
        messages: [message]
      });

      this.logger.debug(`Event published to topic ${topic}`, {
        eventType: event.constructor.name,
        key: message.key
      });

    } catch (error) {
      this.logger.error(`Failed to publish event to topic ${topic}`, error);
      throw new MessageQueueError(`Failed to publish event: ${error.message}`);
    }
  }

  async createConsumer(
    groupId: string,
    topics: string[],
    handler: (message: any) => Promise<void>
  ): Promise<void> {
    if (this.consumers.has(groupId)) {
      throw new Error(`Consumer with group ID ${groupId} already exists`);
    }

    const consumer = this.kafka.consumer({
      groupId,
      sessionTimeout: 30000,
      rebalanceTimeout: 60000,
      heartbeatInterval: 3000
    });

    await consumer.connect();
    await consumer.subscribe({ topics, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const eventData = JSON.parse(message.value?.toString() || '{}');
          const eventType = message.headers?.['event-type']?.toString();
          
          this.logger.debug(`Processing message from topic ${topic}`, {
            eventType,
            partition,
            offset: message.offset
          });

          await handler(eventData);

        } catch (error) {
          this.logger.error(`Error processing message from topic ${topic}`, {
            error: error.message,
            partition,
            offset: message.offset
          });
          
          // Implement dead letter queue logic here
          await this.handleFailedMessage(topic, message, error);
        }
      }
    });

    this.consumers.set(groupId, consumer);
    this.logger.info(`Kafka consumer created for group ${groupId}`);
  }

  private async handleFailedMessage(topic: string, message: any, error: Error): Promise<void> {
    const deadLetterTopic = `${topic}.dead-letter`;
    
    try {
      await this.producer.send({
        topic: deadLetterTopic,
        messages: [{
          key: message.key,
          value: message.value,
          headers: {
            ...message.headers,
            'error-message': error.message,
            'error-timestamp': new Date().toISOString(),
            'original-topic': topic
          }
        }]
      });

      this.logger.warn(`Message sent to dead letter queue: ${deadLetterTopic}`);

    } catch (dlqError) {
      this.logger.error('Failed to send message to dead letter queue', dlqError);
    }
  }
}

// 4. Cache Service Implementation
// libs/infrastructure/cache/redis-cache.service.ts
@Injectable()
export class RedisCacheService implements CacheService {
  private redis: Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger
  ) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      db: this.configService.get('REDIS_DB', 0),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    this.redis.on('connect', () => {
      this.logger.info('Redis connected');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error', error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;

    } catch (error) {
      this.logger.error(`Failed to get cache key: ${key}`, error);
      return null; // Fail gracefully
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }

    } catch (error) {
      this.logger.error(`Failed to set cache key: ${key}`, error);
      // Don't throw - caching should be transparent
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete cache key: ${key}`, error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Failed to delete cache pattern: ${pattern}`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check cache key existence: ${key}`, error);
      return false;
    }
  }

  async increment(key: string, by: number = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, by);
    } catch (error) {
      this.logger.error(`Failed to increment cache key: ${key}`, error);
      throw error;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.expire(key, ttlSeconds);
    } catch (error) {
      this.logger.error(`Failed to set expiration for key: ${key}`, error);
    }
  }
}

// 5. Security Implementation
// libs/infrastructure/security/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
    private readonly auditService: AuditService,
    private readonly logger: Logger
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Check token blacklist
      const isBlacklisted = await this.cacheService.exists(`blacklist:${token}`);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Verify token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET
      });

      // Get user from cache first
      const cacheKey = `user:${payload.sub}`;
      let user = await this.cacheService.get<any>(cacheKey);

      if (!user) {
        // Load from database
        user = await this.userService.findById(payload.sub);
        if (!user) {
          throw new UnauthorizedException('User not found');
        }

        // Cache user for 5 minutes
        await this.cacheService.set(cacheKey, user, 300);
      }

      // Check if user is active
      if (!user.active) {
        throw new UnauthorizedException('User account is disabled');
      }

      // Attach user to request
      request.user = user;

      // Log access
      await this.auditService.logAccess({
        userId: user.id,
        ip: request.ip,
        userAgent: request.get('User-Agent'),
        endpoint: request.path,
        method: request.method,
        timestamp: new Date()
      });

      return true;

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('JWT verification failed', {
        error: error.message,
        token: token.substring(0, 20) + '...'
      });

      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

// 6. Rate Limiting Implementation
// libs/infrastructure/security/rate-limit.guard.ts
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
    private readonly logger: Logger
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      // Apply IP-based rate limiting for unauthenticated requests
      return this.checkIpRateLimit(request.ip);
    }

    // Apply user-based rate limiting
    return this.checkUserRateLimit(user.id, request.path, request.method);
  }

  private async checkUserRateLimit(userId: string, path: string, method: string): Promise<boolean> {
    const rateLimitKey = `rate_limit:user:${userId}:${method}:${path}`;
    const windowSizeSeconds = this.configService.get('RATE_LIMIT_WINDOW', 60);
    const maxRequests = this.getRateLimitForEndpoint(path, method);

    const current = await this.cacheService.increment(rateLimitKey);
    
    if (current === 1) {
      await this.cacheService.expire(rateLimitKey, windowSizeSeconds);
    }

    if (current > maxRequests) {
      this.logger.warn(`Rate limit exceeded for user ${userId}`, {
        userId,
        path,
        method,
        current,
        limit: maxRequests
      });

      throw new TooManyRequestsException('Rate limit exceeded');
    }

    return true;
  }

  private async checkIpRateLimit(ip: string): Promise<boolean> {
    const rateLimitKey = `rate_limit:ip:${ip}`;
    const windowSizeSeconds = 60;
    const maxRequests = 10; // Strict limit for unauthenticated requests

    const current = await this.cacheService.increment(rateLimitKey);
    
    if (current === 1) {
      await this.cacheService.expire(rateLimitKey, windowSizeSeconds);
    }

    if (current > maxRequests) {
      this.logger.warn(`IP rate limit exceeded: ${ip}`, {
        ip,
        current,
        limit: maxRequests
      });

      throw new TooManyRequestsException('Rate limit exceeded');
    }

    return true;
  }

  private getRateLimitForEndpoint(path: string, method: string): number {
    // Different endpoints have different rate limits
    const limits = {
      'POST:/workflows/*/execute': 10, // 10 executions per minute
      'GET:/workflows': 60,            // 60 reads per minute
      'POST:/workflows': 20,           // 20 creates per minute
      'PUT:/workflows/*': 30,          // 30 updates per minute
      'DELETE:/workflows/*': 10        // 10 deletes per minute
    };

    const key = `${method}:${path}`;
    return limits[key] || 100; // Default limit
  }
}

// 7. Monitoring Implementation
// libs/infrastructure/monitoring/metrics.service.ts
@Injectable()
export class MetricsService {
  private readonly workflowExecutionCounter: Counter<string>;
  private readonly executionDurationHistogram: Histogram<string>;
  private readonly apiRequestCounter: Counter<string>;
  private readonly activeConnectionsGauge: Gauge<string>;
  private readonly errorCounter: Counter<string>;

  constructor() {
    // Workflow execution metrics
    this.workflowExecutionCounter = new Counter({
      name: 'workflow_executions_total',
      help: 'Total number of workflow executions',
      labelNames: ['workflow_id', 'status', 'mode', 'user_id']
    });

    this.executionDurationHistogram = new Histogram({
      name: 'workflow_execution_duration_seconds',
      help: 'Workflow execution duration in seconds',
      labelNames: ['workflow_id', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 300, 600, 1800, 3600]
    });

    // API metrics
    this.apiRequestCounter = new Counter({
      name: 'api_requests_total',
      help: 'Total number of API requests',
      labelNames: ['method', 'endpoint', 'status_code', 'user_id']
    });

    // System metrics
    this.activeConnectionsGauge = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      labelNames: ['type']
    });

    this.errorCounter = new Counter({
      name: 'errors_total',
      help: 'Total number of errors',
      labelNames: ['type', 'service', 'error_code']
    });
  }

  recordWorkflowExecution(
    workflowId: string,
    status: string,
    mode: string,
    userId: string,
    duration?: number
  ): void {
    this.workflowExecutionCounter
      .labels(workflowId, status, mode, userId)
      .inc();

    if (duration !== undefined) {
      this.executionDurationHistogram
        .labels(workflowId, status)
        .observe(duration);
    }
  }

  recordApiRequest(
    method: string,
    endpoint: string,
    statusCode: number,
    userId?: string
  ): void {
    this.apiRequestCounter
      .labels(method, endpoint, statusCode.toString(), userId || 'anonymous')
      .inc();
  }

  setActiveConnections(type: string, count: number): void {
    this.activeConnectionsGauge.labels(type).set(count);
  }

  recordError(type: string, service: string, errorCode?: string): void {
    this.errorCounter
      .labels(type, service, errorCode || 'unknown')
      .inc();
  }

  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}

export { register };