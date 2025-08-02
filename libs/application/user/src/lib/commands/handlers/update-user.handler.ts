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
    const { updates } = command;
    if (updates.email) user.updateEmail(updates.email);
    if (updates.firstName || updates.lastName) {
      user.updateProfile(updates.firstName || user.firstName, updates.lastName || user.lastName);
    }
    if (updates.role) user.changeRole(updates.role);
    if (updates.status !== undefined) {
      updates.status === 'active' ? user.activate() : user.deactivate();
    }

    await this.userRepository.save(user);
  }
}
