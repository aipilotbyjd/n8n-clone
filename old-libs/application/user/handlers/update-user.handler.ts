import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from '../commands/update-user.command';
import { UserResponseDto } from '../dtos/create-user.dto';
import { NotFoundException, Injectable } from '@nestjs/common';
import { UserStoreService } from '../services/user-store.service';

@Injectable()
@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(private readonly userStore: UserStoreService) {}

  async execute(command: UpdateUserCommand): Promise<UserResponseDto> {
    const { userId, updates } = command;

    const user = this.userStore.getUser(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Update user
    Object.assign(user, updates, { updatedAt: new Date() });
    
    if (updates.firstName || updates.lastName) {
      user.fullName = `${user.firstName} ${user.lastName}`.trim();
    }

    this.userStore.saveUser(user);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      isActive: user.status === 'active',
      isEmailVerified: user.isEmailVerified,
      canLogin: user.isActive && user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      workspaceIds: user.workspaceIds,
      preferences: user.preferences
    };
  }
}
