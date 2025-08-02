import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IWorkflowRepository, Workflow as WorkflowDomain, WorkflowId, Node, Connection, WorkflowSettings, NodeId, NodePosition } from '@n8n-clone/domain-workflow';
import { Workflow as WorkflowEntity } from '../database/entities/workflow.entity';

@Injectable()
export class WorkflowRepository implements IWorkflowRepository {
  constructor(
    @InjectRepository(WorkflowEntity)
    private readonly workflowRepository: Repository<WorkflowEntity>
  ) {}

  async findById(id: WorkflowId): Promise<WorkflowDomain | null> {
    const entity = await this.workflowRepository.findOne({
      where: { id: id.value }
    });

    return entity ? this.toDomain(entity) : null;
  }

  async save(workflow: WorkflowDomain): Promise<void> {
    const entity = this.toEntity(workflow);
    await this.workflowRepository.save(entity);
  }

  async delete(id: WorkflowId): Promise<void> {
    await this.workflowRepository.delete({ id: id.value });
  }

  async findByUserId(userId: string): Promise<WorkflowDomain[]> {
    const entities = await this.workflowRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' }
    });

    return entities.map(entity => this.toDomain(entity));
  }

  async findActiveWorkflows(): Promise<WorkflowDomain[]> {
    const entities = await this.workflowRepository.find({
      where: { active: true },
      order: { updatedAt: 'DESC' }
    });

    return entities.map(entity => this.toDomain(entity));
  }

  async findByName(name: string, userId: string): Promise<WorkflowDomain | null> {
    const entity = await this.workflowRepository.findOne({
      where: {
        name,
        userId
      }
    });

    return entity ? this.toDomain(entity) : null;
  }

  async update(workflow: WorkflowDomain): Promise<void> {
    const entity = this.toEntity(workflow);
    await this.workflowRepository.save(entity);
  }

  async findWithTags(tags: string[], userId: string): Promise<WorkflowDomain[]> {
    const queryBuilder = this.workflowRepository.createQueryBuilder('workflow')
      .where('workflow.userId = :userId', { userId })
      .andWhere('workflow.tags && :tags', { tags });

    const entities = await queryBuilder.getMany();
    return entities.map(entity => this.toDomain(entity));
  }

  async count(): Promise<number> {
    return this.workflowRepository.count();
  }

  async countByUser(userId: string): Promise<number> {
    return this.workflowRepository.count({ where: { userId } });
  }

  async updateExecutionMetadata(
    id: WorkflowId, 
    executionCount: number,
    lastExecutionAt: Date,
    lastExecutionStatus: string
  ): Promise<void> {
    await this.workflowRepository.update(
      { id: id.value },
      {
        executionCount,
        lastExecutionAt,
        lastExecutionStatus
      }
    );
  }

  private toDomain(entity: WorkflowEntity): WorkflowDomain {
    const nodes = entity.nodes.map(nodeData => 
      new Node(
        NodeId.fromString(nodeData.id),
        nodeData.name,
        nodeData.type,
        NodePosition.fromObject(nodeData.position),
        nodeData.parameters || {},
        nodeData.disabled || false,
        nodeData.notes || '',
        nodeData.webhookId,
        nodeData.continueOnFail || false,
        nodeData.alwaysOutputData || false,
        nodeData.executeOnce || false,
        nodeData.retryOnFail || false,
        nodeData.maxTries || 3,
        nodeData.waitBetweenTries || 1000
      )
    );

    const connections = entity.connections.map(connData =>
      new Connection(
        connData.sourceNodeId,
        connData.targetNodeId,
        connData.sourceOutput || 'main',
        connData.targetInput || 'main',
        connData.type || 'main'
      )
    );

    const settings = new WorkflowSettings(entity.settings || {});

    return new WorkflowDomain(
      WorkflowId.fromString(entity.id),
      entity.name,
      entity.description || '',
      nodes,
      connections,
      settings,
      entity.version,
      entity.active,
      entity.tags || [],
      entity.createdAt,
      entity.updatedAt,
      entity.userId
    );
  }

  private toEntity(domain: WorkflowDomain): WorkflowEntity {
    const entity = new WorkflowEntity();
    entity.id = domain.id.value;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.userId = domain.createdBy;
    entity.active = domain.active;
    entity.tags = domain.tags;
    entity.settings = domain.settings.toJSON();
    entity.version = domain.version;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;

    // Convert nodes to JSON
    entity.nodes = domain.nodes.map(node => ({
      id: node.id.value,
      name: node.name,
      type: node.type,
      position: node.position.toObject(),
      parameters: node.parameters,
      disabled: node.disabled,
      notes: node.notes,
      webhookId: node.webhookId,
      continueOnFail: node.continueOnFail,
      alwaysOutputData: node.alwaysOutputData,
      executeOnce: node.executeOnce,
      retryOnFail: node.retryOnFail,
      maxTries: node.maxTries,
      waitBetweenTries: node.waitBetweenTries
    }));

    // Convert connections to JSON
    entity.connections = domain.connections.map(conn => ({
      sourceNodeId: conn.sourceNodeId,
      targetNodeId: conn.targetNodeId,
      sourceOutput: conn.sourceOutput,
      targetInput: conn.targetInput,
      type: conn.type
    }));

    return entity;
  }
}
