export class StopExecutionCommand {
  constructor(
    public readonly executionId: string,
    public readonly userId?: string,
    public readonly reason?: string
  ) {}
}
