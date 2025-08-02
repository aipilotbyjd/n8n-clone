import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkflowSchema } from '../schemas/workflow.schema';
import { Workflow } from '@n8n-clone/domain-workflow';
import { WorkflowId } from '@n8n-clone/domain-workflow';
import { IWorkflowRepository } from '@n8n-clone/domain-workflow';

@Injectable()
export class TypeOrmWorkflowRepository implements IWorkflowRepository {
  constructor(
    @InjectRepository(WorkflowSchema)
    private readonly workflowRepo: Repository<WorkflowSchema>,
    private readonly workflowMapper: WorkflowMapper
  ) {}

  async findById(id: WorkflowId): Promise<Workflow | null> {
    const workflowData = await this.workflowRepo.findOne({
      where: { id: id.value },
      relations: ['nodes', 'connections']
    });
    return workflowData ? this.workflowMapper.toDomain(workflowData) : null;
  }

  async findByUserId(userId: string): Promise<Workflow[]> {
    const workflowsData = await this.workflowRepo.find({
      where: { userId },
      relations: ['nodes', 'connections'],
      order: { updatedAt: 'DESC' }
    });
    return workflowsData.map(data => this.workflowMapper.toDomain(data));
  }

  async save(workflow: Workflow): Promise<void> {
    const workflowData = this.workflowMapper.toPersistence(workflow);
    await this.workflowRepo.save(workflowData);
  }

  async delete(id: WorkflowId): Promise<void> {
    await this.workflowRepo.delete(id.value);
  }

  async findActiveWorkflows(): Promise<Workflow[]> {
    const workflowsData = await this.workflowRepo.find({
      where: { active: true },
      relations: ['nodes', 'connections']
    });
    return workflowsData.map(data => this.workflowMapper.toDomain(data));
  }

  async updateStatus(id: WorkflowId, active: boolean): Promise<void> {
    await this.workflowRepo.update(id.value, { active });
  }
}

// Domain-to-persistence mapper
@Injectable()
export class WorkflowMapper {
  toDomain(schema: WorkflowSchema): Workflow {
    // Convert database schema to domain entity
    // Implementation would map fields appropriately
    return new Workflow(
      new WorkflowId(schema.id),
      schema.name,
      schema.description,
      schema.userId,
      schema.nodes || [],
      schema.connections || [],
      schema.settings || {},
      schema.version,
      schema.active,
      schema.createdAt,
      schema.updatedAt
    );
  }

  toPersistence(workflow: Workflow): Partial<WorkflowSchema> {
    // Convert domain entity to database schema
    return {
      id: workflow.id.value,
      name: workflow.name,
      description: workflow.description,
      userId: workflow.userId,
      active: workflow.active,
      settings: workflow.settings,
      version: workflow.version,
      // nodes and connections would be handled separately
    };
  }
}
