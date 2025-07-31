import { Injectable, Logger } from '@nestjs/common';
import { SecureExecutorService } from './secure-executor.service';

export interface NodeExecutionRequest {
  nodeType: string;
  parameters: Record<string, any>;
  inputData: any[];
  executionId: string;
  nodeId: string;
  context?: {
    userId?: string;
    workflowId?: string;
    variables?: Record<string, any>;
    staticData?: Record<string, any>;
  };
}

export interface NodeExecutionResult {
  success: boolean;
  outputData: any[];
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  executionTime: number;
  logs?: string[];
}

export interface CodeValidationRequest {
  code: string;
  language: 'javascript' | 'python';
  context?: Record<string, any>;
}

export interface CodeValidationResult {
  valid: boolean;
  errors: Array<{
    line: number;
    message: string;
    type: 'error' | 'warning';
  }>;
  suggestions?: string[];
}

@Injectable()
export class RuntimeService {
  private readonly logger = new Logger(RuntimeService.name);

  constructor(
    private readonly secureExecutor: SecureExecutorService
  ) {}

  async executeNode(request: NodeExecutionRequest): Promise<NodeExecutionResult> {
    this.logger.log(`Executing node ${request.nodeId} (${request.nodeType}) for execution ${request.executionId}`);

    // For now, we'll provide a basic implementation
    // More complex node execution can be added later
    try {
      const startTime = Date.now();
      
      // Simple execution - for demo purposes
      const outputData = request.inputData || [{}];
      
      return {
        success: true,
        outputData,
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        outputData: [],
        error: {
          message: error.message,
          stack: error.stack
        },
        executionTime: 0
      };
    }
  }

  async validateCode(request: CodeValidationRequest): Promise<CodeValidationResult> {
    this.logger.log(`Validating ${request.language} code`);

    if (request.language === 'javascript') {
      return this.secureExecutor.validateJavaScript(request.code);
    }

    // For other languages, return basic validation
    return {
      valid: true,
      errors: []
    };
  }

  async executeJavaScript(
    code: string,
    context: Record<string, any>,
    timeout: number = 30000
  ): Promise<any> {
    return this.secureExecutor.executeJavaScript(code, context, timeout);
  }

  async executeExpression(
    expression: string,
    data: any,
    additionalKeys?: Record<string, any>
  ): Promise<any> {
    return this.secureExecutor.executeExpression(expression, data, additionalKeys);
  }

  async getAvailableNodeTypes(): Promise<string[]> {
    // Return basic node types for now
    return [
      'n8n-nodes-base.start',
      'n8n-nodes-base.set',
      'n8n-nodes-base.if',
      'n8n-nodes-base.httpRequest',
      'n8n-nodes-base.code'
    ];
  }

  async getNodeTypeDefinition(nodeType: string): Promise<any> {
    // Return basic node definition for now
    return {
      type: nodeType,
      displayName: nodeType.split('.').pop(),
      description: `Node of type ${nodeType}`
    };
  }
}
