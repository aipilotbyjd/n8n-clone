# 🏛️ System Architecture

This document provides a comprehensive overview of the n8n clone's system architecture, designed for ultra-high scalability, resilience, and maintainability. The architecture is based on a modern microservices approach, leveraging Domain-Driven Design (DDD), CQRS, and event-sourcing patterns.

## 🚀 Core Architectural Principles

- **Scalability**: All components are designed to scale horizontally and independently.
- **Resilience**: The system is fault-tolerant with circuit breakers and self-healing mechanisms.
- **Maintainability**: Clear separation of concerns and well-defined service boundaries.
- **Extensibility**: Pluggable architecture for adding new nodes and features.
- **Security**: Multi-layer security with robust authentication and authorization.
- **Observability**: Comprehensive monitoring with metrics, logging, and tracing.

## 🏗️ High-Level Architecture Diagram

```mermaid
graph TD
    subgraph User Interface
        A[Web Application (React)]
    end

    subgraph API Layer
        B[API Gateway (NestJS)]
    end

    subgraph Core Services
        C[Workflow Orchestrator]
        D[Node Runtime Engine]
        E[Trigger Manager]
        F[Credentials Vault]
    end

    subgraph Data & Storage
        G[PostgreSQL]
        H[Redis]
        I[MongoDB]
        J[Kafka]
        K[MinIO/S3]
    end

    subgraph Monitoring & Observability
        L[Prometheus]
        M[Grafana]
        N[Jaeger]
        O[ELK Stack]
    end

    A -- HTTP/GraphQL --> B
    B -- gRPC --> C
    B -- gRPC --> D
    B -- gRPC --> E
    B -- gRPC --> F

    C -- Events --> J
    D -- Events --> J
    E -- Events --> J
    F -- Events --> J

    C -- Data --> G
    C -- Cache --> H
    D -- Logs --> I
    F -- Secrets --> K

    subgraph Microservices
        C
        D
        E
        F
    end

    subgraph Infrastructure
        G
        H
        I
        J
        K
    end

    subgraph Observability
        L
        M
        N
        O
    end

    Microservices -- Metrics --> L
    Microservices -- Traces --> N
    Microservices -- Logs --> O
    L -- Data Source --> M
```

## 🏛️ Architectural Layers

The architecture is divided into several layers, each with a specific responsibility:

### 1. **Presentation Layer**
- **Web Application**: A modern, responsive web application built with React, providing the visual workflow editor and user interface.
- **Responsibilities**:
    - User authentication and session management
    - Workflow creation, editing, and visualization
    - Real-time updates and notifications

### 2. **API Layer**
- **API Gateway**: A single entry point for all client requests, built with NestJS and Fastify for high performance.
- **Responsibilities**:
    - Request routing and load balancing to microservices
    - Authentication and authorization (JWT)
    - Rate limiting and API versioning
    - Request/response transformation and validation

### 3. **Microservices Layer**
This is the core of the system, consisting of independently deployable microservices:

- **Workflow Orchestrator**: Manages the entire workflow lifecycle, from creation to execution.
- **Node Runtime Engine**: Executes individual nodes in a sandboxed environment.
- **Trigger Manager**: Handles all trigger types, including webhooks, cron jobs, and polling.
- **Credentials Vault**: Securely stores and manages all user credentials.
- **Execution History**: Logs and tracks all workflow executions for auditing and debugging.
- **User Management**: Manages users, workspaces, and role-based access control.
- **Notification Hub**: Sends notifications and alerts for workflow events.
- **Template Manager**: Manages workflow templates and community contributions.

### 4. **Infrastructure Layer**
This layer provides the underlying infrastructure for the system:

- **Databases**:
    - **PostgreSQL**: Primary relational database for workflows, users, and core data.
    - **MongoDB**: Document store for execution logs and semi-structured data.
    - **Redis**: In-memory data store for caching, session management, and real-time messaging.
- **Message Queue**:
    - **Apache Kafka**: High-throughput, distributed event streaming platform for inter-service communication.
- **Storage**:
    - **MinIO/S3**: Object storage for large files, artifacts, and backups.

### 5. **Observability Layer**
- **Monitoring**:
    - **Prometheus**: Metrics collection and alerting.
    - **Grafana**: Dashboards and visualizations.
- **Tracing**:
    - **Jaeger**: Distributed tracing for monitoring and troubleshooting microservices.
- **Logging**:
    - **ELK Stack (Elasticsearch, Logstash, Kibana)**: Centralized logging and analysis.

## 🔄 Data Flow & Communication

- **Client-API Communication**: The web application communicates with the API Gateway via HTTP/GraphQL.
- **Inter-Service Communication**: Microservices communicate with each other asynchronously via Apache Kafka events, ensuring loose coupling and high resilience.
- **Service-Database Communication**: Services interact with databases through a well-defined data access layer (repositories) to ensure data consistency and integrity.

## 📈 Scalability & High Availability

- **Horizontal Scaling**: All microservices are stateless and can be scaled horizontally to handle increased load.
- **Load Balancing**: The API Gateway uses a load balancer to distribute traffic across microservices.
- **Auto-scaling**: Kubernetes Horizontal Pod Autoscaler (HPA) automatically scales services based on CPU and memory utilization.
- **Database Scaling**: Read replicas, sharding, and connection pooling are used to scale the database layer.
- **High Availability**: The system is designed for high availability with redundant components and failover mechanisms.

## 🔒 Security

- **Authentication**: JWT-based authentication with short-lived access tokens and long-lived refresh tokens.
- **Authorization**: Role-based access control (RBAC) to restrict access to resources.
- **Data Encryption**: Data at rest and in transit is encrypted using industry-standard encryption algorithms.
- **Secrets Management**: HashiCorp Vault is used for secure storage and management of secrets.
- **Rate Limiting**: The API Gateway implements rate limiting to protect against abuse.

## 🛠️ Technology Choices

- **NestJS**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **TypeScript**: A statically typed superset of JavaScript that adds type safety and improves developer productivity.
- **Docker**: A containerization platform for building, shipping, and running applications in isolated containers.
- **Kubernetes**: A container orchestration platform for automating the deployment, scaling, and management of containerized applications.
- **Terraform**: An infrastructure as code (IaC) tool for provisioning and managing cloud infrastructure.

---

**Next**: [Domain-Driven Design](./02-domain-design.md)

