import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateUserCommand } from '../update-user.command';
import { IUserRepository } from '@n8n-clone/domain/user';
import { USER_REPOSITORY } from '@n8n-clone/shared/common';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UpdateUserCommand): Promise<void> {
    const user = await this.userRepository.findById(command.id);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user properties
    if (command.email) user.updateProfile(user.firstName, user.lastName);
    if (command.firstName || command.lastName) {
      user.updateProfile(command.firstName || user.firstName, command.lastName || user.lastName);
    }
    if (command.role) user.changeRole(command.role);
    if (command.isActive !== undefined) {
      command.isActive ? user.activate() : user.deactivate();
    }

    await this.userRepository.save(user);
  }
}
