# 📚 API Documentation

This document provides comprehensive documentation for the REST API of the n8n clone.

## 🔗 Base URL

All API endpoints are relative to the base URL:

```
https://api.n8n-clone.com/v1
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Authentication Endpoints

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

## 🔄 Workflow Endpoints

### Create Workflow
```http
POST /workflows
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "My Workflow",
  "description": "This is my workflow",
  "tags": ["automation", "example"]
}
```

### Get Workflow
```http
GET /workflows/{id}
Authorization: Bearer <token>
```

### List Workflows
```http
GET /workflows?page=1&limit=10&active=true
Authorization: Bearer <token>
```

### Update Workflow
```http
PUT /workflows/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Updated Workflow",
  "active": true
}
```

### Delete Workflow
```http
DELETE /workflows/{id}
Authorization: Bearer <token>
```

## ⚡ Execution Endpoints

### Execute Workflow
```http
POST /workflows/{id}/execute
Content-Type: application/json
Authorization: Bearer <token>

{
  "input": {
    "data": "example input"
  }
}
```

**Response:**
```json
{
  "executionId": "456e7890-e89b-12d3-a456-426614174001",
  "status": "running",
  "startedAt": "2023-01-01T00:00:00Z"
}
```

### Get Execution
```http
GET /executions/{id}
Authorization: Bearer <token>
```

### List Executions
```http
GET /executions?workflowId={workflowId}&status=completed
Authorization: Bearer <token>
```

## 🔌 Node Endpoints

### List Available Nodes
```http
GET /nodes
Authorization: Bearer <token>
```

### Get Node Definition
```http
GET /nodes/{type}
Authorization: Bearer <token>
```

## 🔑 Credential Endpoints

### Create Credential
```http
POST /credentials
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "My API Key",
  "type": "httpBasicAuth",
  "data": {
    "user": "username",
    "password": "password"
  }
}
```

### List Credentials
```http
GET /credentials
Authorization: Bearer <token>
```

### Test Credential
```http
POST /credentials/{id}/test
Authorization: Bearer <token>
```

## 📊 Error Responses

The API uses standard HTTP status codes and returns error details in the following format:

```json
{
  "error": {
    "code": "WORKFLOW_NOT_FOUND",
    "message": "Workflow with id 123 not found",
    "details": {
      "workflowId": "123"
    }
  }
}
```

### Common Error Codes

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## 📈 Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Authenticated users**: 1000 requests per hour
- **Unauthenticated users**: 100 requests per hour
- **Workflow executions**: 60 executions per minute

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

**Next**: [Testing Strategy](./11-testing-strategy.md)
