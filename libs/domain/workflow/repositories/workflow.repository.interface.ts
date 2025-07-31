import { WorkflowId } from '../value-objects/workflow-id.vo';
import { Workflow } from '../entities/workflow.entity';

export interface IWorkflowRepository {
  findById(id: WorkflowId): Promise<Workflow | null>;
  findByUserId(userId: string): Promise<Workflow[]>;
  findActiveWorkflows(): Promise<Workflow[]>;
  save(workflow: Workflow): Promise<void>;
  update(workflow: Workflow): Promise<void>;
  delete(id: WorkflowId): Promise<void>;
  findByName(name: string, userId: string): Promise<Workflow | null>;
  findWithTags(tags: string[], userId: string): Promise<Workflow[]>;
}
