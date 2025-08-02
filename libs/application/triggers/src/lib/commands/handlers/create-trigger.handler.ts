import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateTriggerCommand } from '../create-trigger.command';
import { Trigger } from '@n8n-clone/domain/triggers';
import { ITriggerRepository } from '@n8n-clone/domain/triggers';

@Injectable()
@CommandHandler(CreateTriggerCommand)
export class CreateTriggerHandler implements ICommandHandler<CreateTriggerCommand> {
  constructor(private readonly triggerRepository: ITriggerRepository) {}

  async execute(command: CreateTriggerCommand): Promise<string> {
    const { workflowId, type, name, configuration } = command;

    const trigger = new Trigger(
      Math.random().toString(36).substr(2, 9), // Generate ID
      workflowId,
      type,
      name,
      configuration,
    );

    await this.triggerRepository.save(trigger);
    return trigger.id;
  }
}
