import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateVariableCommand } from '../create-variable.command';
import { Variable } from '@n8n-clone/domain/variables';
import { IVariableRepository } from '@n8n-clone/domain/variables';

@Injectable()
@CommandHandler(CreateVariableCommand)
export class CreateVariableHandler implements ICommandHandler<CreateVariableCommand> {
  constructor(private readonly variableRepository: IVariableRepository) {}

  async execute(command: CreateVariableCommand): Promise<string> {
    const { name, value, type, scope, isProtected } = command;

    const variable = new Variable(
      Math.random().toString(36).substr(2, 9), // Generate ID
      name,
      value,
      type,
      scope,
      isProtected,
    );

    await this.variableRepository.save(variable);
    return variable.id;
  }
}
