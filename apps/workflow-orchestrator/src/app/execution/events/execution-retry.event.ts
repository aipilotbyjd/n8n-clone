export class ExecutionRetryEvent {
  constructor(
    public readonly originalExecutionId: string,
    public readonly newExecutionId: string,
    public readonly userId?: string,
    public readonly fromNode?: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
