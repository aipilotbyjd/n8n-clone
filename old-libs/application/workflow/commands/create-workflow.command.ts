import { CreateWorkflowDto } from '../dtos/create-workflow.dto';

export class CreateWorkflowCommand {
  constructor(public readonly data: CreateWorkflowDto) {}
}

export class UpdateWorkflowCommand {
  constructor(
    public readonly workflowId: string,
    public readonly data: Partial<CreateWorkflowDto>
  ) {}
}

export class DeleteWorkflowCommand {
  constructor(public readonly workflowId: string) {}
}

export class ActivateWorkflowCommand {
  constructor(public readonly workflowId: string) {}
}

export class DeactivateWorkflowCommand {
  constructor(public readonly workflowId: string) {}
}

export class DuplicateWorkflowCommand {
  constructor(
    public readonly sourceWorkflowId: string,
    public readonly newName: string,
    public readonly userId: string
  ) {}
}

export class AddNodeToWorkflowCommand {
  constructor(
    public readonly workflowId: string,
    public readonly nodeData: {
      id: string;
      name: string;
      type: string;
      position: { x: number; y: number };
      parameters?: any;
    }
  ) {}
}

export class RemoveNodeFromWorkflowCommand {
  constructor(
    public readonly workflowId: string,
    public readonly nodeId: string
  ) {}
}

export class UpdateNodeInWorkflowCommand {
  constructor(
    public readonly workflowId: string,
    public readonly nodeId: string,
    public readonly updates: {
      name?: string;
      position?: { x: number; y: number };
      parameters?: any;
      disabled?: boolean;
      notes?: string;
    }
  ) {}
}

export class AddConnectionToWorkflowCommand {
  constructor(
    public readonly workflowId: string,
    public readonly connectionData: {
      sourceNodeId: string;
      targetNodeId: string;
      sourceOutput?: string;
      targetInput?: string;
      type?: 'main' | 'ai';
    }
  ) {}
}

export class RemoveConnectionFromWorkflowCommand {
  constructor(
    public readonly workflowId: string,
    public readonly sourceNodeId: string,
    public readonly targetNodeId: string
  ) {}
}
