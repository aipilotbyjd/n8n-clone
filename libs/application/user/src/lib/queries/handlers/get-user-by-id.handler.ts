import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserByIdQuery } from '../get-user-by-id.query';
import { IUserRepository } from '@n8n-clone/domain/user';
import { USER_REPOSITORY } from '../../commands/handlers/create-user.handler';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserByIdQuery) {
    const user = await this.userRepository.findById(query.id);
    return user ? user.toJSON() : null;
  }
}
