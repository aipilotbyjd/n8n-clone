import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from '../queries/get-user.query';
import { UserResponseDto } from '../dtos/create-user.dto';
import { Injectable } from '@nestjs/common';
import { UserStoreService } from '../services/user-store.service';

@Injectable()
@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly userStore: UserStoreService) {}

  async execute(query: GetUserQuery): Promise<UserResponseDto | null> {
    const { userId, email } = query;

    let user: any;
    
    if (userId) {
      user = this.userStore.getUser(userId);
    } else if (email) {
      user = this.userStore.getUserByEmail(email);
    }

    if (!user) {
      return null;
    }

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
