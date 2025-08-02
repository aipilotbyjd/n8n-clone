import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

export interface NodeDefinition {
  type: string;
  displayName: string;
  name: string;
  group: string[];
  version: number;
  description: string;
  defaults: {
    name: string;
  };
  inputs: string[];
  outputs: string[];
  properties: NodeProperty[];
  credentials?: CredentialInfo[];
}

export interface NodeProperty {
  displayName: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'options' | 'collection' | 'fixedCollection' | 'json' | 'dateTime';
  default?: any;
  required?: boolean;
  description?: string;
  options?: { name: string; value: any; displayName?: string }[] | NodeProperty[];
}

export interface CredentialInfo {
  name: string;
  required?: boolean;
}

export interface INodeExecutionData {
  json: { [key: string]: any };
  binary?: { [key: string]: any };
}

export interface NodeExecuteContext {
  getInputData(): INodeExecutionData[];
  getNodeParameter(parameterName: string, itemIndex: number, defaultValue?: any): any;
  prepareOutputData(outputData: INodeExecutionData[]): INodeExecutionData[][];
  getCredentials(type: string): Promise<{ [key: string]: any }>;
  helpers: {
    httpRequest(options: any): Promise<any>;
  };
}

export interface INodeType {
  description: NodeDefinition;
  execute(context: NodeExecuteContext): Promise<INodeExecutionData[][]>;
}

@Injectable()
export class NodeRegistryService {
  private readonly logger = new Logger(NodeRegistryService.name);
  private readonly nodeMap = new Map<string, INodeType>();
  private readonly categoryMap = new Map<string, Set<string>>();

  constructor(private readonly moduleRef: ModuleRef) {
    this.initializeCoreNodes();
  }

  private initializeCoreNodes(): void {
    // Initialize core nodes on service startup
    this.logger.log('Initializing core nodes...');
    
    // Import and register core nodes
    import('../nodes/start/start.node').then(({ StartNode }) => {
      this.registerNode(new StartNode());
    });
    
    import('../nodes/set/set.node').then(({ SetNode }) => {
      this.registerNode(new SetNode());
    });
    
    import('../nodes/if/if.node').then(({ IfNode }) => {
      this.registerNode(new IfNode());
    });
    
    import('../nodes/http-request/http-request.node').then(({ HttpRequestNode }) => {
      this.registerNode(new HttpRequestNode());
    });
    
    import('../nodes/function/function.node').then(({ FunctionNode }) => {
      this.registerNode(new FunctionNode());
    });
    
    import('../nodes/code/code.node').then(({ CodeNode }) => {
      this.registerNode(new CodeNode());
    });
    
    import('../nodes/merge/merge.node').then(({ MergeNode }) => {
      this.registerNode(new MergeNode());
    });
    
    this.logger.log('Core nodes initialization completed');
  }

  registerNode(nodeInstance: INodeType): void {
    try {
      this.validateNode(nodeInstance);
      
      const nodeType = nodeInstance.description.type;
      this.nodeMap.set(nodeType, nodeInstance);

      // Add to category map
      nodeInstance.description.group.forEach(category => {
        if (!this.categoryMap.has(category)) {
          this.categoryMap.set(category, new Set());
        }
        this.categoryMap.get(category)!.add(nodeType);
      });

      this.logger.log(`Registered node: ${nodeType}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to register node: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  getNode(type: string): INodeType | undefined {
    return this.nodeMap.get(type);
  }

  listNodes(category?: string): NodeDefinition[] {
    let nodeTypes: string[];

    if (category) {
      const categoryNodes = this.categoryMap.get(category);
      nodeTypes = categoryNodes ? Array.from(categoryNodes) : [];
    } else {
      nodeTypes = Array.from(this.nodeMap.keys());
    }

    return nodeTypes
      .map(type => this.nodeMap.get(type)?.description)
      .filter((desc): desc is NodeDefinition => desc !== undefined);
  }

  getNodeCategories(): string[] {
    return Array.from(this.categoryMap.keys());
  }

  async executeNode(
    nodeType: string,
    context: NodeExecuteContext
  ): Promise<INodeExecutionData[][]> {
    const node = this.getNode(nodeType);
    if (!node) {
      throw new Error(`Node type '${nodeType}' not found`);
    }

    try {
      this.logger.debug(`Executing node: ${nodeType}`);
      const result = await node.execute(context);
      this.logger.debug(`Node execution completed: ${nodeType}`);
      return result;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Node execution failed: ${nodeType}`, errorStack);
      throw error;
    }
  }

  private validateNode(nodeInstance: INodeType): void {
    const { description } = nodeInstance;

    if (!description.type) {
      throw new Error('Node type is required');
    }

    if (!description.displayName) {
      throw new Error('Node displayName is required');
    }

    if (!description.name) {
      throw new Error('Node name is required');
    }

    if (!Array.isArray(description.group) || description.group.length === 0) {
      throw new Error('Node group is required and must be an array');
    }

    if (typeof description.version !== 'number') {
      throw new Error('Node version must be a number');
    }

    if (!Array.isArray(description.inputs)) {
      throw new Error('Node inputs must be an array');
    }

    if (!Array.isArray(description.outputs)) {
      throw new Error('Node outputs must be an array');
    }

    if (typeof nodeInstance.execute !== 'function') {
      throw new Error('Node must have an execute method');
    }
  }
}
