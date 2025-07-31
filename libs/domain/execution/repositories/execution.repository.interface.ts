import { WorkflowExecution } from '../entities/execution.entity';
import { ExecutionId } from '../value-objects/execution-id.vo';
import { WorkflowId } from '../../workflow/value-objects/workflow-id.vo';
import { ExecutionStatus, ExecutionMode } from '../value-objects/execution-status.vo';

export interface ExecutionQueryOptions {
  workflowId?: WorkflowId;
  status?: ExecutionStatus;
  mode?: ExecutionMode;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'startedAt' | 'finishedAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface ExecutionSummary {
  id: ExecutionId;
  workflowId: WorkflowId;
  status: ExecutionStatus;
  mode: ExecutionMode;
  startedAt: Date;
  finishedAt?: Date;
  duration?: number;
  userId?: string;
  workflowName?: string;
}

export interface IExecutionRepository {
  /**
   * Find execution by ID
   */
  findById(id: ExecutionId): Promise<WorkflowExecution | null>;

  /**
   * Save execution
   */
  save(execution: WorkflowExecution): Promise<void>;

  /**
   * Delete execution
   */
  delete(id: ExecutionId): Promise<void>;

  /**
   * Find executions with query options
   */
  findMany(options: ExecutionQueryOptions): Promise<WorkflowExecution[]>;

  /**
   * Find execution summaries (lightweight version)
   */
  findSummaries(options: ExecutionQueryOptions): Promise<ExecutionSummary[]>;

  /**
   * Count executions matching query
   */
  count(options: ExecutionQueryOptions): Promise<number>;

  /**
   * Find latest execution for workflow
   */
  findLatestByWorkflow(workflowId: WorkflowId): Promise<WorkflowExecution | null>;

  /**
   * Find active (running) executions
   */
  findActive(): Promise<WorkflowExecution[]>;

  /**
   * Find failed executions that can be retried
   */
  findRetryable(): Promise<WorkflowExecution[]>;

  /**
   * Clean up old executions
   */
  deleteOlderThan(date: Date): Promise<number>;

  /**
   * Get execution statistics for a workflow
   */
  getStatistics(workflowId: WorkflowId, days?: number): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    lastExecution?: Date;
  }>;

  /**
   * Update execution status
   */
  updateStatus(id: ExecutionId, status: ExecutionStatus): Promise<void>;
}
