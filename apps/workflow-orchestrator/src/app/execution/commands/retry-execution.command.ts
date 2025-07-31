export class RetryExecutionCommand {
  constructor(
    public readonly executionId: string,
    public readonly fromNode?: string,
    public readonly loadStaticData: boolean = false,
    public readonly userId?: string
  ) {}
}
