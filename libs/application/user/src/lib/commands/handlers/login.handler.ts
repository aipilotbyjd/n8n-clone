import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException, Inject } from '@nestjs/common';
import { LoginCommand } from '../login.command';
import { UserEntity, IUserRepository } from '@n8n-clone/domain/user';
import { JwtAuthService, LoginResult } from '@n8n-clone/infrastructure/security';
import { USER_REPOSITORY } from '@n8n-clone/shared/common';

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

    // Generate tokens and return login result
    const { accessToken, refreshToken } = await this.jwtAuthService.generateTokens({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      workspaceId: undefined,
      profile: {
        avatar: undefined,
        timezone: 'UTC',
        language: 'en',
        department: undefined,
        jobTitle: undefined,
        phoneNumber: undefined,
        bio: undefined,
      },
      preferences: {
        theme: 'light' as const,
        emailNotifications: true,
        slackNotifications: false,
        webhookNotifications: true,
        executionNotifications: true,
        marketingEmails: false,
      },
      security: {
        mfaEnabled: false,
        mfaSecret: undefined,
        backupCodes: undefined,
        passwordLastChanged: new Date(),
        loginAttempts: 0,
        lockedUntil: undefined,
        sessionTimeout: 1440,
      },
      lastLoginAt: undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as any);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        role: user.role,
        workspaceId: undefined,
        profile: {
          avatar: undefined,
          timezone: 'UTC',
          language: 'en',
          department: undefined,
          jobTitle: undefined,
          phoneNumber: undefined,
          bio: undefined,
        },
        preferences: {
          theme: 'light' as const,
          emailNotifications: true,
          slackNotifications: false,
          webhookNotifications: true,
          executionNotifications: true,
          marketingEmails: false,
        },
        security: {
          mfaEnabled: false,
          mfaSecret: undefined,
          backupCodes: undefined,
          passwordLastChanged: new Date(),
          loginAttempts: 0,
          lockedUntil: undefined,
          sessionTimeout: 1440,
        },
        lastLoginAt: undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes
    };
  }
}
