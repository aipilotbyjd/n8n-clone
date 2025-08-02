export enum ExecutionStatus {
  // Pending states
  WAITING = 'waiting',
  QUEUED = 'queued',
  
  // Active states
  RUNNING = 'running',
  PAUSED = 'paused',
  
  // Terminal states
  SUCCESS = 'success',
  ERROR = 'error',
  CANCELED = 'canceled',
  CRASHED = 'crashed',
  
  // Special states
  UNKNOWN = 'unknown',
  WARNING = 'warning',
  TIMEOUT = 'timeout',
}

export interface ExecutionStatusInfo {
  status: ExecutionStatus;
  message?: string;
  startedAt?: Date;
  stoppedAt?: Date;
  finishedAt?: Date;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  progress?: {
    completed: number;
    total: number;
  };
}

export const TERMINAL_EXECUTION_STATUSES = [
  ExecutionStatus.SUCCESS,
  ExecutionStatus.ERROR,
  ExecutionStatus.CANCELED,
  ExecutionStatus.CRASHED,
  ExecutionStatus.TIMEOUT,
] as const;

export const ACTIVE_EXECUTION_STATUSES = [
  ExecutionStatus.RUNNING,
  ExecutionStatus.PAUSED,
] as const;

export function isTerminalStatus(status: ExecutionStatus): boolean {
  return TERMINAL_EXECUTION_STATUSES.includes(status as any);
}

export function isActiveStatus(status: ExecutionStatus): boolean {
  return ACTIVE_EXECUTION_STATUSES.includes(status as any);
}
