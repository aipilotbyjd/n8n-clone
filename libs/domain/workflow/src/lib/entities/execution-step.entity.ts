import { Node } from './node.entity';

export class ExecutionStep {
  constructor(
    private readonly _id: string,
    private readonly _nodeId: string,
    private readonly _node: Node,
    private readonly _input: any,
    private _output: any = null,
    private _status: ExecutionStepStatus = ExecutionStepStatus.PENDING,
    private _error: Error | null = null,
    private readonly _startedAt: Date = new Date(),
    private _completedAt: Date | null = null
  ) {}

  start(): void {
    this._status = ExecutionStepStatus.RUNNING;
  }

  complete(output: any): void {
    this._output = output;
    this._status = ExecutionStepStatus.COMPLETED;
    this._completedAt = new Date();
  }

  fail(error: Error): void {
    this._error = error;
    this._status = ExecutionStepStatus.FAILED;
    this._completedAt = new Date();
  }

  // Getters
  get id(): string { return this._id; }
  get nodeId(): string { return this._nodeId; }
  get node(): Node { return this._node; }
  get input(): any { return this._input; }
  get output(): any { return this._output; }
  get status(): ExecutionStepStatus { return this._status; }
  get error(): Error | null { return this._error; }
  get startedAt(): Date { return this._startedAt; }
  get completedAt(): Date | null { return this._completedAt; }
}

export enum ExecutionStepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}
