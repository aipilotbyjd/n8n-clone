# 🔌 Integration Nodes

This document provides an overview of the integration nodes available in the n8n clone and how to create new ones.

## 📦 Core Nodes

- **Code**: Executes arbitrary JavaScript or Python code.
- **Function**: A simplified version of the Code node for simple transformations.
- **If**: A conditional node for branching logic.
- **Switch**: A multi-branch conditional node.
- **Merge**: Merges data from multiple streams.
- **Set**: Sets or modifies data in the workflow.
- **Split in Batches**: Splits data into smaller batches for processing.

## 🔌 Service Nodes

The n8n clone supports a wide range of service integrations, including:

- **Communication**: Email, Slack, Discord, Telegram
- **Productivity**: Google Workspace, Microsoft 365, Asana, Trello, Jira
- **CRM**: Salesforce, HubSpot, Pipedrive, Zoho CRM
- **eCommerce**: Shopify, WooCommerce, Magento, Stripe
- **Social Media**: Facebook, Instagram, Twitter, LinkedIn
- **Cloud Storage**: AWS S3, Google Cloud Storage, Dropbox
- **Databases**: MySQL, PostgreSQL, MongoDB, Redis

## 🛠️ Creating a New Node

Creating a new integration node is a straightforward process.

### 1. Define Node Properties

Create a new file in `libs/integrations/nodes/` with the node definition.

```typescript
// libs/integrations/nodes/mynode/mynode.node.ts
import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class MyNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'My Node',
		name: 'myNode',
		group: ['transform'],
		version: 1,
		description: 'My Custom Node',
		defaults: {
			name: 'My Node',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			// Properties definition here
		]
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Execution logic here
	}
}
```

### 2. Register the Node

Register the new node in the `NodeRegistryService`.

```typescript
// apps/node-registry/src/node-registry.service.ts
@Injectable()
export class NodeRegistryService {
  constructor() {
    this.registerNode(new MyNode());
  }

  registerNode(node: INodeType) {
    // ... registration logic
  }
}
```

### 3. Implement Execution Logic

Implement the `execute` method in your node class. This method contains the core logic of the node.

```typescript
// libs/integrations/nodes/mynode/mynode.node.ts
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const items = this.getInputData();
  let item: INodeExecutionData;
  let myString: string;

  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    myString = this.getNodeParameter('myString', itemIndex, '') as string;
    item = items[itemIndex];

    item.json['myString'] = myString;
  }

  return this.prepareOutputData(items);
}
```

---

**Next**: [Getting Started](./09-getting-started.md)

