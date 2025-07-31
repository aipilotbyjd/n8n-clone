import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreateWorkflowDto, CreateWorkflowResponseWithValidationDto } from '@n8n-clone/application-workflow';
import { WorkflowService } from './workflow.service';

@Controller('workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  async create(@Body() createWorkflowDto: CreateWorkflowDto): Promise<CreateWorkflowResponseWithValidationDto> {
    return this.workflowService.create(createWorkflowDto);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.workflowService.findById(id);
  }
}

