import { Injectable, Logger } from '@nestjs/common';
import { TriggerDefinition, TriggerType, TriggerStatus } from '@n8n-clone/shared/types';

@Injectable()
export class TriggerManagerService {
  private readonly logger = new Logger(TriggerManagerService.name);

  private readonly triggers = new Map<string, TriggerDefinition>();

  constructor() {}

  async registerTrigger(definition: Omit<TriggerDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    this.logger.log(`Registering trigger for workflow ${definition.workflowId}`);

    const triggerId = `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const trigger: TriggerDefinition = {
      ...definition,
      id: triggerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.triggers.set(triggerId, trigger);
    return triggerId;
  }

  async unregisterTrigger(triggerId: string, userId: string): Promise<void> {
    this.logger.log(`Unregistering trigger ${triggerId}`);
    this.triggers.delete(triggerId);
  }

  async activateTrigger(triggerId: string, userId: string): Promise<void> {
    this.logger.log(`Activating trigger ${triggerId}`);
    const trigger = this.triggers.get(triggerId);
    if (trigger) {
      trigger.status = TriggerStatus.ACTIVE;
      trigger.updatedAt = new Date();
    }
  }

  async deactivateTrigger(triggerId: string, userId: string): Promise<void> {
    this.logger.log(`Deactivating trigger ${triggerId}`);
    const trigger = this.triggers.get(triggerId);
    if (trigger) {
      trigger.status = TriggerStatus.INACTIVE;
      trigger.updatedAt = new Date();
    }
  }

  async getTrigger(triggerId: string): Promise<TriggerDefinition | null> {
    return this.triggers.get(triggerId) || null;
  }

  async getWorkflowTriggers(workflowId: string): Promise<TriggerDefinition[]> {
    return Array.from(this.triggers.values()).filter(t => t.workflowId === workflowId);
  }

  async getUserTriggers(userId: string): Promise<TriggerDefinition[]> {
    return Array.from(this.triggers.values()).filter(t => t.metadata && t.metadata['userId'] === userId);
  }

  async getTriggersByType(type: TriggerType): Promise<TriggerDefinition[]> {
    return Array.from(this.triggers.values()).filter(t => t.type === type);
  }

  async getTriggersByStatus(status: TriggerStatus): Promise<TriggerDefinition[]> {
    return Array.from(this.triggers.values()).filter(t => t.status === status);
  }

  async getActiveTriggers(): Promise<TriggerDefinition[]> {
    return this.getTriggersByStatus(TriggerStatus.ACTIVE);
  }
}
