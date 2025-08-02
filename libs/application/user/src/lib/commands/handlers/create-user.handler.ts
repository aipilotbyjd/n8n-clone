import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject } from '@nestjs/common';
import { CreateUserCommand } from '../create-user.command';
import { UserEntity, IUserRepository } from '@n8n-clone/domain/user';
import { JwtAuthService } from '@n8n-clone/infrastructure/security';
import { Id } from '@n8n-clone/domain/core';

export const USER_REPOSITORY = 'USER_REPOSITORY';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.jwtAuthService.hashPassword(command.password);

    // Create new user entity
    const userId = Id.generate().toString();
    const user = new UserEntity(
      userId,
      command.email,
      command.firstName,
      command.lastName,
      hashedPassword,
      command.role,
    );

    // Save user
    await this.userRepository.save(user);

    return userId;
  }
}
