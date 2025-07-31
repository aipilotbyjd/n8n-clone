import { Injectable, Logger } from '@nestjs/common';

export interface WorkflowState {
  executionId: string;
  workflowId: string;
  currentNodeId?: string;
  status: string;
  data: Record<string, any>;
  variables: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class StateManagementService {
  private readonly logger = new Logger(StateManagementService.name);
  private readonly states = new Map<string, WorkflowState>();

  async saveState(executionId: string, state: Partial<WorkflowState>): Promise<void> {
    this.logger.debug(`Saving state for execution ${executionId}`);
    
    const existingState = this.states.get(executionId);
    const newState: WorkflowState = {
      ...existingState,
      ...state,
      executionId,
      updatedAt: new Date(),
      createdAt: existingState?.createdAt || new Date(),
    } as WorkflowState;

    this.states.set(executionId, newState);
  }

  async getState(executionId: string): Promise<WorkflowState | null> {
    return this.states.get(executionId) || null;
  }

  async deleteState(executionId: string): Promise<void> {
    this.logger.debug(`Deleting state for execution ${executionId}`);
    this.states.delete(executionId);
  }

  async getAllStates(): Promise<WorkflowState[]> {
    return Array.from(this.states.values());
  }
}
