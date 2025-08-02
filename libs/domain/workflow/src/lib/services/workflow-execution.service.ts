import { Injectable } from '@nestjs/common';
import { Workflow } from '../entities/workflow.entity';
import { ExecutionStep } from '../entities/execution-step.entity';

@Injectable()
export class WorkflowExecutionService {
  async startExecution(workflow: Workflow, input: any): Promise<any> {
    // Business logic to start execution
    return await workflow.execute(input);
  }

  executeStep(executionStep: ExecutionStep, data: any): ExecutionStep {
    // Business logic to execute a step
    executionStep.start();
    try {
      // Process the data and complete the step
      executionStep.complete(data);
    } catch (error) {
      executionStep.fail(error as Error);
    }
    return executionStep;
  }

  completeExecution(workflow: Workflow): void {
    // Business logic to complete execution
    workflow.complete();
  }
}
