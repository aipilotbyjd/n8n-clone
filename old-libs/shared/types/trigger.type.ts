export enum TriggerType {
  WEBHOOK = 'webhook',
  CRON = 'cron',
  INTERVAL = 'interval',
  POLLING = 'polling',
  EMAIL = 'email',
  FILE_WATCHER = 'file-watcher',
  DATABASE_CHANGE = 'database-change',
  MANUAL = 'manual',
}

export enum TriggerStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ERROR = 'error',
  DISABLED = 'disabled',
}

export interface TriggerDefinition {
  id: string;
  workflowId: string;
  nodeId: string;
  type: TriggerType;
  status: TriggerStatus;
  configuration: TriggerConfiguration;
  metadata: TriggerMetadata;
  createdAt: Date;
  updatedAt: Date;
  lastTriggeredAt?: Date;
}

export interface TriggerConfiguration {
  // Common fields
  enabled: boolean;
  
  // Webhook specific
  path?: string;
  httpMethod?: string;
  authentication?: {
    type: 'none' | 'basic' | 'bearer' | 'api-key';
    config?: Record<string, any>;
  };
  
  // Cron specific
  cronExpression?: string;
  timezone?: string;
  
  // Interval specific
  intervalMs?: number;
  
  // Polling specific
  pollingInterval?: number;
  endpoint?: string;
  lastPollData?: any;
  
  // Custom configuration
  parameters?: Record<string, any>;
}

export interface TriggerMetadata {
  userId: string;
  workflowName?: string;
  description?: string;
  tags?: string[];
  executionCount: number;
  lastExecutionStatus?: 'success' | 'error';
  lastError?: {
    message: string;
    timestamp: Date;
  };
}

export interface TriggerEvent {
  triggerId: string;
  workflowId: string;
  data: any;
  metadata: {
    source: string;
    timestamp: Date;
    headers?: Record<string, string>;
    query?: Record<string, any>;
    params?: Record<string, any>;
  };
}

export interface WebhookTriggerConfig extends TriggerConfiguration {
  path: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  responseMode?: 'onReceived' | 'lastNode' | 'responseNode';
  responseData?: string;
  options?: {
    rawBody?: boolean;
    allowedOrigins?: string[];
    timeout?: number;
  };
}

export interface CronTriggerConfig extends TriggerConfiguration {
  cronExpression: string;
  timezone: string;
  executeOnce?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface PollingTriggerConfig extends TriggerConfiguration {
  pollingInterval: number; // in milliseconds
  endpoint: string;
  httpMethod?: 'GET' | 'POST';
  headers?: Record<string, string>;
  queryParams?: Record<string, any>;
  body?: any;
  dataPath?: string; // JSONPath to extract data
  idPath?: string; // Path to unique identifier
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TriggerExecutionResult {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
  executionId?: string;
  duration: number;
  timestamp: Date;
}
