# 🚀 Domain Layer Implementation

This document provides a detailed guide to the domain layer implementation, which contains the core business logic of the n8n clone.

## 🎯 Domain Entities

### Workflow Entity
- **Location**: `libs/domain/workflow/entities/workflow.entity.ts`
- **Description**: Represents the core workflow aggregate with its nodes, connections, and settings.

```typescript
// libs/domain/workflow/entities/workflow.entity.ts
export class Workflow {
  constructor(
    private readonly _id: WorkflowId,
    private readonly _name: string,
    private readonly _nodes: Node[],
    private readonly _connections: Connection[],
    private readonly _settings: WorkflowSettings,
    private readonly _version: number
  ) {}

  addNode(node: Node): Workflow {
    // ... business logic
  }

  validate(): ValidationResult {
    return WorkflowValidator.validate(this);
  }
}
```

### Execution Entity
- **Location**: `libs/domain/execution/entities/execution.entity.ts`
- **Description**: Represents a single execution of a workflow, including its status, steps, and results.

```typescript
// libs/domain/execution/entities/execution.entity.ts
export class WorkflowExecution {
  constructor(
    public readonly id: ExecutionId,
    public readonly workflowId: WorkflowId,
    public readonly status: ExecutionStatus,
    public readonly input: ExecutionInput,
    public readonly output: ExecutionOutput,
    public readonly steps: ExecutionStep[],
    public readonly startedAt: Date,
    public readonly finishedAt?: Date
  ) {}

  addStep(step: ExecutionStep): WorkflowExecution {
    // ... business logic
  }
}
```

## 📦 Domain Services

### Workflow Validator Service
- **Location**: `libs/domain/workflow/services/workflow-validator.service.ts`
- **Description**: Provides domain-specific validation for workflows, such as checking for cycles and valid configurations.

```typescript
// libs/domain/workflow/services/workflow-validator.service.ts
@Injectable()
export class WorkflowValidatorService {
  validateWorkflowForExecution(workflow: Workflow): ValidationResult {
    // ... validation logic
  }
}
```

## 📂 Repository Interfaces

### Workflow Repository Interface
- **Location**: `libs/domain/workflow/repositories/workflow.repository.interface.ts`
- **Description**: Defines the contract for the workflow repository, abstracting the data access logic.

```typescript
// libs/domain/workflow/repositories/workflow.repository.interface.ts
export interface IWorkflowRepository {
  findById(id: WorkflowId): Promise<Workflow | null>;
  save(workflow: Workflow): Promise<void>;
  // ... other methods
}
```

## 📢 Domain Events

### Workflow Events
- **Location**: `libs/domain/workflow/events/workflow.events.ts`
- **Description**: Defines the domain events related to workflows, such as creation, updates, and execution.

```typescript
// libs/domain/workflow/events/workflow.events.ts
export class WorkflowExecutionStartedEvent {
  constructor(
    public readonly workflowId: string,
    public readonly executionId: string,
    public readonly userId: string,
    public readonly timestamp: Date
  ) {}
}

export class WorkflowExecutionCompletedEvent {
  // ... event properties
}
```

---

**Next**: [Application Layer Implementation](./06-application-implementation.md)

