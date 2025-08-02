import { WorkflowExecution } from '../entities/execution.entity';
import { ExecutionId } from '../value-objects/execution-id.vo';

export interface IExecutionRepository {
  save(execution: WorkflowExecution): Promise<WorkflowExecution>;
  findById(id: ExecutionId): Promise<WorkflowExecution | null>;
  findByWorkflowId(workflowId: string): Promise<WorkflowExecution[]>;
  update(execution: WorkflowExecution): Promise<WorkflowExecution>;
  delete(id: ExecutionId): Promise<void>;
}
