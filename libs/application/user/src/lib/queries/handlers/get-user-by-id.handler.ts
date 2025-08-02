import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetUserByIdQuery } from '../get-user-by-id.query';
import { UserEntity, IUserRepository } from '@n8n-clone/domain/user';
import { USER_REPOSITORY } from '@n8n-clone/shared/common';

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
