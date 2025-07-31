import { Injectable, Inject } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateWorkflowDto, CreateWorkflowResponseWithValidationDto, CreateWorkflowCommand } from '@n8n-clone/application-workflow';
import { IWorkflowRepository, WorkflowId } from '@n8n-clone/domain-workflow';

@Injectable()
export class WorkflowService {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject('IWorkflowRepository') private readonly workflowRepository: IWorkflowRepository
  ) {}

  async create(createWorkflowDto: CreateWorkflowDto): Promise<CreateWorkflowResponseWithValidationDto> {
    const command = new CreateWorkflowCommand(createWorkflowDto);
    return this.commandBus.execute(command);
  }

  async findById(id: string) {
    const workflowId = WorkflowId.fromString(id);
    const workflow = await this.workflowRepository.findById(workflowId);
    
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    return {
      id: workflow.id.value,
      name: workflow.name,
      description: workflow.description,
      nodes: workflow.nodes.map(node => ({
        id: node.id.value,
        name: node.name,
        type: node.type,
        position: node.position.toObject(),
        parameters: node.parameters,
        disabled: node.disabled,
        notes: node.notes
      })),
      connections: workflow.connections.map(conn => ({
        sourceNodeId: conn.sourceNodeId,
        targetNodeId: conn.targetNodeId,
        sourceOutput: conn.sourceOutput,
        targetInput: conn.targetInput,
        type: conn.type
      })),
      settings: workflow.settings.toJSON(),
      version: workflow.version,
      active: workflow.active,
      tags: workflow.tags,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      createdBy: workflow.createdBy
    };
  }
}
