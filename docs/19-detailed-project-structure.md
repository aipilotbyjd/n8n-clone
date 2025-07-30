# 📂 Detailed Project Structure

This document provides a comprehensive breakdown of the file and directory structure for the n8n clone project, explaining the purpose of each component.

```
n8n-clone-workspace/
├── apps/                           # 🚀 MICROSERVICES LAYER (Independently Deployable Services)
│   ├── api-gateway/                # API Gateway: Single entry point for all client requests.
│   │   ├── src/
│   │   │   ├── auth/               # Authentication (JWT) & authorization (RBAC) logic.
│   │   │   ├── middleware/         # Request middleware (logging, rate limiting, CORS).
│   │   │   ├── proxy/              # Service proxy to route requests to other microservices.
│   │   │   └── main.ts             # Service entry point.
│   │   └── project.json            # Nx project configuration for the API gateway.
│   │
│   ├── workflow-orchestrator/      # Workflow Orchestrator: Manages the entire workflow lifecycle.
│   │   ├── src/
│   │   │   ├── execution/          # Core workflow execution logic.
│   │   │   ├── state-management/   # Manages the state of running workflows.
│   │   │   ├── flow-control/       # Handles conditional logic (IF, Switch).
│   │   │   └── error-handling/     # Implements retry logic and error recovery.
│   │   └── project.json
│   │
│   ├── node-runtime-engine/        # Node Runtime Engine: Executes individual nodes in a secure sandbox.
│   │   ├── src/
│   │   │   ├── runtime/            # Secure JavaScript execution sandbox (using VM2 or similar).
│   │   │   ├── code-execution/     # Logic for executing the 'Code' node.
│   │   │   ├── expression-parser/  # Evaluates JavaScript expressions in node parameters.
│   │   │   └── sandbox/            # Manages the creation and cleanup of sandboxed environments.
│   │   └── project.json
│   │
│   ├── trigger-manager/            # Trigger Manager: Manages all trigger types (webhooks, cron, etc.).
│   │   ├── src/
│   │   │   ├── cron-triggers/      # Scheduled triggers based on cron expressions.
│   │   │   ├── webhook-triggers/   # HTTP webhook handling.
│   │   │   ├── polling-triggers/   # Triggers that poll an API for new data.
│   │   │   └── ... (other trigger types)
│   │   └── project.json
│   │
│   ├── credentials-vault/          # Credentials Vault: Securely stores and manages user credentials.
│   │   ├── src/
│   │   │   ├── encryption/         # Handles encryption and decryption of credentials.
│   │   │   ├── oauth-manager/      # Manages OAuth 2.0 flows.
│   │   │   └── ... (other credential management logic)
│   │   └── project.json
│   │
│   └── ... (other microservices like execution-history, user-management, etc.)
│
├── libs/                           # 📚 SHARED LIBRARIES LAYER (Reusable Code)
│   ├── domain/                     # 🎯 DOMAIN LAYER (Core Business Logic - No Frameworks)
│   │   ├── workflow/               # 'Workflow' Bounded Context
│   │   │   ├── entities/           # - workflow.entity.ts, node.entity.ts, connection.entity.ts
│   │   │   ├── value-objects/      # - workflow-id.vo.ts, node-position.vo.ts
│   │   │   ├── aggregates/         # - workflow.aggregate.ts (consistency boundary)
│   │   │   ├── repositories/       # - workflow.repository.interface.ts (data access contract)
│   │   │   ├── services/           # - workflow-validator.service.ts (domain-specific logic)
│   │   │   └── events/             # - workflow-created.event.ts (domain events)
│   │   │
│   │   ├── execution/              # 'Execution' Bounded Context
│   │   │   ├── entities/           # - execution.entity.ts, execution-step.entity.ts
│   │   │   └── ... (other domain entities)
│   │   │
│   │   └── ... (other bounded contexts like nodes, triggers, credentials, users)
│   │
│   ├── application/                # 💼 APPLICATION LAYER (Use Cases & Orchestration)
│   │   ├── workflow/
│   │   │   ├── commands/           # - create-workflow.command.ts (CQRS Commands)
│   │   │   ├── queries/            # - get-workflow.query.ts (CQRS Queries)
│   │   │   ├── handlers/           # - create-workflow.handler.ts (Command/Query Handlers)
│   │   │   └── dto/                # - create-workflow.dto.ts (Data Transfer Objects)
│   │   │
│   │   └── ... (application logic for other bounded contexts)
│   │
│   ├── infrastructure/              # 🔧 INFRASTRUCTURE LAYER (External Concerns - Frameworks, DBs, etc.)
│   │   ├── database/
│   │   │   ├── repositories/       # - typeorm-workflow.repository.ts (TypeORM implementation of repository interface)
│   │   │   ├── migrations/         # - Database schema migrations.
│   │   │   └── schemas/            # - workflow.schema.ts (TypeORM entity schemas)
│   │   ├── message-queue/          # - Kafka producers and consumers.
│   │   ├── cache/                  # - Redis caching services.
│   │   └── ... (other infrastructure concerns like security, monitoring)
│   │
│   ├── integrations/               # 🔌 INTEGRATION NODES (All n8n-style nodes)
│   │   ├── core-nodes/             # - IF, Switch, Merge, Set, etc.
│   │   ├── trigger-nodes/          # - Webhook, Cron, Interval, etc.
│   │   └── ... (categorized folders for all other integration nodes)
│   │
│   ├── shared/                     # 🤝 SHARED KERNEL (Common components used across all layers)
│   │   ├── types/                  # - Shared TypeScript types and interfaces.
│   │   ├── constants/              # - Application-wide constants.
│   │   ├── utils/                  # - Common utility functions.
│   │   └── exceptions/             # - Custom exception classes.
│   │
│   └── testing/                    # 🧪 TESTING UTILITIES
│       ├── fixtures/               # - Test data fixtures.
│       ├── mocks/                  # - Mocks for services and dependencies.
│       └── helpers/                # - Test helper functions.
│
├── tools/                          # 🛠️ DEVELOPMENT & AUTOMATION TOOLS
│   ├── workspace-generator/        # - Custom Nx generator for new workspaces.
│   ├── node-generator/             # - Custom Nx generator for new integration nodes.
│   └── deployment-scripts/         # - Scripts for deploying to different environments.
│
├── docker/                         # 🐳 CONTAINERIZATION
│   ├── Dockerfile.api-gateway      # - Dockerfile for the API Gateway service.
│   ├── ... (Dockerfiles for each microservice)
│   ├── docker-compose.yml          # - Production Docker Compose configuration.
│   └── docker-compose.dev.yml      # - Development Docker Compose configuration.
│
├── k8s/                           # ☸️ KUBERNETES MANIFESTS
│   ├── helm/                      # - Helm chart for easy deployment.
│   └── manifests/                 # - Raw Kubernetes YAML files (Deployments, Services, etc.).
│
├── terraform/                     # 🏗️ INFRASTRUCTURE AS CODE (IaC)
│   ├── aws/                       # - Terraform scripts for provisioning AWS resources.
│   ├── gcp/                       # - Terraform scripts for provisioning GCP resources.
│   └── azure/                     # - Terraform scripts for provisioning Azure resources.
│
└── docs/                          # 📚 DOCUMENTATION
    ├── 01-architecture.md
    └── ... (all other documentation files)
```
---

**Next**: [Back to README](./README.md)

