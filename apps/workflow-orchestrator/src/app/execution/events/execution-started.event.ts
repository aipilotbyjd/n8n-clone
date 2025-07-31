export class ExecutionStartedEvent {
  constructor(
    public readonly executionId: string,
    public readonly workflowId: string,
    public readonly userId?: string,
    public readonly source?: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
