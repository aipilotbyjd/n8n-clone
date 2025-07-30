# 🎯 Domain-Driven Design (DDD)

This project follows the principles of Domain-Driven Design (DDD) to manage complexity and build a maintainable, scalable system. This document outlines the core DDD concepts and how they are applied in this project.

## 🏛️ Core Principles

- **Bounded Contexts**: The system is divided into well-defined bounded contexts, each with its own domain model and ubiquitous language.
- **Ubiquitous Language**: A shared language used by developers, domain experts, and stakeholders to describe the domain.
- **Entities**: Objects with a distinct identity that persists over time.
- **Value Objects**: Immutable objects that describe a characteristic of a domain.
- **Aggregates**: A cluster of associated objects that are treated as a single unit for data changes.
- **Domain Events**: Events that capture a state change in the domain.
- **Repositories**: A mechanism for encapsulating storage, retrieval, and search behavior which emulates a collection of objects.

##  bounded Contexts

The system is divided into the following bounded contexts:

- **Workflow**: Manages the creation, definition, and structure of workflows.
- **Execution**: Handles the execution of workflows, including state management and logging.
- **Nodes**: Manages the definition, registration, and validation of nodes.
- **Triggers**: Manages the various types of triggers that can initiate a workflow.
- **Credentials**: Securely manages user credentials for third-party services.
- **Users**: Manages user accounts, workspaces, and permissions.
- **Variables**: Manages environment and global variables.

## 🎯 Domain Layer (Pure Business Logic)

**Location**: `libs/domain/`

**Responsibility**: Contains the core business rules and logic that are independent of any external concerns.

**What lives here**:
- **Entities**: Core business objects (Workflow, Execution, Node, User)
- **Value Objects**: Immutable objects that represent concepts (WorkflowId, ExecutionStatus)
- **Aggregates**: Consistency boundaries that group related entities
- **Domain Services**: Business logic that doesn't belong to a single entity
- **Domain Events**: Business events that occur within the domain
- **Repository Interfaces**: Contracts for data access (implementation in Infrastructure)

**Key Principles**:
- No dependencies on external frameworks
- Pure TypeScript/JavaScript business logic
- Framework-agnostic and testable in isolation
- Contains the "why" of the business

## 💼 Application Layer (Use Cases & Orchestration)

**Location**: `libs/application/`

**Responsibility**: Orchestrates domain objects to fulfill specific use cases and business workflows.

**What lives here**:
- **Commands**: Actions that change system state (CreateWorkflow, ExecuteWorkflow)
- **Queries**: Read operations for data retrieval (GetWorkflow, ListExecutions)
- **Command/Query Handlers**: Use case implementations
- **Application Services**: Coordinate multiple domain services
- **DTOs**: Data Transfer Objects for API contracts
- **Event Handlers**: React to domain events

**Key Principles**:
- Orchestrates domain layer without containing business logic
- Implements CQRS pattern for optimal read/write separation
- Contains the "what" of the application functionality
- Framework-agnostic but aware of application structure

## 🔧 Infrastructure Layer (External Concerns)

**Location**: `libs/infrastructure/`

**Responsibility**: Handles all external concerns like databases, message queues, external APIs, and frameworks.

**What lives here**:
- **Repository Implementations**: Concrete data access implementations
- **Database Schemas**: ORM models and migrations
- **Message Queue Handlers**: Kafka producers/consumers
- **External API Clients**: Third-party service integrations
- **Caching Strategies**: Redis implementations
- **Security Implementations**: JWT, OAuth, encryption
- **Monitoring Tools**: Prometheus, logging, tracing

**Key Principles**:
- Implements interfaces defined in domain layer
- Contains all framework-specific code
- Handles all I/O operations
- Contains the "how" of technical implementation

---

**Next**: [Microservices Design](./03-microservices.md)

