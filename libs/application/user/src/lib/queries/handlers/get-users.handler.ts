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

  async execute(query: GetUsersQuery) {
    const users = await this.userRepository.findAll();
    return users.map(user => user.toJSON());
  }
}
