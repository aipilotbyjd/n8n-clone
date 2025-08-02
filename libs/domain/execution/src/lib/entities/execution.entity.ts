import { ExecutionId } from '../value-objects/execution-id.vo';
import { ExecutionStatus, ExecutionMode, isExecutionFinished } from '../value-objects/execution-status.vo';

// Temporary WorkflowId class until we can import from workflow domain
export class WorkflowId {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('WorkflowId cannot be empty');
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  static fromString(value: string): WorkflowId {
    return new WorkflowId(value);
  }
}

export interface ExecutionData {
  [key: string]: any;
}

export interface ExecutionStep {
  nodeId: string;
  nodeName: string;
  startedAt: Date;
  finishedAt?: Date;
  status: ExecutionStatus;
  data?: ExecutionData;
  error?: string;
  executionTime?: number;
}

export interface ExecutionMetrics {
  totalExecutionTime: number;
  nodeCount: number;
  successfulNodes: number;
  failedNodes: number;
  dataProcessed: number;
}

export class WorkflowExecution {
  constructor(
    private readonly _id: ExecutionId,
    private readonly _workflowId: WorkflowId,
    private _status: ExecutionStatus,
    private readonly _mode: ExecutionMode,
    private readonly _startedAt: Date,
    private _finishedAt?: Date,
    private _steps: ExecutionStep[] = [],
    private _input?: ExecutionData,
    private _output?: ExecutionData,
    private _error?: string,
    private readonly _userId?: string,
    private readonly _workflowName?: string,
    private _retryCount: number = 0,
    private _maxRetries: number = 0
  ) { }

  // Getters
  get id(): ExecutionId {
    return this._id;
  }

  get workflowId(): WorkflowId {
    return this._workflowId;
  }

  get status(): ExecutionStatus {
    return this._status;
  }

  get mode(): ExecutionMode {
    return this._mode;
  }

  get startedAt(): Date {
    return this._startedAt;
  }

  get finishedAt(): Date | undefined {
    return this._finishedAt;
  }

  get steps(): ExecutionStep[] {
    return [...this._steps];
  }

  get input(): ExecutionData | undefined {
    return this._input ? { ...this._input } : undefined;
  }

  get output(): ExecutionData | undefined {
    return this._output ? { ...this._output } : undefined;
  }

  get error(): string | undefined {
    return this._error;
  }

  get userId(): string | undefined {
    return this._userId;
  }

  get workflowName(): string | undefined {
    return this._workflowName;
  }

  get retryCount(): number {
    return this._retryCount;
  }

  get maxRetries(): number {
    return this._maxRetries;
  }

  get duration(): number | undefined {
    if (!this._finishedAt) return undefined;
    return this._finishedAt.getTime() - this._startedAt.getTime();
  }

  get isFinished(): boolean {
    return isExecutionFinished(this._status);
  }

  get isRunning(): boolean {
    return this._status === ExecutionStatus.RUNNING;
  }

  get isSuccessful(): boolean {
    return this._status === ExecutionStatus.SUCCESS || this._status === ExecutionStatus.WARNING;
  }

  get isFailed(): boolean {
    return this._status === ExecutionStatus.ERROR;
  }

  get canRetry(): boolean {
    return this.isFailed && this._retryCount < this._maxRetries;
  }

  // Business methods
  start(): WorkflowExecution {
    if (this._status !== ExecutionStatus.WAITING) {
      throw new Error(`Cannot start execution with status: ${this._status}`);
    }

    return new WorkflowExecution(
      this._id,
      this._workflowId,
      ExecutionStatus.RUNNING,
      this._mode,
      this._startedAt,
      this._finishedAt,
      this._steps,
      this._input,
      this._output,
      this._error,
      this._userId,
      this._workflowName,
      this._retryCount,
      this._maxRetries
    );
  }

  finish(status: ExecutionStatus, output?: ExecutionData, error?: string): WorkflowExecution {
    if (!isExecutionFinished(status)) {
      throw new Error(`Cannot finish execution with non-final status: ${status}`);
    }

    return new WorkflowExecution(
      this._id,
      this._workflowId,
      status,
      this._mode,
      this._startedAt,
      new Date(),
      this._steps,
      this._input,
      output || this._output,
      error || this._error,
      this._userId,
      this._workflowName,
      this._retryCount,
      this._maxRetries
    );
  }

