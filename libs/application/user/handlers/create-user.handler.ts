import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../commands/create-user.command';
import { UserResponseDto } from '../dtos/create-user.dto';
import { ConflictException, Injectable } from '@nestjs/common';
import { UserStoreService } from '../services/user-store.service';

@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly userStore: UserStoreService) {}

  async execute(command: CreateUserCommand): Promise<UserResponseDto> {
    const { email, password, firstName, lastName, role = 'user' } = command;

    // Check if user already exists
    if (this.userStore.hasUserByEmail(email)) {
      throw new ConflictException('User with this email already exists');
    }

    // Create user
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      id: userId,
      email,
      passwordHash: `hashed-${password}`, // In real implementation, hash password
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      role,
      status: 'inactive',
      isActive: false,
      isEmailVerified: false,
      canLogin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      workspaceIds: [],
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          browser: true,
          slack: false
        },
        workflow: {
          autoSave: true,
          showNodeDetails: true,
          gridSize: 20
        }
      }
    };

    this.userStore.saveUser(user);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      canLogin: user.canLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      workspaceIds: user.workspaceIds,
      preferences: user.preferences
    };
  }
}
