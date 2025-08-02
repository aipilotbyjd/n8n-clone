import { Injectable } from '@nestjs/common';
import { Workflow } from '../entities/workflow.entity';
import { ExecutionStep } from '../entities/execution-step.entity';

@Injectable()
export class WorkflowExecutionService {
  startExecution(workflow: Workflow, input: any): Workflow {
    // Business logic to start execution
    return workflow.execute(input);
  }

  executeStep(executionStep: ExecutionStep, data: any): ExecutionStep {
    // Business logic to execute a step
    executionStep.process(data);
    return executionStep;
  }

  completeExecution(workflow: Workflow): void {
    // Business logic to complete execution
    workflow.complete();
  }
}
