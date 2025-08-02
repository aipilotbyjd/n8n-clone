import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { AuthenticateUserQuery } from '../authenticate-user.query';
import { AuthResponseDto } from '@n8n-clone/shared/types';

@Injectable()
@QueryHandler(AuthenticateUserQuery)
export class AuthenticateUserHandler implements IQueryHandler<AuthenticateUserQuery> {
  constructor() {}

  async execute(query: AuthenticateUserQuery): Promise<AuthResponseDto> {
    const { email, password } = query;
    // TODO: Implement authentication logic
    console.log(`Authenticating user: ${email}`);
    
    return {
      user: {
        id: '1',
        email,
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh-token'
    };
  }
}
