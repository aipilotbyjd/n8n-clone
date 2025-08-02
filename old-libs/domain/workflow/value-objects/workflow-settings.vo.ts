export interface WorkflowSettingsData {
  timezone?: string;
  saveDataErrorExecution?: 'all' | 'none';
  saveDataSuccessExecution?: 'all' | 'none';
  saveManualExecutions?: boolean;
  callerPolicy?: 'workflowsFromSameOwner' | 'workflowsFromAList' | 'any';
  callerIds?: string[];
  executionTimeout?: number;
  maxExecutionTimeout?: number;
  defaultRetrySettings?: {
    enabled: boolean;
    maxRetries: number;
    waitBetweenRetries: number;
  };
}

export class WorkflowSettings {
  private readonly _data: WorkflowSettingsData;

  constructor(data: WorkflowSettingsData = {}) {
    // Set defaults
    this._data = {
      timezone: data.timezone || 'UTC',
      saveDataErrorExecution: data.saveDataErrorExecution || 'all',
      saveDataSuccessExecution: data.saveDataSuccessExecution || 'all',
      saveManualExecutions: data.saveManualExecutions ?? true,
      callerPolicy: data.callerPolicy || 'workflowsFromSameOwner',
      callerIds: data.callerIds || [],
      executionTimeout: data.executionTimeout || 3600, // 1 hour default
      maxExecutionTimeout: data.maxExecutionTimeout || 7200, // 2 hours max
      defaultRetrySettings: data.defaultRetrySettings || {
        enabled: false,
        maxRetries: 3,
        waitBetweenRetries: 1000
      }
    };

    this.validate();
  }

  private validate(): void {
    if (this._data.executionTimeout && this._data.executionTimeout <= 0) {
      throw new Error('Execution timeout must be greater than 0');
    }

    if (this._data.maxExecutionTimeout && this._data.maxExecutionTimeout <= 0) {
      throw new Error('Max execution timeout must be greater than 0');
    }

    if (
      this._data.executionTimeout &&
      this._data.maxExecutionTimeout &&
      this._data.executionTimeout > this._data.maxExecutionTimeout
    ) {
      throw new Error('Execution timeout cannot be greater than max execution timeout');
    }

    if (this._data.defaultRetrySettings) {
      const { maxRetries, waitBetweenRetries } = this._data.defaultRetrySettings;
      if (maxRetries < 0) {
        throw new Error('Max retries cannot be negative');
      }
      if (waitBetweenRetries < 0) {
        throw new Error('Wait between retries cannot be negative');
      }
    }
  }

  // Getters
  get timezone(): string {
    return this._data.timezone!;
  }

  get saveDataErrorExecution(): 'all' | 'none' {
    return this._data.saveDataErrorExecution!;
  }

  get saveDataSuccessExecution(): 'all' | 'none' {
    return this._data.saveDataSuccessExecution!;
  }

  get saveManualExecutions(): boolean {
    return this._data.saveManualExecutions!;
  }

  get callerPolicy(): 'workflowsFromSameOwner' | 'workflowsFromAList' | 'any' {
    return this._data.callerPolicy!;
  }

  get callerIds(): string[] {
    return [...this._data.callerIds!];
  }

  get executionTimeout(): number {
    return this._data.executionTimeout!;
  }

  get maxExecutionTimeout(): number {
    return this._data.maxExecutionTimeout!;
  }

  get defaultRetrySettings() {
    return { ...this._data.defaultRetrySettings! };
  }

  // Business methods
  updateTimezone(timezone: string): WorkflowSettings {
    return new WorkflowSettings({
      ...this._data,
      timezone
    });
  }

  updateExecutionTimeout(timeout: number): WorkflowSettings {
    return new WorkflowSettings({
      ...this._data,
      executionTimeout: timeout
    });
  }

  enableDataSaving(): WorkflowSettings {
    return new WorkflowSettings({
      ...this._data,
      saveDataErrorExecution: 'all',
      saveDataSuccessExecution: 'all',
      saveManualExecutions: true
    });
  }

  disableDataSaving(): WorkflowSettings {
    return new WorkflowSettings({
      ...this._data,
      saveDataErrorExecution: 'none',
      saveDataSuccessExecution: 'none',
      saveManualExecutions: false
    });
  }

  allowAnyCallers(): WorkflowSettings {
    return new WorkflowSettings({
      ...this._data,
      callerPolicy: 'any',
      callerIds: []
    });
  }

  restrictToOwnerWorkflows(): WorkflowSettings {
    return new WorkflowSettings({
      ...this._data,
      callerPolicy: 'workflowsFromSameOwner',
      callerIds: []
    });
  }

  restrictToSpecificWorkflows(workflowIds: string[]): WorkflowSettings {
    return new WorkflowSettings({
      ...this._data,
      callerPolicy: 'workflowsFromAList',
      callerIds: [...workflowIds]
    });
  }

  enableRetries(maxRetries: number = 3, waitBetweenRetries: number = 1000): WorkflowSettings {
    return new WorkflowSettings({
      ...this._data,
      defaultRetrySettings: {
        enabled: true,
        maxRetries,
        waitBetweenRetries
      }
    });
  }

  disableRetries(): WorkflowSettings {
    return new WorkflowSettings({
      ...this._data,
      defaultRetrySettings: {
        enabled: false,
        maxRetries: 0,
        waitBetweenRetries: 0
      }
    });
  }

  toJSON(): WorkflowSettingsData {
    return { ...this._data };
  }

  // Static factory methods
  static default(): WorkflowSettings {
    return new WorkflowSettings();
  }

  static fromJSON(data: WorkflowSettingsData): WorkflowSettings {
    return new WorkflowSettings(data);
  }
}
