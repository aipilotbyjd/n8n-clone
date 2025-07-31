export class ExecutionStoppedEvent {
  constructor(
    public readonly executionId: string,
    public readonly userId?: string,
    public readonly reason?: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
