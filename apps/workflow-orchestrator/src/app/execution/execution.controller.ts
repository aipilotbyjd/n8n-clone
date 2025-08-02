import { Controller, Post, Get, Put, Delete, Body, Param, Query, Logger } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { ExecutionStatus } from '@n8n-clone/shared/types';

export interface ExecuteWorkflowDto {
  workflowId: string;
  data?: any;
  userId?: string;
  source?: string;
  async?: boolean;
  options?: {
    loadStaticData?: boolean;
    startNodes?: string[];
    destinationNodes?: string[];
    runData?: Record<string, any>;
  };
}

export interface RetryExecutionDto {
  fromNode?: string;
  loadStaticData?: boolean;
  userId?: string;
}

@Controller('executions')
export class ExecutionController {
  private readonly logger = new Logger(ExecutionController.name);

  constructor(private readonly executionService: ExecutionService) {}

  @Post()
  async executeWorkflow(@Body() dto: ExecuteWorkflowDto) {
    this.logger.log(`Executing workflow: ${dto.workflowId}`);

    const result = await this.executionService.executeWorkflow(
      dto.workflowId,
      dto.data,
      {
        async: dto.async,
        userId: dto.userId,
        source: dto.source
      }
    );

    return {
      success: true,
      data: result
    };
  }

  @Put(':executionId/stop')
  async stopExecution(
    @Param('executionId') executionId: string,
    @Body() body: { userId?: string; reason?: string }
  ) {
    this.logger.log(`Stopping execution: ${executionId}`);

    await this.executionService.stopExecution(executionId, body.userId);

    return {
      success: true,
      message: 'Execution stopped'
    };
  }

  @Post(':executionId/retry')
  async retryExecution(
    @Param('executionId') executionId: string,
    @Body() dto: RetryExecutionDto
  ) {
    this.logger.log(`Retrying execution: ${executionId}`);

    const result = await this.executionService.retryExecution(executionId, dto);

    return {
      success: true,
      data: result
    };
  }

  @Get(':executionId/status')
  async getExecutionStatus(@Param('executionId') executionId: string) {
    const status = await this.executionService.getExecutionStatus(executionId);

    return {
      success: true,
      data: { status }
    };
  }

  @Get(':executionId/context')
  async getExecutionContext(@Param('executionId') executionId: string) {
    const context = await this.executionService.getExecutionContext(executionId);

    return {
      success: true,
      data: context
    };
  }

  @Get('active')
  async getActiveExecutions() {
    const activeExecutions = await this.executionService.getActiveExecutions();

    return {
      success: true,
      data: { executions: activeExecutions }
    };
  }

  @Get()
  async getExecutions(
    @Query('workflowId') workflowId?: string,
    @Query('status') status?: ExecutionStatus,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0
  ) {
    // In a real implementation, this would query the execution history service
    return {
      success: true,
      data: {
        executions: [],
        total: 0,
        limit,
        offset
      }
    };
  }
}
