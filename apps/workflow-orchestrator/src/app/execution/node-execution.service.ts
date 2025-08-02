import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ExecutionStatus } from '@n8n-clone/shared/types';

export interface NodeExecutionContext {
  executionId: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  parameters: Record<string, any>;
  inputData: any[];
  connectionInputData?: Record<string, any>;
}

export interface NodeExecutionResult {
  success: boolean;
  data: any[];
  error?: {
    message: string;
    stack?: string;
  };
  executionTime: number;
}

@Injectable()
export class NodeExecutionService {
  private readonly logger = new Logger(NodeExecutionService.name);
  private readonly nodeExecutions = new Map<string, Set<string>>();

  constructor(
    private readonly httpService: HttpService
  ) {}

  async executeNode(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    this.logger.log(`Executing node ${context.nodeId} (${context.nodeType}) for execution ${context.executionId}`);

    try {
      // Track active node execution
      if (!this.nodeExecutions.has(context.executionId)) {
        this.nodeExecutions.set(context.executionId, new Set());
      }
      this.nodeExecutions.get(context.executionId)!.add(context.nodeId);

      // Execute the node based on its type
      const result = await this.executeNodeByType(context);

      // Clean up tracking
      this.nodeExecutions.get(context.executionId)?.delete(context.nodeId);

      const executionTime = Date.now() - startTime;
      this.logger.log(`Node ${context.nodeId} completed in ${executionTime}ms`);

      return {
        success: true,
        data: result,
        executionTime
      };

    } catch (error) {
      this.logger.error(`Node ${context.nodeId} failed:`, error);

      // Clean up tracking
      this.nodeExecutions.get(context.executionId)?.delete(context.nodeId);

      const executionTime = Date.now() - startTime;

      return {
        success: false,
        data: [],
        error: {
          message: error.message,
          stack: error.stack
        },
        executionTime
      };
    }
  }

  async stopExecution(executionId: string): Promise<void> {
    this.logger.log(`Stopping all nodes for execution ${executionId}`);

    const activeNodes = this.nodeExecutions.get(executionId);
    if (activeNodes) {
      // In a real implementation, this would cancel running nodes
      // For now, we'll just clear the tracking
      activeNodes.clear();
      this.nodeExecutions.delete(executionId);
    }
  }

  private async executeNodeByType(context: NodeExecutionContext): Promise<any[]> {
    const { nodeType, parameters, inputData } = context;

    // Route to appropriate execution based on node type
    switch (nodeType) {
      case 'n8n-nodes-base.start':
        return this.executeStartNode(context);
      
      case 'n8n-nodes-base.set':
        return this.executeSetNode(context);
      
      case 'n8n-nodes-base.if':
        return this.executeIfNode(context);
      
      case 'n8n-nodes-base.httpRequest':
        return this.executeHttpRequestNode(context);
      
      case 'n8n-nodes-base.code':
        return this.executeCodeNode(context);
      
      default:
        // For unknown node types, call the node runtime engine
        return this.executeViaNodeRuntime(context);
    }
  }

  private async executeStartNode(context: NodeExecutionContext): Promise<any[]> {
    // Start node just passes through the input data or creates initial data
    return context.inputData.length > 0 ? context.inputData : [{}];
  }

  private async executeSetNode(context: NodeExecutionContext): Promise<any[]> {
    const { parameters, inputData } = context;
    const { values } = parameters;

    return inputData.map(item => {
      const newItem = { ...item };
      
      if (values && Array.isArray(values)) {
        values.forEach((value: any) => {
          newItem[value.name] = value.value;
        });
      }

      return newItem;
    });
  }

  private async executeIfNode(context: NodeExecutionContext): Promise<any[]> {
    const { parameters, inputData } = context;
    const { conditions } = parameters;

    // Simple condition evaluation (in real implementation, this would be more complex)
    const result = inputData.filter(item => {
      // Evaluate conditions logic here
      return true; // Simplified for demo
    });

    return result;
  }

  private async executeHttpRequestNode(context: NodeExecutionContext): Promise<any[]> {
    const { parameters } = context;
    const { method = 'GET', url, headers, body } = parameters;

    try {
      const response = await this.httpService.axiosRef({
        method,
        url,
        headers,
        data: body
      });

      return [{ 
        status: response.status,
        data: response.data,
        headers: response.headers 
      }];
    } catch (error) {
      throw new Error(`HTTP request failed: ${error.message}`);
    }
  }

  private async executeCodeNode(context: NodeExecutionContext): Promise<any[]> {
    // This would call the node-runtime-engine microservice
    // For now, we'll simulate it
    const { parameters, inputData } = context;
    const { jsCode } = parameters;

    // In real implementation, this would securely execute JavaScript
    // using the node-runtime-engine microservice
    return inputData; // Simplified for demo
  }

  private async executeViaNodeRuntime(context: NodeExecutionContext): Promise<any[]> {
    // Call the node-runtime-engine microservice for custom node execution
    try {
      const response = await this.httpService.axiosRef.post('http://node-runtime-engine:3000/execute', {
        nodeType: context.nodeType,
        parameters: context.parameters,
        inputData: context.inputData,
        executionId: context.executionId
      });

      return response.data.outputData || [];
    } catch (error) {
      throw new Error(`Node runtime execution failed: ${error.message}`);
    }
  }
}
