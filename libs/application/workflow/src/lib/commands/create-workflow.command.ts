import { ICommand } from '@nestjs/cqrs';
import { Node } from '@n8n-clone/shared/types';

export class CreateWorkflowCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly nodes: Node[],
    public readonly triggerNodeId: string,
    public readonly active = false,
  ) {}
}
