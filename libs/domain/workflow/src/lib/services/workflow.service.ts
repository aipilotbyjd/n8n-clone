import { Injectable } from '@nestjs/common';
import { Workflow } from '@n8n-clone/shared/types';

@Injectable()
export class WorkflowService {
  private workflows: Workflow[] = [];

  getAll(): Workflow[] {
    return this.workflows;
  }

  getById(id: string): Workflow | undefined {
    return this.workflows.find(workflow => workflow.id === id);
  }

  create(workflow: Workflow): void {
    this.workflows.push(workflow);
  }

  update(id: string, updatedWorkflow: Partial<Workflow>): void {
    const workflowIndex = this.workflows.findIndex(workflow => workflow.id === id);
    if (workflowIndex !== -1) {
      this.workflows[workflowIndex] = { ...this.workflows[workflowIndex], ...updatedWorkflow };
    }
  }

  delete(id: string): void {
    this.workflows = this.workflows.filter(workflow => workflow.id !== id);
  }
}

