export interface Node {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
  credentials?: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  nodes: Node[];
  active: boolean;
  triggerNodeId: string;
}

export interface Execution {
  workflowId: string;
  data: any;
  startTime: Date;
  endTime?: Date;
}

// Execution Status
export enum ExecutionStatus {
  WAITING = 'waiting',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  CANCELED = 'canceled', // alias for consistency
  PAUSED = 'paused',
  ERROR = 'error'
}

// Workflow Execution
export enum WorkflowExecutionMode {
  MANUAL = 'manual',
  TRIGGER = 'trigger',
  WEBHOOK = 'webhook',
  SCHEDULED = 'scheduled',
  RETRY = 'retry',
  TEST = 'test'
}

export enum WorkflowExecutionSource {
  MANUAL = 'manual',
  WEBHOOK = 'webhook',
  TRIGGER = 'trigger',
  API = 'api',
  CLI = 'cli',
  INTERNAL = 'internal',
  EDITOR = 'editor'
}

// Trigger Types
export enum TriggerType {
  WEBHOOK = 'webhook',
  CRON = 'cron',
  POLLING = 'polling',
  MANUAL = 'manual'
}

export enum TriggerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error'
}

export interface TriggerDefinition {
  id: string;
  type: TriggerType;
  workflowId: string;
  configuration: Record<string, any>;
  status: TriggerStatus;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TriggerExecutionResult {
  success: boolean;
  data?: any;
  error?: string | { message: string; stack?: string };
  executionId?: string;
  duration?: number;
  timestamp?: Date;
}

export interface TriggerEvent {
  triggerId: string;
  workflowId: string;
  data: any;
  timestamp: Date;
}

// Trigger Configurations
export interface CronTriggerConfig {
  cronExpression: string;
  timezone?: string;
  enabled?: boolean;
}

export interface WebhookTriggerConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  authentication?: {
    type: 'none' | 'basic' | 'header';
    username?: string;
    password?: string;
    headerName?: string;
    headerValue?: string;
  };
}

export interface PollingTriggerConfig {
  intervalMinutes: number;
  endpoint?: string;
  lastPolledAt?: Date;
}
