import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateUserCommand,
  UpdateUserCommand,
  DeleteUserCommand,
  GetUserQuery,
  GetUsersQuery,
  AuthenticateUserQuery,
  CreateUserDto,
  UpdateUserDto,
  LoginDto,
  UserResponseDto,
  AuthResponseDto,
} from '@n8n-clone/application/user';
import { UserRole } from '@n8n-clone/shared/types';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Creating user: ${dto.email}`);

    const command = new CreateUserCommand(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName,
      dto.role || UserRole.VIEWER,
      dto.workspaceId
    );

    return await this.commandBus.execute(command);
  }

  async getUserById(userId: string): Promise<UserResponseDto> {
    const query = new GetUserQuery(userId);
    const user = await this.queryBus.execute(query);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    const query = new GetUserQuery(undefined, email);
    return await this.queryBus.execute(query);
  }

  async getUsers(
    limit = 50,
    offset = 0,
    filters?: {
      role?: string;
      status?: string;
      search?: string;
      workspaceId?: string;
    }
  ): Promise<{ users: UserResponseDto[]; total: number }> {
    const query = new GetUsersQuery(limit, offset, filters);
    return await this.queryBus.execute(query);
  }

  async updateUser(userId: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Updating user: ${userId}`);

    const command = new UpdateUserCommand(userId, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      role: dto.role,
      status: dto.isActive !== undefined ? (dto.isActive ? 'active' : 'inactive') : dto.status,
      preferences: dto.preferences,
    });
    
    return await this.commandBus.execute(command);
  }

  async deleteUser(userId: string): Promise<void> {
    this.logger.log(`Deleting user: ${userId}`);

    const command = new DeleteUserCommand(userId);
    await this.commandBus.execute(command);
  }

  async authenticateUser(dto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log(`Authenticating user: ${dto.email}`);

    const query = new AuthenticateUserQuery(dto.email, dto.password);
    return await this.queryBus.execute(query);
  }

  async activateUser(userId: string): Promise<UserResponseDto> {
    return this.updateUser(userId, { status: 'active' });
  }

  async deactivateUser(userId: string): Promise<UserResponseDto> {
    return this.updateUser(userId, { status: 'inactive' });
  }

  async changeUserRole(userId: string, role: UserRole): Promise<UserResponseDto> {
    return this.updateUser(userId, { role });
  }

  async resetPassword(email: string): Promise<void> {
    this.logger.log(`Password reset requested for: ${email}`);
    
    // In a real implementation, this would:
    // 1. Generate a reset token
    // 2. Store it in the database with expiration
    // 3. Send email with reset link
    // 4. Handle the reset process
    
    const user = await this.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return;
    }

    // Send reset email logic would go here
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    this.logger.log(`Changing password for user: ${userId}`);

    // In a real implementation, this would:
    // 1. Verify current password
    // 2. Hash new password
    // 3. Update user record
    // 4. Invalidate existing sessions/tokens

    const user = await this.getUserById(userId);
    // Password change logic would go here
  }
}