  addStep(step: ExecutionStep): WorkflowExecution {
    const updatedSteps = [...this._steps, step];

    return new WorkflowExecution(
      this._id,
      this._workflowId,
      this._status,
      this._mode,
      this._startedAt,
      this._finishedAt,
      updatedSteps,
      this._input,
      this._output,
      this._error,
      this._userId,
      this._workflowName,
      this._retryCount,
      this._maxRetries
    );
  }

  updateStep(nodeId: string, updates: Partial<ExecutionStep>): WorkflowExecution {
    const stepIndex = this._steps.findIndex(step => step.nodeId === nodeId);
    if (stepIndex === -1) {
      throw new Error(`Step for node ${nodeId} not found`);
    }

    const updatedSteps = [...this._steps];
    updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], ...updates };

    return new WorkflowExecution(
      this._id,
      this._workflowId,
      this._status,
      this._mode,
      this._startedAt,
      this._finishedAt,
      updatedSteps,
      this._input,
      this._output,
      this._error,
      this._userId,
      this._workflowName,
      this._retryCount,
      this._maxRetries
    );
  }

  cancel(): WorkflowExecution {
    if (this.isFinished) {
      throw new Error('Cannot cancel a finished execution');
    }

    return new WorkflowExecution(
      this._id,
      this._workflowId,
      ExecutionStatus.CANCELED,
      this._mode,
      this._startedAt,
      new Date(),
      this._steps,
      this._input,
      this._output,
      'Execution was canceled',
      this._userId,
      this._workflowName,
      this._retryCount,
      this._maxRetries
    );
  }

  retry(): WorkflowExecution {
    if (!this.canRetry) {
      throw new Error('Execution cannot be retried');
    }

    return new WorkflowExecution(
      ExecutionId.generate(), // New execution ID for retry
      this._workflowId,
      ExecutionStatus.WAITING,
      ExecutionMode.RETRY,
      new Date(),
      undefined,
      [],
      this._input,
      undefined,
      undefined,
      this._userId,
      this._workflowName,
      this._retryCount + 1,
      this._maxRetries
    );
  }

  getMetrics(): ExecutionMetrics {
    const nodeCount = this._steps.length;
    const successfulNodes = this._steps.filter(step => step.status === ExecutionStatus.SUCCESS).length;
    const failedNodes = this._steps.filter(step => step.status === ExecutionStatus.ERROR).length;
    const totalExecutionTime = this.duration || 0;
    const dataProcessed = this._steps.reduce((total, step) => {
      return total + (step.data ? JSON.stringify(step.data).length : 0);
    }, 0);

    return {
      totalExecutionTime,
      nodeCount,
      successfulNodes,
      failedNodes,
      dataProcessed
    };
  }

  getStep(nodeId: string): ExecutionStep | undefined {
    return this._steps.find(step => step.nodeId === nodeId);
  }

  getFailedSteps(): ExecutionStep[] {
    return this._steps.filter(step => step.status === ExecutionStatus.ERROR);
  }

  getSuccessfulSteps(): ExecutionStep[] {
    return this._steps.filter(step => step.status === ExecutionStatus.SUCCESS);
  }

  // Static factory methods
  static create(
    workflowId: WorkflowId,
    mode: ExecutionMode,
    input?: ExecutionData,
    userId?: string,
    workflowName?: string,
    maxRetries: number = 0
  ): WorkflowExecution {
    return new WorkflowExecution(
      ExecutionId.generate(),
      workflowId,
      ExecutionStatus.WAITING,
      mode,
      new Date(),
      undefined,
      [],
      input,
      undefined,
      undefined,
      userId,
      workflowName,
      0,
      maxRetries
    );
  }

  static fromData(data: {
    id: string;
    workflowId: string;
    status: ExecutionStatus;
    mode: ExecutionMode;
    startedAt: Date;
    finishedAt?: Date;
    steps?: ExecutionStep[];
    input?: ExecutionData;
    output?: ExecutionData;
    error?: string;
    userId?: string;
    workflowName?: string;
    retryCount?: number;
    maxRetries?: number;
  }): WorkflowExecution {
    return new WorkflowExecution(
      ExecutionId.fromString(data.id),
      WorkflowId.fromString(data.workflowId),
      data.status,
      data.mode,
      data.startedAt,
      data.finishedAt,
      data.steps || [],
      data.input,
      data.output,
      data.error,
      data.userId,
      data.workflowName,
      data.retryCount || 0,
      data.maxRetries || 0
    );
  }
}
