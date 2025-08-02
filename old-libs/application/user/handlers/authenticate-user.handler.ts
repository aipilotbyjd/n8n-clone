import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AuthenticateUserQuery } from '../queries/authenticate-user.query';
import { AuthResponseDto } from '../dtos/auth.dto';
import { UnauthorizedException, Injectable } from '@nestjs/common';
import { UserStoreService } from '../services/user-store.service';

@Injectable()
@QueryHandler(AuthenticateUserQuery)
export class AuthenticateUserHandler implements IQueryHandler<AuthenticateUserQuery> {
  constructor(private readonly userStore: UserStoreService) {}

  async execute(query: AuthenticateUserQuery): Promise<AuthResponseDto> {
    const { email, password } = query;

    const user = this.userStore.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Simple password check (in real implementation, use bcrypt)
    if (user.passwordHash !== `hashed-${password}`) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.canLogin) {
      throw new UnauthorizedException('Account is not active or email not verified');
    }

    // Update last login
    user.lastLoginAt = new Date();
    this.userStore.saveUser(user);

    // Generate mock tokens (in real implementation, use JWT)
    const token = `jwt-token-${user.id}-${Date.now()}`;
    const refreshToken = `refresh-${user.id}-${Date.now()}`;

    return {
      user: {
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
        lastLoginAt: user.lastLoginAt,
        emailVerifiedAt: user.emailVerifiedAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        workspaceIds: user.workspaceIds,
        preferences: user.preferences
      },
      token,
      refreshToken,
      expiresIn: 3600 // 1 hour
    };
  }
}
