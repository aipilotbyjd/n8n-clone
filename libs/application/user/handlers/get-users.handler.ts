import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUsersQuery } from '../queries/get-users.query';
import { UserResponseDto } from '../dtos/create-user.dto';
import { Injectable } from '@nestjs/common';
import { UserStoreService } from '../services/user-store.service';

@Injectable()
@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(private readonly userStore: UserStoreService) {}

  async execute(query: GetUsersQuery): Promise<{ users: UserResponseDto[]; total: number }> {
    const { limit, offset, filters } = query;

    let allUsers = this.userStore.getAllUsers();

    // Apply filters
    if (filters) {
      if (filters.role) {
        allUsers = allUsers.filter(user => user.role === filters.role);
      }
      if (filters.status) {
        allUsers = allUsers.filter(user => user.status === filters.status);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        allUsers = allUsers.filter(user => 
          user.email.toLowerCase().includes(search) ||
          user.firstName.toLowerCase().includes(search) ||
          user.lastName.toLowerCase().includes(search) ||
          user.fullName.toLowerCase().includes(search)
        );
      }
      if (filters.workspaceId) {
        allUsers = allUsers.filter(user => user.workspaceIds.includes(filters.workspaceId));
      }
    }

    const total = allUsers.length;
    const users = allUsers
      .slice(offset, offset + limit)
      .map(user => ({
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
      }));

    return { users, total };
  }
}
