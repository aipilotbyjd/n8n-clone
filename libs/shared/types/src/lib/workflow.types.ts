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
