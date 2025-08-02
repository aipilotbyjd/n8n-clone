import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { HttpService } from '@nestjs/axios';
import { ExecutionStatus, WorkflowExecutionMode, WorkflowExecutionSource } from '@n8n-clone/shared/types';
import { ExecutionCompletedEvent } from './events/execution-completed.event';
import { ExecutionFailedEvent } from './events/execution-failed.event';
import { NodeExecutionService } from './node-execution.service';
import { ExecutionContextService } from './execution-context.service';

export interface ExecutionRequest {
  executionId: string;
  workflowId: string;
  inputData?: any;
  userId?: string;
  source: string;
  async: boolean;
  options?: {
    loadStaticData?: boolean;
    startNodes?: string[];
    destinationNodes?: string[];
    runData?: Record<string, any>;
  };
}

export interface RetryRequest {
  originalExecutionId: string;
  newExecutionId: string;
  fromNode?: string;
  loadStaticData: boolean;
  userId?: string;
}

@Injectable()
export class WorkflowExecutionEngine {
  private readonly logger = new Logger(WorkflowExecutionEngine.name);
  private readonly activeExecutions = new Map<string, any>();

  constructor(
    private readonly eventBus: EventBus,
    private readonly httpService: HttpService,
    private readonly nodeExecutionService: NodeExecutionService,
    private readonly contextService: ExecutionContextService
  ) {}

  async execute(request: ExecutionRequest): Promise<{ status: ExecutionStatus }> {
    const { executionId, workflowId } = request;
    this.logger.log(`Starting execution ${executionId} for workflow ${workflowId}`);

    try {
      // Mark execution as active
      this.activeExecutions.set(executionId, {
        id: executionId,
        workflowId,
        status: ExecutionStatus.RUNNING,
        startTime: new Date(),
        ...request
      });

      // Create execution context
      await this.contextService.createContext(executionId, {
        workflowId,
        userId: request.userId,
        inputData: request.inputData,
        mode: this.getExecutionMode(request.source),
        source: this.getExecutionSource(request.source),
      });

      // Load workflow definition
      const workflow = await this.loadWorkflowDefinition(workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      // Execute workflow
      const result = await this.executeWorkflow(executionId, workflow, request);

      // Update execution status
      this.activeExecutions.delete(executionId);

      // Emit completion event
      const duration = Date.now() - this.activeExecutions.get(executionId)?.startTime?.getTime() || 0;
      this.eventBus.publish(new ExecutionCompletedEvent(
        executionId,
        workflowId,
        result.status,
        duration,
        request.userId
      ));

      return { status: result.status };

    } catch (error) {
      this.logger.error(`Execution ${executionId} failed:`, error);
      
      // Clean up active execution
      this.activeExecutions.delete(executionId);

      // Emit failure event
      this.eventBus.publish(new ExecutionFailedEvent(
        executionId,
        workflowId,
        {
          message: error.message,
          stack: error.stack,
          code: error.code
        },
        request.userId
      ));

      return { status: ExecutionStatus.ERROR };
    }
  }

  async stop(executionId: string, reason?: string): Promise<void> {
    this.logger.log(`Stopping execution ${executionId}`);

    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found or not active`);
    }

    // Update status to canceled
    execution.status = ExecutionStatus.CANCELED;
    execution.cancelReason = reason;

    // Stop the execution
    await this.nodeExecutionService.stopExecution(executionId);

    // Clean up
    this.activeExecutions.delete(executionId);
  }

  async retry(request: RetryRequest): Promise<{ status: ExecutionStatus }> {
    this.logger.log(`Retrying execution ${request.originalExecutionId} as ${request.newExecutionId}`);

    // Load original execution data
    const originalContext = await this.contextService.getContext(request.originalExecutionId);
    if (!originalContext) {
      throw new Error(`Original execution ${request.originalExecutionId} not found`);
    }

    // Create new execution based on original
    const retryRequest: ExecutionRequest = {
      executionId: request.newExecutionId,
      workflowId: originalContext.workflowId,
      inputData: originalContext.inputData,
      userId: request.userId,
      source: 'retry',
      async: false,
      options: {
        loadStaticData: request.loadStaticData,
        startNodes: request.fromNode ? [request.fromNode] : undefined,
      }
    };

    return this.execute(retryRequest);
  }

  getActiveExecutions(): string[] {
    return Array.from(this.activeExecutions.keys());
  }

  private async loadWorkflowDefinition(workflowId: string): Promise<any> {
    // In a real implementation, this would fetch from the workflow service
    // For now, we'll return a mock workflow
    return {
      id: workflowId,
      name: `Workflow ${workflowId}`,
      nodes: [],
      connections: {},
      settings: {}
    };
  }

  private async executeWorkflow(executionId: string, workflow: any, request: ExecutionRequest): Promise<{ status: ExecutionStatus }> {
    this.logger.log(`Executing workflow nodes for execution ${executionId}`);

    // In a real implementation, this would:
    // 1. Parse workflow structure
    // 2. Execute nodes in the correct order
    // 3. Handle connections and data flow
    // 4. Manage parallel execution
    // 5. Handle errors and retries

    // For now, we'll simulate execution
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { status: ExecutionStatus.SUCCESS };
  }

  private getExecutionMode(source: string): WorkflowExecutionMode {
    switch (source) {
      case 'webhook': return WorkflowExecutionMode.WEBHOOK;
      case 'trigger': return WorkflowExecutionMode.TRIGGER;
      case 'retry': return WorkflowExecutionMode.RETRY;
      case 'test': return WorkflowExecutionMode.TEST;
      default: return WorkflowExecutionMode.MANUAL;
    }
  }

  private getExecutionSource(source: string): WorkflowExecutionSource {
    switch (source) {
      case 'webhook': return WorkflowExecutionSource.WEBHOOK;
      case 'trigger': return WorkflowExecutionSource.TRIGGER;
      case 'api': return WorkflowExecutionSource.API;
      case 'cli': return WorkflowExecutionSource.CLI;
      case 'internal': return WorkflowExecutionSource.INTERNAL;
      default: return WorkflowExecutionSource.EDITOR;
    }
  }
}
