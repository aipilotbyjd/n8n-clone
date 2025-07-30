# 💼 Application Layer Implementation

This document provides a detailed guide to the application layer implementation, which orchestrates domain objects to fulfill specific use cases.

## 🔧 CQRS Pattern

The application layer implements the Command Query Responsibility Segregation (CQRS) pattern to separate read and write operations.

### Commands (Write Operations)
Commands represent actions that change the system state.

#### Create Workflow Command
```typescript
// libs/application/workflow/commands/create-workflow.command.ts
export class CreateWorkflowCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly userId: string,
    public readonly tags?: string[],
    public readonly initialNodes?: CreateNodeDto[],
    public readonly initialConnections?: CreateConnectionDto[]
  ) {}
}
```

#### Command Handler
```typescript
// libs/application/workflow/handlers/create-workflow.handler.ts
@CommandHandler(CreateWorkflowCommand)
export class CreateWorkflowHandler implements ICommandHandler<CreateWorkflowCommand, WorkflowDto> {
  constructor(
    @Inject('WORKFLOW_REPOSITORY')
    private readonly workflowRepository: IWorkflowRepository,
    private readonly workflowValidator: WorkflowValidatorService,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateWorkflowCommand): Promise<WorkflowDto> {
    // 1. Create workflow entity
    const workflowId = WorkflowId.generate();
    const workflow = new Workflow(
      workflowId,
      command.name,
      command.description,
      // ... other properties
    );

    // 2. Validate workflow
    const validationResult = this.workflowValidator.validateWorkflowForExecution(workflow);
    if (!validationResult.isValid) {
      throw new InvalidWorkflowError(validationResult.errors.join(', '));
    }

    // 3. Save workflow
    await this.workflowRepository.save(workflow);

    // 4. Publish domain event
    await this.eventBus.publish(
      new WorkflowCreatedEvent(workflowId.value, command.name, command.userId)
    );

    // 5. Return DTO
    return this.mapToDto(workflow);
  }
}
```

### Queries (Read Operations)
Queries represent read operations for data retrieval.

#### Get Workflow Query
```typescript
// libs/application/workflow/queries/get-workflow.query.ts
export class GetWorkflowQuery {
  constructor(
    public readonly workflowId: string,
    public readonly userId: string
  ) {}
}
```

#### Query Handler
```typescript
// libs/application/workflow/handlers/get-workflow.handler.ts
@QueryHandler(GetWorkflowQuery)
export class GetWorkflowHandler implements IQueryHandler<GetWorkflowQuery, WorkflowDto> {
  constructor(
    @Inject('WORKFLOW_REPOSITORY')
    private readonly workflowRepository: IWorkflowRepository
  ) {}

  async execute(query: GetWorkflowQuery): Promise<WorkflowDto> {
    const workflow = await this.workflowRepository.findById(
      new WorkflowId(query.workflowId)
    );

    if (!workflow) {
      throw new WorkflowNotFoundError(query.workflowId);
    }

    return this.mapToDto(workflow);
  }
}
```

## 📋 Data Transfer Objects (DTOs)

DTOs define the contract between the application layer and external consumers.

### Workflow DTO
```typescript
// libs/application/workflow/dto/workflow.dto.ts
export interface WorkflowDto {
  id: string;
  name: string;
  description: string;
  active: boolean;
  nodes: NodeDto[];
  connections: ConnectionDto[];
  tags: string[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  validation: ValidationDto;
}
```

## 🎯 Event Handlers

Event handlers react to domain events and coordinate cross-cutting concerns.

### Workflow Event Handler
```typescript
// libs/application/workflow/handlers/workflow-event.handler.ts
@EventsHandler(WorkflowCreatedEvent)
export class WorkflowCreatedHandler implements IEventHandler<WorkflowCreatedEvent> {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly metricsService: MetricsService
  ) {}

  async handle(event: WorkflowCreatedEvent) {
    // Send notification
    await this.notificationService.notifyWorkflowCreated(event);
    
    // Record metrics
    this.metricsService.recordWorkflowCreation(event.workflowId, event.createdBy);
  }
}
```

## 🔄 Application Services

Application services coordinate multiple domain services and handle complex workflows.

### Workflow Execution Service
```typescript
// libs/application/execution/services/workflow-execution.service.ts
@Injectable()
export class WorkflowExecutionService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus
  ) {}

  async executeWorkflow(request: ExecuteWorkflowRequest): Promise<ExecutionDto> {
    // 1. Get workflow
    const workflow = await this.queryBus.execute(
      new GetWorkflowQuery(request.workflowId, request.userId)
    );

    // 2. Create execution
    const execution = await this.commandBus.execute(
      new StartExecutionCommand(request.workflowId, request.input, request.userId)
    );

    // 3. Process execution asynchronously
    await this.eventBus.publish(
      new ExecutionStartedEvent(execution.id, request.workflowId, request.userId)
    );

    return execution;
  }
}
```

---

**Next**: [Infrastructure Implementation](./07-infrastructure-implementation.md)
