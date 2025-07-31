export enum ExecutionStatus {
  WAITING = 'waiting',
  RUNNING = 'running',
  SUCCESS = 'success',
  ERROR = 'error',
  CANCELED = 'canceled',
  WARNING = 'warning',
  UNKNOWN = 'unknown'
}

export enum ExecutionMode {
  MANUAL = 'manual',
  TRIGGER = 'trigger',
  WEBHOOK = 'webhook',
  RETRY = 'retry',
  CLI = 'cli',
  INTERNAL = 'internal'
}

export const FINAL_EXECUTION_STATUSES = [
  ExecutionStatus.SUCCESS,
  ExecutionStatus.ERROR,
  ExecutionStatus.CANCELED
];

export const isExecutionFinished = (status: ExecutionStatus): boolean => {
  return FINAL_EXECUTION_STATUSES.includes(status);
};

export const isExecutionSuccessful = (status: ExecutionStatus): boolean => {
  return status === ExecutionStatus.SUCCESS || status === ExecutionStatus.WARNING;
};
