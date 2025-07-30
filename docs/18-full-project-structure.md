# 📂 Full Project Structure

This document provides a complete overview of the file and directory structure of the n8n clone project.

```
n8n-clone-workspace/
├── apps/                           # 🚀 MICROSERVICES LAYER
│   ├── api-gateway/                # Entry point & request routing
│   ├── workflow-orchestrator/      # Core workflow execution engine
│   ├── node-runtime-engine/        # Node execution environment
│   ├── trigger-manager/            # All trigger types management
│   ├── credentials-vault/          # Secure credential management
│   ├── execution-history/          # Execution tracking & history
│   ├── template-manager/           # Workflow templates system
│   ├── user-management/            # User & workspace management
│   ├── notification-hub/           # Alerts & notifications
│   ├── variable-manager/           # Environment & global variables
│   ├── queue-processor/            # Background job processing
│   └── monitoring-service/         # System monitoring & health
├── libs/                           # 📚 SHARED LIBRARIES LAYER
│   ├── domain/                     # 🎯 DOMAIN LAYER (Business Logic)
│   ├── application/                # 💼 APPLICATION LAYER (Use Cases)
│   ├── infrastructure/              # 🔧 INFRASTRUCTURE LAYER (External Concerns)
│   ├── integrations/               # 🔌 INTEGRATION NODES (All n8n Nodes)
│   ├── shared/                     # 🤝 SHARED KERNEL
│   └── testing/                    # 🧪 TESTING UTILITIES
├── tools/                          # 🛠️ DEVELOPMENT TOOLS
├── docker/                         # 🐳 CONTAINERIZATION
├── k8s/                           # ☸️ KUBERNETES MANIFESTS
├── terraform/                     # 🏗️ INFRASTRUCTURE AS CODE
└── docs/                          # 📚 DOCUMENTATION
```

---

**Next**: [Back to README](./README.md)

