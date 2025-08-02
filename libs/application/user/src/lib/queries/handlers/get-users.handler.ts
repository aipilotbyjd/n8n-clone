import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUsersQuery } from '../get-users.query';
import { IUserRepository } from '@n8n-clone/domain/user';
import { USER_REPOSITORY } from '../../commands/handlers/create-user.handler';

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
