import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateWorkflowCommand } from '../create-workflow.command';
import { WorkflowService } from '@n8n-clone/domain/workflow';
import { Workflow } from '@n8n-clone/shared/types';
import { v4 as uuidv4 } from 'uuid';

@CommandHandler(CreateWorkflowCommand)
export class CreateWorkflowHandler implements ICommandHandler<CreateWorkflowCommand> {
  constructor(private readonly workflowService: WorkflowService) {}

  async execute(command: CreateWorkflowCommand): Promise<string> {
    const workflow: Workflow = {
      id: uuidv4(),
      name: command.name,
      nodes: command.nodes,
      triggerNodeId: command.triggerNodeId,
      active: command.active,
    };

    this.workflowService.create(workflow);
    return workflow.id;
  }
}
