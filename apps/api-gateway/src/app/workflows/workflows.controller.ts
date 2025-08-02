import { Controller, Get, Post, Put, Delete, Body, Param, Query, Logger, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateWorkflowCommand, GetWorkflowsQuery, GetWorkflowByIdQuery } from '@n8n-clone/application/workflow';
import { ApiSuccessResponse, ApiErrorResponse } from '@n8n-clone/shared/common';
import { Node } from '@n8n-clone/shared/types';

export interface CreateWorkflowDto {
  name: string;
  description?: string;
  nodes: any[];
  connections: any;
  settings?: any;
  tags?: string[];
}

export interface UpdateWorkflowDto {
  name?: string;
  description?: string;
  nodes?: any[];
  connections?: any;
  settings?: any;
  tags?: string[];
  active?: boolean;
}

export interface ExecuteWorkflowDto {
  data?: any;
  async?: boolean;
  source?: string;
}

@Controller('workflows')
export class WorkflowsController {
  private readonly logger = new Logger(WorkflowsController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiSuccessResponse('Workflow created successfully')
  @ApiErrorResponse(400, 'Bad Request')
  async createWorkflow(@Body() dto: CreateWorkflowDto) {
    this.logger.log(`Creating workflow: ${dto.name}`);

    try {
      const nodes: Node[] = dto.nodes.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        parameters: node.parameters || {},
        credentials: node.credentials
      }));

      const workflowId = await this.commandBus.execute(
        new CreateWorkflowCommand(
          dto.name,
          nodes,
          dto.nodes[0]?.id || '', // Assuming first node is trigger
          false
        )
      );

      return {
        success: true,
        message: 'Workflow created successfully',
        data: { id: workflowId },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Failed to create workflow:', error);
      throw error;
    }
  }

  @Get()
  @ApiSuccessResponse('Workflows retrieved successfully')
  async getWorkflows(
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
    @Query('tags') tags?: string,
    @Query('active') active?: boolean
  ) {
    try {
      const workflows = await this.queryBus.execute(new GetWorkflowsQuery());

      return {
        success: true,
        message: 'Workflows retrieved successfully',
        data: workflows,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Failed to get workflows:', error);
      throw error;
    }
  }

  @Get(':workflowId')
  @ApiSuccessResponse('Workflow retrieved successfully')
  @ApiErrorResponse(404, 'Workflow not found')
  async getWorkflow(@Param('workflowId') workflowId: string) {
    try {
      const workflow = await this.queryBus.execute(
        new GetWorkflowByIdQuery(workflowId)
      );

      if (!workflow) {
        return {
          success: false,
          message: 'Workflow not found',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Workflow retrieved successfully',
        data: workflow,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to get workflow ${workflowId}:`, error);
      throw error;
    }
  }

  @Put(':workflowId')
  @ApiSuccessResponse('Workflow updated successfully')
  @ApiErrorResponse(404, 'Workflow not found')
  async updateWorkflow(
    @Param('workflowId') workflowId: string,
    @Body() dto: UpdateWorkflowDto
  ) {
    this.logger.log(`Updating workflow: ${workflowId}`);

    try {
      // TODO: Implement update workflow command
      return {
        success: true,
        message: 'Workflow update feature coming soon',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to update workflow ${workflowId}:`, error);
      throw error;
    }
  }

  @Delete(':workflowId')
  @ApiSuccessResponse('Workflow deleted successfully')
  @ApiErrorResponse(404, 'Workflow not found')
  async deleteWorkflow(@Param('workflowId') workflowId: string) {
    this.logger.log(`Deleting workflow: ${workflowId}`);

    try {
      // TODO: Implement delete workflow command
      return {
        success: true,
        message: 'Workflow delete feature coming soon',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to delete workflow ${workflowId}:`, error);
      throw error;
    }
  }

  @Put(':workflowId/activate')
  @ApiSuccessResponse('Workflow activated successfully')
  @ApiErrorResponse(404, 'Workflow not found')
  async activateWorkflow(@Param('workflowId') workflowId: string) {
    this.logger.log(`Activating workflow: ${workflowId}`);

    try {
      // TODO: Implement activate workflow command
      return {
        success: true,
        message: 'Workflow activation feature coming soon',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to activate workflow ${workflowId}:`, error);
      throw error;
    }
  }

  @Put(':workflowId/deactivate')
  @ApiSuccessResponse('Workflow deactivated successfully')
  @ApiErrorResponse(404, 'Workflow not found')
  async deactivateWorkflow(@Param('workflowId') workflowId: string) {
    this.logger.log(`Deactivating workflow: ${workflowId}`);

    try {
      // TODO: Implement deactivate workflow command
      return {
        success: true,
        message: 'Workflow deactivation feature coming soon',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to deactivate workflow ${workflowId}:`, error);
      throw error;
    }
  }

  @Post(':workflowId/execute')
  @ApiSuccessResponse('Workflow execution started successfully')
  @ApiErrorResponse(404, 'Workflow not found')
  async executeWorkflow(
    @Param('workflowId') workflowId: string,
    @Body() dto: ExecuteWorkflowDto
  ) {
    this.logger.log(`Executing workflow: ${workflowId}`);

    try {
      // TODO: Implement execute workflow command
      return {
        success: true,
        message: 'Workflow execution feature coming soon',
        data: { workflowId, executionId: 'temp-execution-id' },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to execute workflow ${workflowId}:`, error);
      throw error;
    }
  }

  @Get(':workflowId/executions')
  @ApiSuccessResponse('Workflow executions retrieved successfully')
  @ApiErrorResponse(404, 'Workflow not found')
  async getWorkflowExecutions(
    @Param('workflowId') workflowId: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    try {
      // TODO: Implement get workflow executions query
      return {
        success: true,
        message: 'Workflow executions feature coming soon',
        data: [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to get executions for workflow ${workflowId}:`, error);
      throw error;
    }
  }
}
