import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { CreateWorkflowCommand } from '../commands/create-workflow.command';
import { CreateWorkflowResponseWithValidationDto } from '../dtos/create-workflow.dto';
import { IWorkflowRepository, Workflow, WorkflowId, Node, Connection, WorkflowSettings, NodeId, NodePosition } from '@n8n-clone/domain-workflow';

@Injectable()
@CommandHandler(CreateWorkflowCommand)
export class CreateWorkflowHandler implements ICommandHandler<CreateWorkflowCommand> {
  constructor(@Inject('IWorkflowRepository') private readonly workflowRepository: IWorkflowRepository) {}

  async execute(command: CreateWorkflowCommand): Promise<CreateWorkflowResponseWithValidationDto> {
    const { data } = command;

    try {
      // Create nodes from DTOs
      const nodes = data.nodes.map(nodeDto => 
        new Node(
          NodeId.fromString(nodeDto.id),
          nodeDto.name,
          nodeDto.type,
          NodePosition.fromObject(nodeDto.position),
          nodeDto.parameters || {},
          nodeDto.disabled || false,
          nodeDto.notes || ''
        )
      );

      // Create connections from DTOs
      const connections = data.connections.map(connDto =>
        new Connection(
          connDto.sourceNodeId,
          connDto.targetNodeId,
          connDto.sourceOutput || 'main',
          connDto.targetInput || 'main',
          connDto.type || 'main'
        )
      );

      // Create workflow settings
      const settings = new WorkflowSettings(data.settings || {});

      // Create the workflow
      const workflow = new Workflow(
        WorkflowId.generate(),
        data.name,
        data.description || '',
        nodes,
        connections,
        settings,
        1, // version
        false, // active
        data.tags || [],
        new Date(), // createdAt
        new Date(), // updatedAt
        data.createdBy
      );

      // Validate the workflow
      const validationResult = workflow.validate();
      
      if (!validationResult.isValid) {
        return {
          success: false,
          errors: validationResult.errors.map(error => ({
            field: 'workflow',
            message: error,
            code: 'VALIDATION_ERROR'
          })),
          warnings: validationResult.warnings
        };
      }

      // Save the workflow
      await this.workflowRepository.save(workflow);

      return {
        success: true,
        data: {
          id: workflow.id.value,
          name: workflow.name,
          description: workflow.description,
          version: workflow.version,
          active: workflow.active,
          createdAt: workflow.createdAt,
          updatedAt: workflow.updatedAt,
          createdBy: workflow.createdBy
        },
        warnings: validationResult.warnings
      };

    } catch (error) {
      return {
        success: false,
        errors: [{
          field: 'workflow',
          message: error.message || 'Failed to create workflow',
          code: 'CREATION_ERROR'
        }]
      };
    }
  }
}
