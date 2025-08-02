import { ICommand } from '@nestjs/cqrs';
import { TriggerType } from '@n8n-clone/domain/triggers';

export class CreateTriggerCommand implements ICommand {
  constructor(
    public readonly workflowId: string,
    public readonly type: TriggerType,
    public readonly name: string,
    public readonly configuration: Record<string, any>,
  ) {}
}
