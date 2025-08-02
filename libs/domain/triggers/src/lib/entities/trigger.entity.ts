import { AggregateRoot } from '@n8n-clone/domain/core';

export enum TriggerType {
  WEBHOOK = 'webhook',
  CRON = 'cron',
  INTERVAL = 'interval',
  POLLING = 'polling',
  EMAIL = 'email',
  FILE_WATCHER = 'file-watcher',
  MANUAL = 'manual',
}

export enum TriggerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  PAUSED = 'paused',
}

export class Trigger extends AggregateRoot {
  private _workflowId: string;
  private _type: TriggerType;
  private _name: string;
  private _configuration: Record<string, any>;
  private _status: TriggerStatus;
  private _lastTriggered?: Date;
  private _nextTrigger?: Date;
  private _triggerCount: number;
  private _errorMessage?: string;

  constructor(
    id: string,
    workflowId: string,
    type: TriggerType,
    name: string,
    configuration: Record<string, any>,
    status: TriggerStatus = TriggerStatus.INACTIVE,
    triggerCount: number = 0,
  ) {
    super(id);
    this._workflowId = workflowId;
    this._type = type;
    this._name = name;
    this._configuration = configuration;
    this._status = status;
    this._triggerCount = triggerCount;
    this.validateInvariants();
  }

  get workflowId(): string {
    return this._workflowId;
  }

  get type(): TriggerType {
    return this._type;
  }

  get name(): string {
    return this._name;
  }

  get configuration(): Record<string, any> {
    return { ...this._configuration };
  }

  get status(): TriggerStatus {
    return this._status;
  }

  get lastTriggered(): Date | undefined {
    return this._lastTriggered;
  }

  get nextTrigger(): Date | undefined {
    return this._nextTrigger;
  }

  get triggerCount(): number {
    return this._triggerCount;
  }

  get errorMessage(): string | undefined {
    return this._errorMessage;
  }

  activate(): void {
    if (this._status === TriggerStatus.ERROR) {
      throw new Error('Cannot activate trigger with error status. Fix the error first.');
    }
    this._status = TriggerStatus.ACTIVE;
    this._errorMessage = undefined;
    this.calculateNextTrigger();
    this.touch();
  }

  deactivate(): void {
    this._status = TriggerStatus.INACTIVE;
    this._nextTrigger = undefined;
    this.touch();
  }

  pause(): void {
    this._status = TriggerStatus.PAUSED;
    this.touch();
  }

  resume(): void {
    if (this._status === TriggerStatus.PAUSED) {
      this._status = TriggerStatus.ACTIVE;
      this.calculateNextTrigger();
      this.touch();
    }
  }

  recordTrigger(): void {
    this._lastTriggered = new Date();
    this._triggerCount++;
    this.calculateNextTrigger();
    this.touch();
  }

  recordError(errorMessage: string): void {
    this._status = TriggerStatus.ERROR;
    this._errorMessage = errorMessage;
    this._nextTrigger = undefined;
    this.touch();
  }

  updateConfiguration(configuration: Record<string, any>): void {
    this._configuration = { ...configuration };
    if (this._status === TriggerStatus.ACTIVE) {
      this.calculateNextTrigger();
    }
    this.touch();
  }

  rename(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Trigger name cannot be empty');
    }
    this._name = newName.trim();
    this.touch();
  }

  private validateInvariants(): void {
    if (!this._workflowId) {
      throw new Error('Workflow ID is required');
    }

    if (!this._name || this._name.trim().length === 0) {
      throw new Error('Trigger name is required');
    }

    if (this._name.length > 100) {
      throw new Error('Trigger name cannot exceed 100 characters');
    }

    if (!this._configuration) {
      throw new Error('Trigger configuration is required');
    }
  }

  private calculateNextTrigger(): void {
    if (this._status !== TriggerStatus.ACTIVE) {
      this._nextTrigger = undefined;
      return;
    }

    switch (this._type) {
      case TriggerType.CRON:
        this.calculateCronNextTrigger();
        break;
      case TriggerType.INTERVAL:
        this.calculateIntervalNextTrigger();
        break;
      case TriggerType.POLLING:
        this.calculatePollingNextTrigger();
        break;
      default:
        this._nextTrigger = undefined;
    }
  }

  private calculateCronNextTrigger(): void {
    const cronExpression = this._configuration['cronExpression'];
    if (cronExpression) {
      // This would use a cron library like node-cron to calculate next execution
      // For now, we'll set it to 1 hour from now as a placeholder
      this._nextTrigger = new Date(Date.now() + 60 * 60 * 1000);
    }
  }

  private calculateIntervalNextTrigger(): void {
    const intervalMinutes = this._configuration['intervalMinutes'] || 60;
    this._nextTrigger = new Date(Date.now() + intervalMinutes * 60 * 1000);
  }

  private calculatePollingNextTrigger(): void {
    const pollingIntervalMinutes = this._configuration['pollingIntervalMinutes'] || 5;
    this._nextTrigger = new Date(Date.now() + pollingIntervalMinutes * 60 * 1000);
  }

  toJSON() {
    return {
      id: this.id,
      workflowId: this._workflowId,
      type: this._type,
      name: this._name,
      configuration: this._configuration,
      status: this._status,
      lastTriggered: this._lastTriggered,
      nextTrigger: this._nextTrigger,
      triggerCount: this._triggerCount,
      errorMessage: this._errorMessage,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
