import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetWorkflowsQuery } from '../get-workflows.query';
import { WorkflowService } from '@n8n-clone/domain/workflow';
import { Workflow } from '@n8n-clone/shared/types';

@QueryHandler(GetWorkflowsQuery)
export class GetWorkflowsHandler implements IQueryHandler<GetWorkflowsQuery> {
  constructor(private readonly workflowService: WorkflowService) {}

  async execute(query: GetWorkflowsQuery): Promise<Workflow[]> {
    return this.workflowService.getAll();
  }
}
