import { Injectable, Logger } from '@nestjs/common';

export interface ErrorPolicy {
  continueOnFail: boolean;
  retryOnFail: boolean;
  maxRetries: number;
  retryInterval: number;
  fallbackNode?: string;
}

export interface WorkflowError {
  executionId: string;
  nodeId: string;
  error: {
    message: string;
    stack?: string;
    code?: string;
  };
  timestamp: Date;
  retryCount: number;
}

@Injectable()
export class ErrorHandlingService {
  private readonly logger = new Logger(ErrorHandlingService.name);
  private readonly errorHistory = new Map<string, WorkflowError[]>();

  async handleError(
    executionId: string,
    nodeId: string,
    error: Error,
    policy: ErrorPolicy
  ): Promise<{
    shouldRetry: boolean;
    shouldContinue: boolean;
    nextNode?: string;
  }> {
    this.logger.error(`Error in execution ${executionId}, node ${nodeId}:`, error);

    const workflowError: WorkflowError = {
      executionId,
      nodeId,
      error: {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      },
      timestamp: new Date(),
      retryCount: 0,
    };

    // Track error history
    if (!this.errorHistory.has(executionId)) {
      this.errorHistory.set(executionId, []);
    }
    
    const errors = this.errorHistory.get(executionId)!;
    const existingError = errors.find(e => e.nodeId === nodeId);
    
    if (existingError) {
      existingError.retryCount++;
      workflowError.retryCount = existingError.retryCount;
    } else {
      errors.push(workflowError);
    }

    // Determine action based on policy
    const shouldRetry = policy.retryOnFail && workflowError.retryCount < policy.maxRetries;
    const shouldContinue = policy.continueOnFail && !shouldRetry;

    if (shouldRetry) {
      this.logger.log(`Retrying node ${nodeId} (attempt ${workflowError.retryCount + 1}/${policy.maxRetries})`);
      
      // Wait before retry if interval is specified
      if (policy.retryInterval > 0) {
        await new Promise(resolve => setTimeout(resolve, policy.retryInterval));
      }
    }

    return {
      shouldRetry,
      shouldContinue,
      nextNode: shouldContinue ? policy.fallbackNode : undefined,
    };
  }

  async getErrorHistory(executionId: string): Promise<WorkflowError[]> {
    return this.errorHistory.get(executionId) || [];
  }

  async clearErrorHistory(executionId: string): Promise<void> {
    this.errorHistory.delete(executionId);
  }

  createDefaultPolicy(): ErrorPolicy {
    return {
      continueOnFail: false,
      retryOnFail: false,
      maxRetries: 3,
      retryInterval: 1000,
    };
  }

  createRetryPolicy(maxRetries: number = 3, interval: number = 1000): ErrorPolicy {
    return {
      continueOnFail: false,
      retryOnFail: true,
      maxRetries,
      retryInterval: interval,
    };
  }

  createContinuePolicy(fallbackNode?: string): ErrorPolicy {
    return {
      continueOnFail: true,
      retryOnFail: false,
      maxRetries: 0,
      retryInterval: 0,
      fallbackNode,
    };
  }
}
