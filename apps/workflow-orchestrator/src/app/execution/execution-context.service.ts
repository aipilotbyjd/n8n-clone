import { Injectable, Logger } from '@nestjs/common';
import { WorkflowExecutionMode, WorkflowExecutionSource } from '@n8n-clone/shared';

export interface ExecutionContext {
  executionId: string;
  workflowId: string;
  userId?: string;
  inputData?: any;
  mode: WorkflowExecutionMode;
  source: WorkflowExecutionSource;
  createdAt: Date;
  variables: Record<string, any>;
  staticData: Record<string, any>;
  settings: {
    timezone?: string;
    saveExecutionProgress?: boolean;
    saveDataErrorExecution?: string;
    saveDataSuccessExecution?: string;
    saveManualExecutions?: boolean;
    callerPolicy?: string;
  };
}

@Injectable()
export class ExecutionContextService {
  private readonly logger = new Logger(ExecutionContextService.name);
  private readonly contexts = new Map<string, ExecutionContext>();

  async createContext(
    executionId: string,
    data: {
      workflowId: string;
      userId?: string;
      inputData?: any;
      mode: WorkflowExecutionMode;
      source: WorkflowExecutionSource;
    }
  ): Promise<ExecutionContext> {
    this.logger.log(`Creating execution context for ${executionId}`);

    const context: ExecutionContext = {
      executionId,
      ...data,
      createdAt: new Date(),
      variables: {},
      staticData: {},
      settings: {
        timezone: 'UTC',
        saveExecutionProgress: true,
        saveDataErrorExecution: 'all',
        saveDataSuccessExecution: 'all',
        saveManualExecutions: true,
        callerPolicy: 'workflowOwner'
      }
    };

    // Load workflow-specific settings and static data
    await this.loadWorkflowSettings(context, data.workflowId);

    this.contexts.set(executionId, context);
    return context;
  }

  async getContext(executionId: string): Promise<ExecutionContext | null> {
    return this.contexts.get(executionId) || null;
  }

  async updateContext(executionId: string, updates: Partial<ExecutionContext>): Promise<void> {
    const context = this.contexts.get(executionId);
    if (context) {
      Object.assign(context, updates);
    }
  }

  async setVariable(executionId: string, key: string, value: any): Promise<void> {
    const context = this.contexts.get(executionId);
    if (context) {
      context.variables[key] = value;
    }
  }

  async getVariable(executionId: string, key: string): Promise<any> {
    const context = this.contexts.get(executionId);
    return context?.variables[key];
  }

  async setStaticData(executionId: string, key: string, value: any): Promise<void> {
    const context = this.contexts.get(executionId);
    if (context) {
      context.staticData[key] = value;
    }
  }

  async getStaticData(executionId: string, key: string): Promise<any> {
    const context = this.contexts.get(executionId);
    return context?.staticData[key];
  }

  async cleanupContext(executionId: string): Promise<void> {
    this.logger.log(`Cleaning up execution context for ${executionId}`);
    this.contexts.delete(executionId);
  }

  private async loadWorkflowSettings(context: ExecutionContext, workflowId: string): Promise<void> {
    // In a real implementation, this would load workflow-specific settings
    // from the database or workflow service
    
    // For now, we'll use default settings
    this.logger.debug(`Loading settings for workflow ${workflowId}`);
    
    // Example of loading static data (would come from database)
    context.staticData = {
      // workflow-specific static data would be loaded here
    };
  }
}
