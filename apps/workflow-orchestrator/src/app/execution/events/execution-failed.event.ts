export class ExecutionFailedEvent {
  constructor(
    public readonly executionId: string,
    public readonly workflowId: string,
    public readonly error: {
      message: string;
      stack?: string;
      code?: string;
    },
    public readonly userId?: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
