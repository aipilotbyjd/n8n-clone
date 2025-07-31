import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../commands/delete-user.command';
import { NotFoundException, Injectable } from '@nestjs/common';
import { UserStoreService } from '../services/user-store.service';

@Injectable()
@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly userStore: UserStoreService) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const { userId } = command;

    if (!this.userStore.hasUser(userId)) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    this.userStore.deleteUser(userId);
  }
}
