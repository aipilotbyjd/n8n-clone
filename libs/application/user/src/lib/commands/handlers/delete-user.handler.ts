import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { DeleteUserCommand } from '../delete-user.command';

@Injectable()
@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor() {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const { userId } = command;
    // TODO: Implement user deletion logic
    console.log(`Deleting user: ${userId}`);
  }
}
