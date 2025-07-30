# 🚀 Microservices Design

This document details the microservices architecture of the n8n clone, outlining the responsibilities of each service and how they interact.

## 🚀 Service Breakdown

- **api-gateway** - Single Entry Point
- **workflow-orchestrator** - Core Engine
- **node-runtime-engine** - Code Execution
- **trigger-manager** - Event Handling
- **credentials-vault** - Security
- **execution-history** - Audit & Monitoring
- **template-manager** - Template System
- **user-management** - Multi-tenancy
- **notification-hub** - Alerting
- **variable-manager** - Configuration
- **queue-processor** - Background Jobs
- **monitoring-service** - Observability

## 🤝 Shared Kernel (Common Components)

**Location**: `libs/shared/`

**Responsibility**: Contains components shared across all layers and services.

**What lives here**:
- **Types**: TypeScript interfaces and types
- **Constants**: System-wide constants and enums
- **Utils**: Pure utility functions
- **Validators**: Data validation schemas
- **Exceptions**: Custom error classes
- **Decorators**: Reusable decorators

---

**Next**: [Database Design](./04-database-design.md)

