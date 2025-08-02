import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException, Inject } from '@nestjs/common';
import { LoginCommand } from '../login.command';
import { IUserRepository } from '@n8n-clone/domain/user';
import { JwtAuthService, LoginResult } from '@n8n-clone/infrastructure/security';
import { USER_REPOSITORY } from './create-user.handler';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    // Find user by email
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    // Verify password
    const isPasswordValid = await this.jwtAuthService.comparePassword(
      command.password,
      user.hashedPassword,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token and return login result
    return this.jwtAuthService.login({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
