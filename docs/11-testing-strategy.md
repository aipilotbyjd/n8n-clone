# 🧪 Testing Strategy

This document outlines the testing strategy for the n8n clone project to ensure high quality, reliability, and maintainability.

## 🧪 Testing Pyramid

The testing strategy follows the testing pyramid model:

- **Unit Tests** (70%): Test individual components in isolation.
- **Integration Tests** (20%): Test the interaction between multiple components.
- **End-to-End (E2E) Tests** (10%): Test the entire system from the user's perspective.

### Unit Tests
- **Framework**: [Jest](https://jestjs.io/)
- **Location**: `libs/**/*.spec.ts`
- **Coverage**: Aim for at least 80% code coverage.

### Integration Tests
- **Framework**: Jest + [Supertest](https://github.com/visionmedia/supertest)
- **Location**: `libs/**/*.integration.spec.ts`
- **Scope**: Test the interaction between services, databases, and message queues.

### End-to-End (E2E) Tests
- **Framework**: [Cypress](https://www.cypress.io/)
- **Location**: `apps/webapp/cypress/integration/**/*.spec.ts`
- **Scope**: Test critical user flows, such as creating a workflow and executing it.

## 🔄 Continuous Integration (CI)

### CI Pipeline
- **Provider**: GitHub Actions
- **Workflow**: The CI pipeline is triggered on every push and pull request.
- **Steps**:
  1. **Install dependencies**
  2. **Lint code**
  3. **Run unit tests**
  4. **Run integration tests**
  5. **Build application**
  6. **Run E2E tests** (on master branch)
  7. **Deploy to staging** (on master branch)

### CI Configuration
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Use Node.js 16
      uses: actions/setup-node@v2
      with:
        node-version: 16

    - name: Install dependencies
      run: npm install

    - name: Lint
      run: npm run lint

    - name: Test
      run: npm run test

    - name: Build
      run: npm run build
```

## 🚀 Deployment Strategy

### Staging Environment
- **Purpose**: A production-like environment for testing new features before they are deployed to production.
- **Deployment**: Automatic deployment to staging on every successful build of the master branch.

### Production Environment
- **Deployment**: Manual deployment to production after successful testing in staging.
- **Rollback**: A rollback plan is in place to quickly revert to a previous version in case of issues.

---

**Next**: [Deployment Guide](./12-deployment.md)

