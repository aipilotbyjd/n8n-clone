import { ExecutionStatus } from '@n8n-clone/shared/types';

export class ExecutionCompletedEvent {
  constructor(
    public readonly executionId: string,
    public readonly workflowId: string,
    public readonly status: ExecutionStatus,
    public readonly duration: number,
    public readonly userId?: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
