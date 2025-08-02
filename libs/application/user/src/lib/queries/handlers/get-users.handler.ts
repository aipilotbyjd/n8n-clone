import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUsersQuery } from '../get-users.query';
import { UserEntity, IUserRepository } from '@n8n-clone/domain/user';
import { USER_REPOSITORY } from '@n8n-clone/shared/common';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUsersQuery): Promise<{ users: any[]; total: number }> {
    const { limit, offset, filters } = query;
    // TODO: Implement proper pagination and filtering
    console.log(`Getting users with limit: ${limit}, offset: ${offset}, filters:`, filters);
    const users = await this.userRepository.findAll();
    return {
      users: users.map(user => user.toJSON()),
      total: users.length
    };
  }
}
