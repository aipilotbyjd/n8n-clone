import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetUserQuery } from '../get-user.query';
import { User } from '@n8n-clone/shared/types';

@Injectable()
@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor() {}

  async execute(query: GetUserQuery): Promise<User | null> {
    const { userId, email } = query;
    // TODO: Implement user retrieval logic
    console.log(`Getting user by ${userId ? 'ID: ' + userId : 'email: ' + email}`);
    return null;
  }
}
