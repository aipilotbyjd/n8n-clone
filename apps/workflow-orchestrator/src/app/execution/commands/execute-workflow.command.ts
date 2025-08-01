export class ExecuteWorkflowCommand {
  constructor(
    public readonly workflowId: string,
    public readonly inputData?: any,
    public readonly userId?: string,
    public readonly source: string = 'manual',
    public readonly async: boolean = false,
    public readonly options?: {
      loadStaticData?: boolean;
      startNodes?: string[];
      destinationNodes?: string[];
      runData?: Record<string, any>;
    }
  ) {}
}
