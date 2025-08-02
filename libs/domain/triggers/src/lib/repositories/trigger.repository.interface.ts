import { Trigger, TriggerStatus, TriggerType } from '../entities/trigger.entity';

export interface ITriggerRepository {
  save(trigger: Trigger): Promise<Trigger>;
  findById(id: string): Promise<Trigger | null>;
  findByWorkflowId(workflowId: string): Promise<Trigger[]>;
  findByStatus(status: TriggerStatus): Promise<Trigger[]>;
  findByType(type: TriggerType): Promise<Trigger[]>;
  findActiveTriggers(): Promise<Trigger[]>;
  findTriggersReadyToExecute(): Promise<Trigger[]>;
  update(trigger: Trigger): Promise<Trigger>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Trigger[]>;
}
