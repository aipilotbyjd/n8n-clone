import { ExecutionStatus } from './execution-status.type';

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId?: string;
  status: ExecutionStatus;
  mode: WorkflowExecutionMode;
  source: WorkflowExecutionSource;
  data: WorkflowExecutionData;
  metadata: WorkflowExecutionMetadata;
  createdAt: Date;
  startedAt?: Date;
  stoppedAt?: Date;
  finishedAt?: Date;
}

export enum WorkflowExecutionMode {
  MANUAL = 'manual',
  TRIGGER = 'trigger',
  WEBHOOK = 'webhook',
  RETRY = 'retry',
  TEST = 'test',
}

export enum WorkflowExecutionSource {
  EDITOR = 'editor',
  WEBHOOK = 'webhook',
  TRIGGER = 'trigger',
  API = 'api',
  CLI = 'cli',
  INTERNAL = 'internal',
}

export interface WorkflowExecutionData {
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  nodeData?: Record<string, NodeExecutionData>;
  staticData?: Record<string, any>;
}

export interface NodeExecutionData {
  id: string;
  name: string;
  type: string;
  status: ExecutionStatus;
  data: any[];
  error?: {
    message: string;
    stack?: string;
    timestamp: Date;
  };
  startTime?: Date;
  endTime?: Date;
  executionTime?: number;
}

export interface WorkflowExecutionMetadata {
  version?: string;
  environment?: string;
  retryOf?: string;
  parentExecution?: string;
  tags?: string[];
  custom?: Record<string, any>;
}

export interface ExecutionOptions {
  async?: boolean;
  loadStaticData?: boolean;
  runData?: Record<string, any>;
  startNodes?: string[];
  destinationNodes?: string[];
  inputData?: Record<string, any>;
}

export interface WorkflowExecutionSummary {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  mode: WorkflowExecutionMode;
  source: WorkflowExecutionSource;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  executionTime?: number;
  nodeCount: number;
  successfulNodes: number;
  failedNodes: number;
}
