import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetWorkflowByIdQuery } from '../get-workflow-by-id.query';
import { WorkflowService } from '@n8n-clone/domain/workflow';
import { Workflow } from '@n8n-clone/shared/types';

@QueryHandler(GetWorkflowByIdQuery)
export class GetWorkflowByIdHandler implements IQueryHandler<GetWorkflowByIdQuery> {
  constructor(private readonly workflowService: WorkflowService) {}

  async execute(query: GetWorkflowByIdQuery): Promise<Workflow | undefined> {
    return this.workflowService.getById(query.id);
  }
}
