# 🗄️ Database Design

This document outlines the database design and data modeling strategy for the n8n clone project.

## 🗄️ Database Architecture

The system uses a polyglot persistence approach with multiple databases optimized for different use cases:

### **PostgreSQL** - Primary Database
- **Purpose**: Primary relational database for core business data
- **Data**: Workflows, Users, Nodes, Connections, Credentials metadata
- **Features**: ACID compliance, complex queries, referential integrity

### **Redis** - Caching & Session Store
- **Purpose**: High-performance caching and session management
- **Data**: User sessions, cached workflows, rate limiting counters
- **Features**: In-memory performance, pub/sub messaging

### **MongoDB** - Document Store
- **Purpose**: Semi-structured data and execution logs
- **Data**: Execution logs, node output data, debug information
- **Features**: Flexible schema, horizontal scaling

### **InfluxDB** - Time Series Database
- **Purpose**: Metrics and time-series data
- **Data**: Performance metrics, execution times, system monitoring
- **Features**: Time-based queries, data retention policies

## 📊 Core Database Schemas

### Workflows Table
```sql
CREATE TABLE workflows (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL,
    active BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    settings JSONB,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workflows_user_active ON workflows(user_id, active);
CREATE INDEX idx_workflows_name_user ON workflows(name, user_id);
CREATE INDEX idx_workflows_tags ON workflows USING GIN(tags);
```

### Nodes Table
```sql
CREATE TABLE nodes (
    id UUID PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    parameters JSONB,
    position JSONB,
    credential_id UUID,
    disabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_nodes_workflow ON nodes(workflow_id);
CREATE INDEX idx_nodes_position ON nodes(workflow_id, position);
```

### Connections Table
```sql
CREATE TABLE connections (
    id UUID PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    source_node_id UUID NOT NULL,
    source_output VARCHAR(50) NOT NULL,
    target_node_id UUID NOT NULL,
    target_input VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_connections_workflow ON connections(workflow_id);
CREATE INDEX idx_connections_source ON connections(source_node_id);
CREATE INDEX idx_connections_target ON connections(target_node_id);
```

### Executions Table
```sql
CREATE TABLE executions (
    id UUID PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES workflows(id),
    status VARCHAR(20) NOT NULL,
    mode VARCHAR(20) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    finished_at TIMESTAMP,
    triggered_by VARCHAR(50),
    input JSONB,
    output JSONB,
    error JSONB,
    execution_data JSONB
);

CREATE INDEX idx_executions_workflow ON executions(workflow_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_executions_started_at ON executions(started_at);
```

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(50) DEFAULT 'user',
    settings JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(active);
```

### Credentials Table
```sql
CREATE TABLE credentials (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    encrypted_data TEXT NOT NULL,
    tested_at TIMESTAMP,
    is_valid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_credentials_user ON credentials(user_id);
CREATE INDEX idx_credentials_type ON credentials(type);
```

## 🔄 Data Migration Strategy

### Migration Management
- **Tool**: TypeORM migrations for PostgreSQL
- **Versioning**: Sequential migration files with timestamps
- **Rollback**: All migrations include down() methods for rollback
- **Testing**: Migrations tested in staging environment before production

### Migration Example
```typescript
export class CreateWorkflowsTable1642678900000 implements MigrationInterface {
    name = 'CreateWorkflowsTable1642678900000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "workflows" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "description" text,
                "user_id" uuid NOT NULL,
                "active" boolean NOT NULL DEFAULT false,
                "tags" text array,
                "settings" jsonb,
                "version" integer NOT NULL DEFAULT 1,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_workflows" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "workflows"`);
    }
}
```

## 📈 Performance Optimization

### Indexing Strategy
- **Primary Keys**: UUID-based primary keys for all tables
- **Foreign Keys**: Indexed for fast joins
- **Query Optimization**: Indexes based on common query patterns
- **Composite Indexes**: Multi-column indexes for complex queries

### Connection Pooling
```typescript
{
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  extra: {
    connectionLimit: 20,
    acquireTimeout: 60000,
    timeout: 60000,
  }
}
```

### Caching Strategy
- **L1 Cache**: Application-level caching with TTL
- **L2 Cache**: Redis-based distributed caching
- **Cache Invalidation**: Event-driven cache invalidation

---

**Next**: [Domain Layer Implementation](./05-domain-implementation.md)
