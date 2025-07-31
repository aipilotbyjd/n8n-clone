import { Controller, Get, Post, Put, Delete, Body, Param, Query, Logger, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

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
    private readonly httpService: HttpService
  ) {}

  @Post()
  async createWorkflow(@Body() dto: CreateWorkflowDto) {
    this.logger.log(`Creating workflow: ${dto.name}`);

    try {
      // Route to workflow service
      const response = await this.httpService.axiosRef.post(
        `${process.env.WORKFLOW_SERVICE_URL}/workflows`,
        dto
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      this.logger.error('Failed to create workflow:', error);
      throw error;
    }
  }

  @Get()
  async getWorkflows(
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
    @Query('tags') tags?: string,
    @Query('active') active?: boolean
  ) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(tags && { tags }),
        ...(active !== undefined && { active: active.toString() })
      });

      const response = await this.httpService.axiosRef.get(
        `${process.env.WORKFLOW_SERVICE_URL}/workflows?${params}`
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      this.logger.error('Failed to get workflows:', error);
      throw error;
    }
  }

  @Get(':workflowId')
  async getWorkflow(@Param('workflowId') workflowId: string) {
    try {
      const response = await this.httpService.axiosRef.get(
        `${process.env.WORKFLOW_SERVICE_URL}/workflows/${workflowId}`
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      this.logger.error(`Failed to get workflow ${workflowId}:`, error);
      throw error;
    }
  }

  @Put(':workflowId')
  async updateWorkflow(
    @Param('workflowId') workflowId: string,
    @Body() dto: UpdateWorkflowDto
  ) {
    this.logger.log(`Updating workflow: ${workflowId}`);

    try {
      const response = await this.httpService.axiosRef.put(
        `${process.env.WORKFLOW_SERVICE_URL}/workflows/${workflowId}`,
        dto
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      this.logger.error(`Failed to update workflow ${workflowId}:`, error);
      throw error;
    }
  }

  @Delete(':workflowId')
  async deleteWorkflow(@Param('workflowId') workflowId: string) {
    this.logger.log(`Deleting workflow: ${workflowId}`);

    try {
      await this.httpService.axiosRef.delete(
        `${process.env.WORKFLOW_SERVICE_URL}/workflows/${workflowId}`
      );

      return {
        success: true,
        message: 'Workflow deleted successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to delete workflow ${workflowId}:`, error);
      throw error;
    }
  }

  @Put(':workflowId/activate')
  async activateWorkflow(@Param('workflowId') workflowId: string) {
    this.logger.log(`Activating workflow: ${workflowId}`);

    try {
      const response = await this.httpService.axiosRef.put(
        `${process.env.WORKFLOW_SERVICE_URL}/workflows/${workflowId}/activate`
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      this.logger.error(`Failed to activate workflow ${workflowId}:`, error);
      throw error;
    }
  }

  @Put(':workflowId/deactivate')
  async deactivateWorkflow(@Param('workflowId') workflowId: string) {
    this.logger.log(`Deactivating workflow: ${workflowId}`);

    try {
      const response = await this.httpService.axiosRef.put(
        `${process.env.WORKFLOW_SERVICE_URL}/workflows/${workflowId}/deactivate`
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      this.logger.error(`Failed to deactivate workflow ${workflowId}:`, error);
      throw error;
    }
  }

  @Post(':workflowId/execute')
  async executeWorkflow(
    @Param('workflowId') workflowId: string,
    @Body() dto: ExecuteWorkflowDto
  ) {
    this.logger.log(`Executing workflow: ${workflowId}`);

    try {
      const response = await this.httpService.axiosRef.post(
        `${process.env.WORKFLOW_ORCHESTRATOR_URL}/executions`,
        {
          workflowId,
          ...dto
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      this.logger.error(`Failed to execute workflow ${workflowId}:`, error);
      throw error;
    }
  }

  @Get(':workflowId/executions')
  async getWorkflowExecutions(
    @Param('workflowId') workflowId: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    try {
      const params = new URLSearchParams({
        workflowId,
        limit: limit.toString(),
        offset: offset.toString()
      });

      const response = await this.httpService.axiosRef.get(
        `${process.env.EXECUTION_HISTORY_URL}/executions?${params}`
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      this.logger.error(`Failed to get executions for workflow ${workflowId}:`, error);
      throw error;
    }
  }
}
